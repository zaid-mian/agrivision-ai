import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { dbService } from "../server/db";

describe("SQLite Relational Database & Repository Layer", () => {
  test("creates and retrieves a farmer profile", () => {
    const testId = "test_farmer_" + Date.now();
    const testEmail = `farmer_${Date.now()}@agrivision.pk`;

    dbService.createUser({
      id: testId,
      name: "Tariq Mahmood",
      email: testEmail,
      location: "Faisalabad, Punjab",
      passwordHash: "hashed_test_pass",
      createdAt: new Date().toISOString()
    });

    const user = dbService.getUserByEmail(testEmail);
    assert.ok(user !== undefined, "User should be found in SQLite database");
    assert.equal(user?.name, "Tariq Mahmood");
    assert.equal(user?.location, "Faisalabad, Punjab");
  });

  test("persists disease scans with top-3 candidates and latency", () => {
    const scanId = "scan_" + Date.now();
    const userId = "farmer_test_user";

    dbService.saveDiseaseScan({
      id: scanId,
      userId: userId,
      imagePath: "/uploads/test_leaf.jpg",
      disease: "Tomato Late Blight",
      confidence: 0.94,
      severity: "high",
      treatment: "Apply copper fungicide",
      prevention: "Avoid overhead watering",
      source: "local-model",
      top3: [{ disease: "Tomato Late Blight", confidence: 0.94 }],
      inferenceTimeMs: 42
    });

    const history = dbService.getDiseaseHistory(userId);
    assert.ok(history.length > 0, "Scan history must contain recorded entries");
    const found = history.find(s => s.id === scanId);
    assert.ok(found !== undefined, "Inserted scan must be returned");
    assert.equal(found?.disease, "Tomato Late Blight");
    assert.equal(found?.inferenceTimeMs, 42);
  });
});
