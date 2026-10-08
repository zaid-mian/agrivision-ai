import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { semanticRAG } from "../server/services/semanticSearch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BenchmarkCase {
  query: string;
  expectedFaqId: string;
  domain: string;
}

describe("BM25 Agronomy FAQ Retrieval Benchmark", () => {
  test("evaluates Hit@1, Hit@3, and MRR over 50 real-world farmer queries", () => {
    semanticRAG.loadAndIndex();

    // 50 realistic farmer queries mapped 1-to-1 against all 50 agronomic FAQ entries
    const testCases: BenchmarkCase[] = [
      { query: "tomato leaves yellow chlorosis deficiency", expectedFaqId: "faq_1", domain: "foliar" },
      { query: "late blight potato control fungicides phytophthora", expectedFaqId: "faq_2", domain: "pathology" },
      { query: "optimal pH level wheat cultivation soil", expectedFaqId: "faq_3", domain: "soil" },
      { query: "irrigate cotton flowering watering schedule", expectedFaqId: "faq_4", domain: "water" },
      { query: "nitrogen deficiency rice pale green leaves tillers", expectedFaqId: "faq_5", domain: "nutrition" },
      { query: "crop rotation corn soil health legumes", expectedFaqId: "faq_6", domain: "rotation" },
      { query: "prevent root rot bananas drainage pseudostem", expectedFaqId: "faq_7", domain: "pathology" },
      { query: "fertilizer grapes potassium fruit bearing NPK", expectedFaqId: "faq_8", domain: "nutrition" },
      { query: "combat aphids cabbage neem oil predators", expectedFaqId: "faq_9", domain: "pests" },
      { query: "potassium deficiency maize leaf margin yellow lodging", expectedFaqId: "faq_10", domain: "nutrition" },
      { query: "powdery mildew grapes white patches sulfur spray", expectedFaqId: "faq_11", domain: "pathology" },
      { query: "NPK recommendation Rabi crops lentils chickpeas", expectedFaqId: "faq_12", domain: "nutrition" },
      { query: "urea application wheat fields tillering timing split", expectedFaqId: "faq_13", domain: "nutrition" },
      { query: "leaf spot disease chili peppers copper oxychloride", expectedFaqId: "faq_14", domain: "pathology" },
      { query: "blossom end rot tomato calcium moisture irregular", expectedFaqId: "faq_15", domain: "nutrition" },
      { query: "rainy weather fertilizer leaching downpour runoff", expectedFaqId: "faq_16", domain: "weather" },
      { query: "organic sources phosphorus acidic soils bone meal rock phosphate", expectedFaqId: "faq_17", domain: "soil" },
      { query: "citrus canker raised lesions copper spray orchard", expectedFaqId: "faq_18", domain: "pathology" },
      { query: "soil conditions healthy potato growth sandy loam drainage", expectedFaqId: "faq_19", domain: "soil" },
      { query: "increase organic carbon soil green manure FYM", expectedFaqId: "faq_20", domain: "soil" },
      { query: "drip irrigation water efficiency recommended arid", expectedFaqId: "faq_21", domain: "water" },
      { query: "iron deficiency sugarcane interveinal chlorosis young leaves", expectedFaqId: "faq_22", domain: "nutrition" },
      { query: "benefits bio-fertilizers azotobacter rhizobium", expectedFaqId: "faq_23", domain: "soil" },
      { query: "control armyworms maize crops spinosad Bt", expectedFaqId: "faq_24", domain: "pests" },
      { query: "spray liquid foliar fertilizer hot desert afternoon scorch", expectedFaqId: "faq_25", domain: "foliar" },
      { query: "zinc deficiency wheat brown spots internodes stunting", expectedFaqId: "faq_26", domain: "nutrition" },
      { query: "how often test soil nutrients laboratory testing", expectedFaqId: "faq_27", domain: "soil" },
      { query: "rabi agriculture winter season crops sowing harvest", expectedFaqId: "faq_28", domain: "season" },
      { query: "kharif cropping monsoon summer season cotton rice", expectedFaqId: "faq_29", domain: "season" },
      { query: "whitefly cotton fields sticky traps neem extract", expectedFaqId: "faq_30", domain: "pests" },
      { query: "prevent root knot nematodes marigold rotation bio-nematicides", expectedFaqId: "faq_31", domain: "pests" },
      { query: "systemic vs contact pesticide foliar spray mode of action", expectedFaqId: "faq_32", domain: "pests" },
      { query: "leaf rust wheat yellow stripe propiconazole fungicides", expectedFaqId: "faq_33", domain: "pathology" },
      { query: "mango trees not flowering vegetative flushes bloom water", expectedFaqId: "faq_34", domain: "horticulture" },
      { query: "rainwater harvesting structure farm pond plastic membrane", expectedFaqId: "faq_35", domain: "water" },
      { query: "intercropping wheat mustard row ratio companion planting", expectedFaqId: "faq_36", domain: "rotation" },
      { query: "bacterial wilt eggplants brinjal stem slime ooze", expectedFaqId: "faq_37", domain: "pathology" },
      { query: "soil salinity plant water intake osmotic drought scorch", expectedFaqId: "faq_38", domain: "soil" },
      { query: "neutralize alkaline soil elemental sulfur gypsum powder", expectedFaqId: "faq_39", domain: "soil" },
      { query: "boron deficiency alfalfa yellow rosette top clusters borax", expectedFaqId: "faq_40", domain: "nutrition" },
      { query: "soil mulch conserve water evaporation straw temperature", expectedFaqId: "faq_41", domain: "water" },
      { query: "green manuring sesbania plow flowering decompose humus", expectedFaqId: "faq_42", domain: "soil" },
      { query: "storage grain pests neem leaves moisture hermetic bags", expectedFaqId: "faq_43", domain: "pests" },
      { query: "compost quality carbon nitrogen CN ratio decomposition 25:1", expectedFaqId: "faq_44", domain: "soil" },
      { query: "early blight potatoes alternaria concentric rings target chlorothalonil", expectedFaqId: "faq_45", domain: "pathology" },
      { query: "heavy clay soil plant roots waterlogging aeration drainage", expectedFaqId: "faq_46", domain: "soil" },
      { query: "black heart stored potatoes oxygen ventilation cold storage", expectedFaqId: "faq_47", domain: "pathology" },
      { query: "charcoal rot soybeans drought trichoderma crop rotation", expectedFaqId: "faq_48", domain: "pathology" },
      { query: "mycorrhizal fungi agriculture root phosphorus uptake network", expectedFaqId: "faq_49", domain: "soil" },
      { query: "soil compaction crop yield root elongation hardpan pore", expectedFaqId: "faq_50", domain: "soil" }
    ];

    let hitsAt1 = 0;
    let hitsAt3 = 0;
    let reciprocalRankSum = 0;
    let totalLatencyMs = 0;

    for (const testCase of testCases) {
      const res = semanticRAG.search(testCase.query, 3);
      totalLatencyMs += res.retrievalLatencyMs;

      const rank = res.topMatches.findIndex((doc) => doc.id === testCase.expectedFaqId);
      if (rank === 0) {
        hitsAt1++;
      }
      if (rank >= 0 && rank < 3) {
        hitsAt3++;
      }
      if (rank >= 0) {
        reciprocalRankSum += 1 / (rank + 1);
      }
    }

    const n = testCases.length;
    const hitRate1 = Math.round((hitsAt1 / n) * 1000) / 10;
    const hitRate3 = Math.round((hitsAt3 / n) * 1000) / 10;
    const mrr = Math.round((reciprocalRankSum / n) * 1000) / 1000;
    const avgLatencyMs = Math.round((totalLatencyMs / n) * 100) / 100;

    console.log("\n=======================================================");
    console.log("       BM25 OKAPI AGRONOMY BENCHMARK RESULTS           ");
    console.log("=======================================================");
    console.log(`Evaluated Queries:    ${n} curated agronomic farmer queries`);
    console.log(`Hit-Rate @ 1:         ${hitRate1}% (${hitsAt1}/${n})`);
    console.log(`Hit-Rate @ 3:         ${hitRate3}% (${hitsAt3}/${n})`);
    console.log(`Mean Reciprocal Rank: ${mrr}`);
    console.log(`Avg Retrieval Time:   ${avgLatencyMs} ms`);
    console.log("=======================================================\n");

    // Persist benchmark results artifact
    const evalDir = path.resolve(__dirname, "../../ml/disease_model/eval");
    if (!fs.existsSync(evalDir)) fs.mkdirSync(evalDir, { recursive: true });
    fs.writeFileSync(
      path.join(evalDir, "faq_benchmark_results.json"),
      JSON.stringify(
        {
          totalQueries: n,
          hitRate1: `${hitRate1}%`,
          hitRate3: `${hitRate3}%`,
          meanReciprocalRank: mrr,
          avgLatencyMs,
          notes: "Evaluated lexical BM25 Okapi retrieval over 50 curated agronomic FAQ entries",
          timestamp: new Date().toISOString()
        },
        null,
        2
      ),
      "utf8"
    );

    assert.ok(hitRate3 >= 90, `Hit@3 must be >= 90% (measured: ${hitRate3}%)`);
    assert.ok(mrr >= 0.85, `MRR must be >= 0.85 (measured: ${mrr})`);
  });
});
