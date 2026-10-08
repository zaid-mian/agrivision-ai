# AI Agriculture Advisor

A full-stack AI platform for Pakistani farmers: crop recommendation, **on-device plant disease detection**, fertilizer planning, farm health scoring, and a bilingual (Urdu/English) farming assistant.

## The honest story

This project started as a Google AI Studio scaffold. The valuable parts — the farmer-focused feature set, the Urdu localization, the Pakistan-specific agronomy — were kept. The AI claims were rebuilt to be genuine:

- **Disease detection is a real trained model**, not an API call. MobileNetV3-Small, transfer-learned on a PlantVillage subset (13 classes: maize, potato, tomato, pepper), exported to ONNX, running locally in the Express server via `onnxruntime-node`. No API key. Works offline.
- The old fallback that **picked a random disease from a filename hash** is gone. When the model is uncertain, it says so.

## Disease model — measured, not claimed

| Item | Detail |
|---|---|
| Architecture | MobileNetV3-Small (ImageNet-pretrained, backbone frozen, classifier head trained) |
| Dataset | PlantVillage subset, Hughes & Salathé (CC-BY-SA-3.0), 13 classes: 8,060 train / 1,418 test |
| Split | Seeded 85/15 stratified train/test |
| Test accuracy | **95.1%** (1,418 held-out images — see `ml/disease_model/eval/metrics.json`) |
| Macro F1 | **0.946** |
| Weakest class | Corn Northern Leaf Blight (recall 0.825) — reported, not hidden |
| Inference | ONNX Runtime, CPU, ~50ms per image |

Per-class precision/recall and the confusion matrix are in `ml/disease_model/eval/metrics.json`. Retrain with:

```bash
cd ml/disease_model
python download_data.py     # fetch PlantVillage subset from HuggingFace
python train.py             # transfer learning, CPU
python evaluate.py          # writes eval/metrics.json
python export_onnx.py       # -> disease_model.onnx (verified vs torch)
```

### Diagnosis pipeline (`POST /api/disease/predict`)

1. **Local ONNX model first.** If confidence ≥ 0.60 → returned with `"source": "local-model"`.
2. **Gemini vision as second opinion** when local confidence is low and an API key is configured → `"source": "ai-vision"`.
3. **Honest uncertainty** otherwise → `"source": "uncertain"`, advises a clearer photo or an extension officer. Never invents a diagnosis.

### Limitations (read before citing this)

- Trained on PlantVillage **lab-condition** images (single leaf, clean background). Field photos with cluttered backgrounds will score lower — the `uploads/` folder is the seed of a real field dataset.
- 13 classes only (maize, potato, tomato, pepper). Wheat, rice, and cotton — Pakistan's main crops — are **not** covered by the local model; those fall back to the vision API or honest uncertainty.
- The farming assistant's retrieval is currently keyword-based over `farming_faq.json`; a vector-retrieval upgrade is planned.

## Other features

- Crop & fertilizer recommenders (agronomic scoring tables for Pakistani conditions)
- Weather, farm health score, PDF reports, dashboard charts
- JWT auth, Urdu/English i18n with voice input support

## Run locally

```bash
npm install
# optional: GEMINI_API_KEY / OPENROUTER_API_KEY in .env for the vision second opinion
npm run dev
```

For the local disease model, place `disease_model.onnx` in `ml/disease_model/` (built by `export_onnx.py`).

## License

MIT — Muhammad Zaid Tahir, 2026. PlantVillage dataset © Hughes & Salathé, CC-BY-SA-3.0.
