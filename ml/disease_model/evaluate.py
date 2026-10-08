"""Evaluate the trained checkpoint on the held-out TEST split.

Writes eval/metrics.json: accuracy, macro F1, per-class precision/recall,
confusion matrix. These are the numbers that make the "AI disease
detection" claim genuine — publish them, don't round them up.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from sklearn.metrics import classification_report, confusion_matrix
from torch.utils.data import DataLoader
from torchvision import datasets

from train import IMAGENET_MEAN, IMAGENET_STD, build_model
from torchvision import transforms


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data")
    ap.add_argument("--checkpoint", default="checkpoints/best.pt")
    ap.add_argument("--out", default="eval/metrics.json")
    ap.add_argument("--batch-size", type=int, default=64)
    args = ap.parse_args()

    device = torch.device("cpu")
    torch.set_num_threads(2)

    tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    test_ds = datasets.ImageFolder(Path(args.data) / "test", transform=tf)
    loader = DataLoader(test_ds, batch_size=args.batch_size, num_workers=2)
    classes = json.loads(Path("checkpoints/classes.json").read_text())
    assert classes == test_ds.classes, "class order mismatch between train and test"

    model = build_model(len(classes))
    model.load_state_dict(torch.load(args.checkpoint, map_location="cpu"))
    model.to(device).eval()

    all_pred, all_true = [], []
    with torch.no_grad():
        for x, y in loader:
            all_pred.extend(model(x.to(device)).argmax(1).tolist())
            all_true.extend(y.tolist())

    report = classification_report(all_true, all_pred, target_names=classes,
                                   output_dict=True, zero_division=0)
    acc = sum(p == t for p, t in zip(all_pred, all_true)) / len(all_true)
    per_class = {
        cls: {"precision": round(report[cls]["precision"], 4),
              "recall": round(report[cls]["recall"], 4),
              "f1": round(report[cls]["f1-score"], 4),
              "support": int(report[cls]["support"])}
        for cls in classes
    }
    metrics = {
        "n_test": len(all_true),
        "accuracy": round(acc, 4),
        "macro_f1": round(report["macro avg"]["f1-score"], 4),
        "per_class": per_class,
        "confusion_matrix": confusion_matrix(all_true, all_pred).tolist(),
        "classes": classes,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(metrics, indent=2))
    print(f"accuracy={acc:.4f} macro_f1={metrics['macro_f1']:.4f} n={len(all_true)}")
    worst = min(per_class.items(), key=lambda kv: kv[1]["recall"])
    print(f"weakest class: {worst[0]} (recall {worst[1]['recall']})")
    print("wrote", out)


if __name__ == "__main__":
    main()
