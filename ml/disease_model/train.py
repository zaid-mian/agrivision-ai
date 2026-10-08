"""Train a leaf-disease classifier via transfer learning (CPU-friendly).

Model: MobileNetV3-Small, ImageNet-pretrained, backbone frozen — only the
classifier head trains. On 2 CPUs this is ~3-4 min/epoch for ~10k images.

Outputs: checkpoints/best.pt, checkpoints/last.pt, training_log.json
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def build_loaders(data_dir: Path, batch_size: int, workers: int):
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    eval_tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])

    class TransformSubset(torch.utils.data.Dataset):
        def __init__(self, base, indices, transform):
            self.base, self.indices, self.transform = base, indices, transform
            self.classes = base.classes

        def __len__(self):
            return len(self.indices)

        def __getitem__(self, i):
            path, target = self.base.samples[self.indices[i]]
            from PIL import Image
            img = Image.open(path).convert("RGB")
            return self.transform(img), target

    base = datasets.ImageFolder(data_dir / "train")
    from sklearn.model_selection import train_test_split
    train_idx, val_idx = train_test_split(
        range(len(base)), test_size=0.1, random_state=42, stratify=base.targets
    )
    train_ds = TransformSubset(base, train_idx, train_tf)
    val_ds = TransformSubset(base, val_idx, eval_tf)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                              num_workers=workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False,
                            num_workers=workers)
    return train_loader, val_loader, train_ds.classes, train_ds


def build_model(n_classes: int) -> nn.Module:
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    for p in model.features.parameters():
        p.requires_grad = False
    in_f = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_f, n_classes)
    return model


@torch.no_grad()
def evaluate(model, loader, device):
    model.eval()
    correct, total, loss_sum = 0, 0, 0.0
    criterion = nn.CrossEntropyLoss()
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        out = model(x)
        loss_sum += criterion(out, y).item() * len(y)
        correct += (out.argmax(1) == y).sum().item()
        total += len(y)
    return loss_sum / total, correct / total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data")
    ap.add_argument("--epochs", type=int, default=12)
    ap.add_argument("--batch-size", type=int, default=32)
    ap.add_argument("--lr", type=float, default=3e-3)
    ap.add_argument("--workers", type=int, default=2)
    ap.add_argument("--out", default="checkpoints")
    args = ap.parse_args()

    torch.manual_seed(42)
    torch.set_num_threads(2)
    device = torch.device("cpu")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    train_loader, val_loader, classes, train_ds = build_loaders(Path(args.data), args.batch_size, args.workers)
    print(f"classes ({len(classes)}): {classes}")
    (out / "classes.json").write_text(json.dumps(classes, indent=2))

    model = build_model(len(classes)).to(device)
    # class weights for the imbalance (e.g. Potato healthy is scarce)
    from collections import Counter
    train_targets = [train_ds.base.targets[i] for i in train_ds.indices]
    counts = Counter(train_targets)
    weights = torch.tensor([len(train_targets) / counts[i] for i in range(len(classes))],
                           dtype=torch.float32).to(device)
    weights = weights / weights.mean()  # keep loss scale stable
    opt = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=args.epochs)
    criterion = nn.CrossEntropyLoss(weight=weights)

    log = {"epochs": [], "classes": classes}
    best_acc, best_state = 0.0, None
    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        model.train()
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            opt.zero_grad()
            loss = criterion(model(x), y)
            loss.backward()
            opt.step()
        sched.step()
        val_loss, val_acc = evaluate(model, val_loader, device)
        log["epochs"].append({"epoch": epoch, "val_loss": round(val_loss, 4),
                              "val_acc": round(val_acc, 4),
                              "seconds": round(time.time() - t0, 1)})
        print(f"epoch {epoch}/{args.epochs} val_acc={val_acc:.4f} ({time.time()-t0:.0f}s)")
        if val_acc > best_acc:
            best_acc = val_acc
            best_state = {k: v.cpu() for k, v in model.state_dict().items()}
        torch.save(model.state_dict(), out / "last.pt")

    torch.save(best_state, out / "best.pt")
    log["best_val_acc"] = round(best_acc, 4)
    (out / "training_log.json").write_text(json.dumps(log, indent=2))
    print(f"best val_acc={best_acc:.4f} -> {out/'best.pt'}")


if __name__ == "__main__":
    main()
