/**
 * TypeScript type definitions for the AI Agriculture Advisor platform.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  createdAt: string;
}

export interface SoilData {
  N: number;
  P: number;
  K: number;
  pH: number;
  rainfall: number;
  temperature?: number;
  humidity?: number;
}

export interface FarmRecord {
  id: string;
  userId: string;
  crop: string;
  soilData: SoilData;
  createdAt: string;
}

export interface DiseaseResult {
  id: string;
  userId: string;
  imagePath: string;
  disease: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  treatment: string;
  prevention: string;
  date: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: "crop" | "fertilizer";
  result: Record<string, any>;
  date: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rain_probability: number;
  condition: string;
  farming_advice: string;
  disease_risk: "low" | "medium" | "high";
}

export interface HealthScoreFactor {
  name: string;
  impact: number;
  detail: string;
}

export interface HealthScoreResponse {
  score: number;
  factors: HealthScoreFactor[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sources: string[];
}
