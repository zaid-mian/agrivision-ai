"""Export the trained classifier to ONNX and verify it with onnxruntime.

The Express server loads disease_model.onnx via onnxruntime-node — no
Python, no API key, no GPU needed at inference time.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
import torch

from train import build_model


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--checkpoint", default="checkpoints/best.pt")
    ap.add_argument("--out", default="disease_model.onnx")
    args = ap.parse_args()

    classes = json.loads(Path("checkpoints/classes.json").read_text())
    model = build_model(len(classes))
    model.load_state_dict(torch.load(args.checkpoint, map_location="cpu"))
    model.eval()

    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model, dummy, args.out,
        input_names=["input"], output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
        dynamo=False,
    )
    print("exported", args.out, f"({Path(args.out).stat().st_size / 1e6:.1f} MB)")

    # verify: onnxruntime output matches torch output
    sess = ort.InferenceSession(args.out, providers=["CPUExecutionProvider"])
    with torch.no_grad():
        expected = torch.softmax(model(dummy), dim=1).numpy()
    got = sess.run(["logits"], {"input": dummy.numpy()})[0]
    got = np.exp(got) / np.exp(got).sum(axis=1, keepdims=True)
    diff = float(np.abs(expected - got).max())
    assert diff < 1e-4, f"onnx/torch mismatch: {diff}"
    print(f"verified: max prob diff vs torch = {diff:.2e}")


if __name__ == "__main__":
    main()
