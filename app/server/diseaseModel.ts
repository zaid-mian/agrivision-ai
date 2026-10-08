/**
 * Local leaf-disease classifier (ONNX Runtime).
 *
 * Model: MobileNetV3-Small, transfer-learned on a PlantVillage subset
 * (13 classes: maize, potato, tomato, pepper). Trained on CPU, exported
 * to ONNX — no API key, no GPU, works offline.
 *
 * See ml/disease_model/ for training code and eval/metrics.json for the
 * measured test accuracy. This module is the reason the "AI disease
 * detection" claim is genuine: every prediction below comes from a model
 * whose accuracy was measured on a held-out test set.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type OrtModule = typeof import("onnxruntime-node");
type SharpModule = typeof import("sharp");

let ort: OrtModule | null = null;
let sharp: SharpModule | null = null;
let session: import("onnxruntime-node").InferenceSession | null = null;
let classes: string[] = [];
let diseaseInfo: Record<string, any> = {};
let ready: Promise<boolean> | null = null;

const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

function findModelDir(): string | null {
  const candidates: string[] = [
    path.join(process.cwd(), "ml", "disease_model"),
    path.join(process.cwd(), "..", "ml", "disease_model"),
    path.resolve(process.cwd(), "ml", "disease_model"),
    path.resolve(process.cwd(), "..", "ml", "disease_model"),
  ];

  try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    candidates.push(path.resolve(currentDir, "../../ml/disease_model"));
    candidates.push(path.resolve(currentDir, "../../../ml/disease_model"));
  } catch {}

  for (const cand of candidates) {
    const modelPath = path.join(cand, "disease_model.onnx");
    const classesPath = path.join(cand, "checkpoints", "classes.json");
    if (fs.existsSync(modelPath) && fs.existsSync(classesPath)) {
      return cand;
    }
  }
  return null;
}

export function ensureLoaded(): Promise<boolean> {
  if (ready) return ready;
  ready = (async () => {
    try {
      ort = await import("onnxruntime-node");
      sharp = (await import("sharp")).default as unknown as SharpModule;
      const modelDir = findModelDir();
      if (!modelDir) {
        console.warn("[diseaseModel] ONNX model not found in any expected directory — local inference disabled.");
        return false;
      }
      const modelPath = path.join(modelDir, "disease_model.onnx");
      const classesPath = path.join(modelDir, "checkpoints", "classes.json");
      const infoPath = path.join(modelDir, "disease_info.json");

      session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ["cpu"],
      });
      classes = JSON.parse(fs.readFileSync(classesPath, "utf-8"));
      if (fs.existsSync(infoPath)) {
        diseaseInfo = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
      }
      console.log(`[diseaseModel] loaded ${classes.length}-class ONNX model from ${modelDir}.`);
      return true;
    } catch (err) {
      console.warn("[diseaseModel] local inference unavailable:", (err as Error).message);
      return false;
    }
  })();
  return ready;
}

export interface PredictionClass {
  classId: string;
  disease: string;
  confidence: number;
}

export interface LocalPrediction {
  classId: string;
  confidence: number;
  disease: string;
  severity: "low" | "medium" | "high";
  treatment: string;
  prevention: string;
  inferenceTimeMs: number;
  top3: PredictionClass[];
  heatmapPath?: string;
}

/**
 * Generate a color-based lesion highlight overlay (visual aid only).
 *
 * This is a simple pixel heuristic — redness and loss of green vs a
 * chlorophyll baseline — drawn as a thermal-style overlay to help the eye
 * spot necrotic/chlorotic regions. It does NOT show where the neural
 * network looked: no Grad-CAM or activation mapping is performed (the ONNX
 * session here only returns final class logits).
 */
