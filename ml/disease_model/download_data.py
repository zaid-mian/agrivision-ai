"""Download PlantVillage subset from HuggingFace (imagefolder mirror).

Source: leoho36/plant_village_dataset (mirror of PlantVillage, Hughes &
Salathe, CC-BY-SA). Selects Pakistan-relevant crops (maize, potato, tomato,
pepper), caps per class, and writes a seeded stratified 85/15
train/test split to data/train/<class>/ + data/test/<class>/.
"""

from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path

# HF folder name -> clean class id (keys of disease_info.json)
CLASSES = {
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Corn___Cercospora_leaf_spot",
    "Corn_(maize)___Common_rust_": "Corn___Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight": "Corn___Northern_Leaf_Blight",
    "Corn_(maize)___healthy": "Corn___healthy",
    "Pepper,_bell___Bacterial_spot": "Pepper_bell___Bacterial_spot",
    "Pepper,_bell___healthy": "Pepper_bell___healthy",
    "Potato___Early_blight": "Potato___Early_blight",
    "Potato___Late_blight": "Potato___Late_blight",
    "Potato___healthy": "Potato___healthy",
    "Tomato___Bacterial_spot": "Tomato___Bacterial_spot",
    "Tomato___Early_blight": "Tomato___Early_blight",
    "Tomato___Late_blight": "Tomato___Late_blight",
    "Tomato___healthy": "Tomato___healthy",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data")
    ap.add_argument("--per-class-cap", type=int, default=800)
    ap.add_argument("--test-frac", type=float, default=0.15)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    from huggingface_hub import snapshot_download

    print("downloading class folders from HuggingFace ...")
    patterns = [f"color/{folder}/*" for folder in CLASSES]
    src = Path(snapshot_download(
        "leoho36/plant_village_dataset", repo_type="dataset",
        allow_patterns=patterns,
    ))

    out = Path(args.out)
    if out.exists():
        shutil.rmtree(out)
    rng = random.Random(args.seed)

    for folder, cls in CLASSES.items():
        files = sorted((src / "color" / folder).glob("*.*"))
        files = [f for f in files if f.suffix.lower() in (".jpg", ".jpeg", ".png")]
        rng.shuffle(files)
        files = files[: args.per_class_cap]
        n_test = max(1, int(len(files) * args.test_frac))
        test_files, train_files = files[:n_test], files[n_test:]
        for split, flist in (("train", train_files), ("test", test_files)):
            dest = out / split / cls
            dest.mkdir(parents=True, exist_ok=True)
            for f in flist:
                shutil.copy(f, dest / f.name)
        print(f"  {cls}: train={len(train_files)} test={len(test_files)}")

    n_train = sum(1 for _ in (out / "train").rglob("*.*"))
    n_test = sum(1 for _ in (out / "test").rglob("*.*"))
    print(f"done: train={n_train} test={n_test} -> {out.resolve()}")


if __name__ == "__main__":
    main()
