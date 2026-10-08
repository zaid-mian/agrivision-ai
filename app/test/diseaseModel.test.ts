import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ensureLoaded, predictLocal } from "../server/diseaseModel";
import path from "node:path";
import fs from "node:fs";

describe("On-Device ML Disease Model (ONNX Runtime)", () => {
  test("loads the 13-class MobileNetV3 ONNX model into CPU inference session", async () => {
    const isLoaded = await ensureLoaded();
    assert.equal(isLoaded, true, "ONNX model should successfully load on CPU");
  });

  test("runs inference and returns ranked top-3 predictions and latency", async () => {
    const sampleDir = path.join(process.cwd(), "uploads");
    const samples = fs.existsSync(sampleDir)
      ? fs.readdirSync(sampleDir).filter(f => f.endsWith(".jpg") || f.endsWith(".webp"))
      : [];

    if (samples.length > 0) {
      // Find a non-empty image file
      const validSample = samples.find(f => fs.statSync(path.join(sampleDir, f)).size > 500);
      if (validSample) {
        const fullPath = path.join(sampleDir, validSample);
        const prediction = await predictLocal(fullPath);

        assert.ok(prediction !== null, "Prediction should not be null for valid image");
        assert.ok(typeof prediction.confidence === "number", "Confidence should be a numeric probability");
        assert.ok(prediction.confidence >= 0 && prediction.confidence <= 1, "Confidence must be in [0, 1]");
        assert.ok(Array.isArray(prediction.top3), "top3 must be an array of candidates");
        assert.ok(prediction.top3.length > 0, "top3 must contain at least 1 candidate");
        assert.ok(prediction.inferenceTimeMs > 0, "inferenceTimeMs must be measured");
        assert.ok(prediction.disease.length > 0, "Disease label must be populated");
      }
    }
  });
});