async function generateLesionHighlight(
  imagePath: string,
  rawBuffer: Buffer
): Promise<string | undefined> {
  if (!sharp) return undefined;
  try {
    const width = 224;
    const height = 224;
    // Create an RGBA buffer for thermal overlay
    const overlay = Buffer.alloc(width * height * 4);

    for (let i = 0; i < width * height; i++) {
      const r = rawBuffer[i * 3];
      const g = rawBuffer[i * 3 + 1];
      const b = rawBuffer[i * 3 + 2];

      // Lesion metric: necrosis / chlorosis detection vs green chlorophyll baseline
      const necrosis = Math.max(0, r - g) * 1.6 + Math.max(0, 180 - g) * 0.8;
      const intensity = Math.min(255, Math.max(0, Math.floor(necrosis)));

      if (intensity > 45) {
        // High attention zone: thermal gradient (yellow to intense red)
        overlay[i * 4] = 239; // Red
        overlay[i * 4 + 1] = Math.floor(255 - intensity * 0.8); // Green
        overlay[i * 4 + 2] = 38; // Blue
        overlay[i * 4 + 3] = Math.min(180, Math.floor(intensity * 0.85)); // Alpha
      } else {
        // Cold / normal zone: transparent
        overlay[i * 4] = 0;
        overlay[i * 4 + 1] = 0;
        overlay[i * 4 + 2] = 0;
        overlay[i * 4 + 3] = 0;
      }
    }

    const overlayPng = await sharp(overlay, {
      raw: { width, height, channels: 4 }
    }).png().toBuffer();

    const outputDir = path.dirname(imagePath);
    const parsed = path.parse(imagePath);
    const heatmapFileName = `${parsed.name}_heatmap.png`;
    const heatmapFullPath = path.join(outputDir, heatmapFileName);

    // Composite thermal overlay onto resized base leaf image
    await sharp(imagePath)
      .resize(width, height)
      .composite([{ input: overlayPng, blend: "over" }])
      .png()
      .toFile(heatmapFullPath);

    return `/uploads/${heatmapFileName}`;
  } catch (err) {
    console.warn("[diseaseModel] heatmap overlay generation skipped:", (err as Error).message);
    return undefined;
  }
}

/**
 * Run the local ONNX classifier on an uploaded leaf image.
 * Returns null when the model isn't available (caller falls back).
 */
export async function predictLocal(imagePath: string): Promise<LocalPrediction | null> {
  if (!(await ensureLoaded()) || !session || !sharp || !ort) return null;

  const startTime = Date.now();

  // 224x224 RGB, ImageNet normalization — must match training preprocessing
  const raw = await sharp(imagePath).resize(224, 224).removeAlpha().raw().toBuffer();
  const float32 = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    for (let c = 0; c < 3; c++) {
      float32[c * 224 * 224 + i] =
        (raw[i * 3 + c] / 255 - IMAGENET_MEAN[c]) / IMAGENET_STD[c];
    }
  }
  const tensor = new ort.Tensor("float32", float32, [1, 3, 224, 224]);
  const out = await session.run({ input: tensor });
  const logits = Array.from(out["logits"].data as Float32Array);

  // Softmax
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((v) => v / sum);

  // Ranked predictions
  const ranked = probs
    .map((prob, idx) => ({ idx, prob }))
    .sort((a, b) => b.prob - a.prob);

  const bestIdx = ranked[0].idx;
  const classId = classes[bestIdx];
  const info = diseaseInfo[classId] || {};
  const sev = String(info.severity || "medium").toLowerCase();

  const top3: PredictionClass[] = ranked.slice(0, 3).map((item) => {
    const cId = classes[item.idx];
    const cInfo = diseaseInfo[cId] || {};
    return {
      classId: cId,
      disease: cInfo.display || cId.replace(/_/g, " "),
      confidence: Math.round(item.prob * 100) / 100,
    };
  });

  const inferenceTimeMs = Math.max(1, Date.now() - startTime);
  const heatmapPath = await generateLesionHighlight(imagePath, raw);

  return {
    classId,
    confidence: Math.round(probs[bestIdx] * 100) / 100,
    disease: info.display || classId.replace(/_/g, " "),
    severity: sev === "high" || sev === "low" ? (sev as "high" | "low") : "medium",
    treatment: info.treatment || "Consult a local agricultural extension officer for treatment advice.",
    prevention: info.prevention || "Monitor the crop regularly for early signs of disease.",
    inferenceTimeMs,
    top3,
    heatmapPath,
  };
}
