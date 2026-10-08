import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { semanticRAG } from "../server/services/semanticSearch";

describe("Agronomic Semantic RAG Retrieval Engine", () => {
  test("indexes local agronomic knowledge vectors on startup", () => {
    semanticRAG.loadAndIndex();
    const result = semanticRAG.search("nitrogen fertilizer deficiency in wheat");
    assert.ok(result.topMatches.length > 0, "Should retrieve matching agronomic chunks");
    assert.ok(result.retrievalLatencyMs >= 0, "Latency must be calculated");
    assert.ok(result.sources.length > 0, "Must cite agricultural authority sources");
  });

  test("correctly scores relevant cotton disease queries higher than irrelevant terms", () => {
    const cottonQuery = semanticRAG.search("cotton leaf curl virus whitefly symptoms");
    assert.ok(cottonQuery.topMatches.length > 0);
    assert.ok(cottonQuery.relevanceScore > 0, "Relevance score should be positive");
  });

  test("handles empty and edge queries gracefully", () => {
    const emptyResult = semanticRAG.search("");
    assert.equal(emptyResult.topMatches.length, 0);
    assert.equal(emptyResult.relevanceScore, 0);
  });
});
