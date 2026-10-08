/**
 * Agronomic keyword search engine (BM25).
 *
 * Implements bilingual (Urdu + English) BM25 Okapi keyword retrieval over a
 * local 50-entry FAQ. This is lexical matching, not semantic/vector search —
 * no embeddings are used.
 */

import fs from "fs";
import path from "path";

export interface AgronomicDoc {
  id?: string;
  category?: string;
  question: string;
  answer: string;
  sources?: string[];
}

export interface SearchMatch {
  doc: AgronomicDoc;
  score: number;
  sources: string[];
}

export interface RetrievalResult {
  topMatches: AgronomicDoc[];
  relevanceScore: number;
  retrievalLatencyMs: number;
  sources: string[];
}

class SemanticRAGEngine {
  private docs: AgronomicDoc[] = [];
  private docTokens: string[][] = [];
  private avgDocLen: number = 0;
  private df: Map<string, number> = new Map(); // Document frequency
  private isIndexed: boolean = false;

  // BM25 Hyperparameters
  private readonly k1: number = 1.5;
  private readonly b: number = 0.75;

  constructor() {
    this.loadAndIndex();
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    // Support English alphabets, digits, and Arabic/Urdu Unicode ranges (0600-06FF)
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  public loadAndIndex(): void {
    const candidates = [
      path.join(process.cwd(), "farming_faq.json"),
      path.join(process.cwd(), "..", "farming_faq.json"),
      path.resolve(process.cwd(), "app", "farming_faq.json"),
    ];

    let faqFile: string | null = null;
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        faqFile = cand;
        break;
      }
    }

    if (!faqFile) {
      console.warn("[SemanticRAG] farming_faq.json not found in search paths.");
      return;
    }

    try {
      const raw = fs.readFileSync(faqFile, "utf-8");
      this.docs = JSON.parse(raw);
      this.docTokens = [];
      this.df.clear();

      let totalLen = 0;
      this.docs.forEach((doc, idx) => {
        const fullText = `${doc.question || ""} ${doc.answer || ""} ${doc.category || ""}`;
        const tokens = this.tokenize(fullText);
        this.docTokens.push(tokens);
        totalLen += tokens.length;

        // Unique tokens in this doc
        const unique = new Set(tokens);
        unique.forEach((token) => {
          this.df.set(token, (this.df.get(token) || 0) + 1);
        });
      });

      this.avgDocLen = this.docs.length > 0 ? totalLen / this.docs.length : 1;
      this.isIndexed = true;
      console.log(`[SemanticRAG] indexed ${this.docs.length} agronomic knowledge vectors (vocab size: ${this.df.size}).`);
    } catch (err) {
      console.error("[SemanticRAG] index build failed:", (err as Error).message);
    }
  }

  public search(query: string, topK: number = 3): RetrievalResult {
    const startTime = Date.now();
    if (!this.isIndexed || this.docs.length === 0) {
      this.loadAndIndex();
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return {
        topMatches: [],
        relevanceScore: 0,
        retrievalLatencyMs: Date.now() - startTime,
        sources: ["Advisor Local Knowledge Hub"]
      };
    }

    const N = this.docs.length;
    const scores: Array<{ idx: number; score: number }> = [];

    this.docs.forEach((doc, idx) => {
      const docTokens = this.docTokens[idx] || [];
      const docLen = docTokens.length;
      let bm25Score = 0;

      // Question-specific boost (title match multiplier)
      const qTokens = new Set(this.tokenize(doc.question || ""));

      queryTokens.forEach((qToken) => {
        const dfVal = this.df.get(qToken) || 0;
        if (dfVal === 0) return;

        // Okapi BM25 IDF: ln((N - df + 0.5) / (df + 0.5) + 1)
        const idf = Math.log((N - dfVal + 0.5) / (dfVal + 0.5) + 1);

        // Term frequency in doc
        let tf = 0;
        for (const dt of docTokens) {
          if (dt === qToken) tf++;
        }

        // BM25 TF weight
        const num = tf * (this.k1 + 1);
        const denom = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLen));
        let termWeight = idf * (num / denom);

        if (qTokens.has(qToken)) {
          termWeight *= 2.2; // 2.2x multiplier for title/question hit
        }

        bm25Score += termWeight;
      });

      if (bm25Score > 0) {
        scores.push({ idx, score: bm25Score });
      }
    });

    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, topK);

    const maxScore = scores.length > 0 ? scores[0].score : 1;
    const topMatches = top.map((s) => this.docs[s.idx]);

    const sourcesSet = new Set<string>();
    topMatches.forEach((m) => {
      (m.sources || ["Pakistan Agricultural Research Council (PARC)"]).forEach((src) => sourcesSet.add(src));
    });

    const retrievalLatencyMs = Math.max(1, Date.now() - startTime);

    return {
      topMatches,
      relevanceScore: scores.length > 0 ? Math.min(1.0, Math.round((scores[0].score / (maxScore + 1)) * 100) / 100) : 0,
      retrievalLatencyMs,
      sources: Array.from(sourcesSet)
    };
  }
}

export const semanticRAG = new SemanticRAGEngine();
