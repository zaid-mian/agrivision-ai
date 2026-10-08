/**
 * Enterprise SQLite Database Layer using Node.js native SQLite engine.
 * 
 * Provides ACID transactions, typed schemas, and automatic migration
 * from legacy farm_database.json without any external database daemon.
 */

import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "agri_advisor.db");
const db = new DatabaseSync(DB_PATH);

// Initialize relational schema with indices
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS disease_scans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    disease TEXT NOT NULL,
    confidence REAL NOT NULL,
    severity TEXT NOT NULL,
    treatment TEXT NOT NULL,
    prevention TEXT NOT NULL,
    source TEXT NOT NULL,
    top3_json TEXT,
    inference_ms INTEGER DEFAULT 0,
    heatmap_path TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_disease_scans_user ON disease_scans(user_id);
  CREATE INDEX IF NOT EXISTS idx_disease_scans_date ON disease_scans(created_at);

  CREATE TABLE IF NOT EXISTS farm_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    acreage REAL DEFAULT 0,
    soil_type TEXT,
    stage TEXT,
    yield_forecast TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_farm_records_user ON farm_records(user_id);

  CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
`);

/**
 * Migrate data from legacy JSON file if SQLite database is empty.
 */
function autoMigrateFromJson() {
  const countRow = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (countRow && countRow.count > 0) {
    return; // Already populated
  }

  const jsonPath = path.join(process.cwd(), "farm_database.json");
  if (!fs.existsSync(jsonPath)) return;

  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const legacy = JSON.parse(raw);

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, location, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    if (Array.isArray(legacy.users)) {
      for (const u of legacy.users) {
        insertUser.run(
          u.id || "_" + Math.random().toString(36).substr(2, 9),
          u.name || "Farmer",
          (u.email || "").toLowerCase(),
          u.location || "Punjab, Pakistan",
          u.passwordHash || "",
          u.createdAt || new Date().toISOString()
        );
      }
    }

    const insertScan = db.prepare(`
      INSERT OR IGNORE INTO disease_scans (
        id, user_id, image_path, disease, confidence, severity, treatment, prevention, source, top3_json, inference_ms, heatmap_path, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    if (Array.isArray(legacy.diseaseResults)) {
      for (const s of legacy.diseaseResults) {
        insertScan.run(
          s.id || "_" + Math.random().toString(36).substr(2, 9),
          s.userId || "anonymous",
          s.imagePath || "",
          s.disease || "Unknown",
          Number(s.confidence) || 0.5,
          s.severity || "medium",
          s.treatment || "",
          s.prevention || "",
          s.source || "local-model",
          JSON.stringify(s.top3 || []),
          Number(s.inferenceTimeMs) || 0,
          s.heatmapPath || null,
          s.date || new Date().toISOString()
        );
      }
    }

    console.log("[SQLite] Auto-migrated legacy records into agri_advisor.db successfully.");
  } catch (err) {
    console.warn("[SQLite] Migration warning:", (err as Error).message);
  }
}

autoMigrateFromJson();

export interface UserRow {
  id: string;
  name: string;
  email: string;
  location: string;
  password_hash: string;
  created_at: string;
}

export interface DiseaseScanRow {
  id: string;
  user_id: string;
  image_path: string;
  disease: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string;
  source: string;
  top3_json: string | null;
  inference_ms: number;
  heatmap_path: string | null;
  created_at: string;
}

export const dbService = {
  // Users
  getUserByEmail(email: string): UserRow | undefined {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as UserRow | undefined;
  },

  getUserById(id: string): UserRow | undefined {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  },

  createUser(user: { id: string; name: string; email: string; location: string; passwordHash: string; createdAt: string }) {
    db.prepare(`
      INSERT INTO users (id, name, email, location, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user.id, user.name, user.email.toLowerCase(), user.location, user.passwordHash, user.createdAt);
  },

  // Disease Scans
  saveDiseaseScan(scan: {
    id: string;
    userId: string;
    imagePath: string;
    disease: string;
    confidence: number;
    severity: string;
    treatment: string;
    prevention: string;
    source: string;
    top3?: any[];
    inferenceTimeMs?: number;
    heatmapPath?: string | null;
    createdAt?: string;
  }) {
    db.prepare(`
      INSERT INTO disease_scans (
        id, user_id, image_path, disease, confidence, severity, treatment, prevention, source, top3_json, inference_ms, heatmap_path, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      scan.id,
      scan.userId,
      scan.imagePath,
      scan.disease,
      scan.confidence,
      scan.severity,
      scan.treatment,
      scan.prevention,
      scan.source,
      JSON.stringify(scan.top3 || []),
      scan.inferenceTimeMs || 0,
      scan.heatmapPath || null,
      scan.createdAt || new Date().toISOString()
    );
  },

  getDiseaseHistory(userId: string): any[] {
    const rows = db.prepare(`
      SELECT * FROM disease_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(userId) as DiseaseScanRow[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      imagePath: r.image_path,
      disease: r.disease,
      confidence: r.confidence,
      severity: r.severity,
      treatment: r.treatment,
      prevention: r.prevention,
      source: r.source,
      top3: r.top3_json ? JSON.parse(r.top3_json) : [],
      inferenceTimeMs: r.inference_ms,
      heatmapPath: r.heatmap_path,
      date: r.created_at
    }));
  },

  deleteDiseaseScan(id: string, userId: string) {
    db.prepare("DELETE FROM disease_scans WHERE id = ? AND user_id = ?").run(id, userId);
  },

  getDiseaseStats(userId: string) {
    const total = (db.prepare("SELECT COUNT(*) as count FROM disease_scans WHERE user_id = ?").get(userId) as any)?.count || 0;
    const critical = (db.prepare("SELECT COUNT(*) as count FROM disease_scans WHERE user_id = ? AND severity = 'high'").get(userId) as any)?.count || 0;
    const avgConfidence = (db.prepare("SELECT AVG(confidence) as avg FROM disease_scans WHERE user_id = ?").get(userId) as any)?.avg || 0;

    return {
      totalScans: total,
      criticalDetections: critical,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    };
  },

  // Farm Records
  saveFarmRecord(record: { id: string; userId: string; cropName: string; acreage?: number; soilType?: string; stage?: string; yieldForecast?: string; createdAt?: string }) {
    db.prepare(`
      INSERT INTO farm_records (id, user_id, crop_name, acreage, soil_type, stage, yield_forecast, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id,
      record.userId,
      record.cropName,
      record.acreage || 0,
      record.soilType || "",
      record.stage || "",
      record.yieldForecast || "",
      record.createdAt || new Date().toISOString()
    );
  },

  getFarmRecords(userId: string): any[] {
    return db.prepare("SELECT * FROM farm_records WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  },

  // Recommendations
  saveRecommendation(rec: { id: string; userId: string; type: string; payload: any; createdAt?: string }) {
    db.prepare(`
      INSERT INTO recommendations (id, user_id, type, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(rec.id, rec.userId, rec.type, JSON.stringify(rec.payload), rec.createdAt || new Date().toISOString());
  },

  getRecommendations(userId: string, type?: string): any[] {
    const query = type
      ? "SELECT * FROM recommendations WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 25"
      : "SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 25";
    const rows = (type ? db.prepare(query).all(userId, type) : db.prepare(query).all(userId)) as any[];
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      payload: JSON.parse(r.payload_json),
      date: r.created_at
    }));
  }
};
