import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Clover, Settings2, HelpCircle, Check, Info } from "lucide-react";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SpeechInput from "../components/ui/SpeechInput";
import PossibilitiesPieChart from "../components/charts/PossibilitiesPieChart";

export default function CropRecommendation() {
  const { apiFetch } = useAuth();
  const { t } = useTranslation();

  const [N, setN] = useState<number>(90);
  const [P, setP] = useState<number>(42);
  const [K, setK] = useState<number>(43);
  const [ph, setPh] = useState<number>(6.5);
  const [temperature, setTemperature] = useState<number>(20.87);
  const [humidity, setHumidity] = useState<number>(82.0);
  const [rainfall, setRainfall] = useState<number>(202.93);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [speechHint, setSpeechHint] = useState<string | null>(null);

  // Map crops to matching beautiful crop emojis
  const getCropEmoji = (cropName: string) => {
    const lower = cropName.toLowerCase();
    if (lower.includes("rice")) return "🌾";
    if (lower.includes("wheat")) return "🌾";
    if (lower.includes("grapes")) return "🍇";
    if (lower.includes("banana")) return "🍌";
    if (lower.includes("pomegranate")) return "🍎";
    if (lower.includes("cotton")) return "☁️";
    if (lower.includes("maize")) return "🌽";
    if (lower.includes("lentil")) return "🌱";
    return "🍇";
  };

  const handleSpeechResult = (text: string) => {
    setSpeechHint(`Heard: "${text}"`);
    const lowercase = text.toLowerCase();

    // Natural Language field parsing helper
    const nMatch = lowercase.match(/(?:nitrogen|n is|n|set n to)\s*(\d+)/i);
    const pMatch = lowercase.match(/(?:phosphorus|p is|p|set p to)\s*(\d+)/i);
    const kMatch = lowercase.match(/(?:potassium|k is|k|set k to)\s*(\d+)/i);
    const phMatch = lowercase.match(/(?:ph is|ph|set ph to)\s*(\d+(\.\d+)?)/i);
    const tempMatch = lowercase.match(/(?:temperature|temp is|climate|set temp to)\s*(\d+(\.\d+)?)/i);
    const humMatch = lowercase.match(/(?:humidity|humid|set humidity to)\s*(\d+(\.\d+)?)/i);
    const rainMatch = lowercase.match(/(?:rainfall|rain|set rain to)\s*(\d+(\.\d+)?)/i);

    if (nMatch) setN(Math.min(140, Math.max(0, parseInt(nMatch[1]))));
    if (pMatch) setP(Math.min(145, Math.max(5, parseInt(pMatch[1]))));
    if (kMatch) setK(Math.min(205, Math.max(5, parseInt(kMatch[1]))));
    if (phMatch) setPh(Math.min(9.5, Math.max(3.5, parseFloat(phMatch[1]))));
    if (tempMatch) setTemperature(parseFloat(tempMatch[1]));
    if (humMatch) setHumidity(Math.min(100, Math.max(0, parseFloat(humMatch[1]))));
    if (rainMatch) setRainfall(parseFloat(rainMatch[1]));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await apiFetch("/api/crop/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: Number(N),
          P: Number(P),
          K: Number(K),
          ph: Number(ph),
          temperature: Number(temperature),
          humidity: Number(humidity),
          rainfall: Number(rainfall)
        })
      });

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse soil metrics");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
          {t("crop.title")}
        </h1>
        <p className="text-white/60 text-sm mt-1">
          {t("crop.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Soil Forms Panel */}
        <div className="lg:col-span-7">
          <Card hoverEffect={false} className="border-white/10 p-6 bg-black/40">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Settings2 size={18} className="text-[#74C69D]" />
                Soil & Climate Metrics
              </h2>
              <div className="flex items-center gap-2">
                <SpeechInput onResult={handleSpeechResult} />
              </div>
            </div>

            {speechHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-lg mb-4 font-mono truncate"
              >
                {speechHint}
              </motion.div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* N-P-K Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cropN" className="text-xs font-semibold text-white/80 block">
                    {t("common.n")}
                  </label>
                  <input
                    id="cropN"
                    type="number"
                    required
                    min={0}
                    max={140}
                    value={N}
                    onChange={(e) => setN(Number(e.target.value))}
                    placeholder={t("crop.placeholderN")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                  <span className="text-[10px] text-white/40 block">Range: 0-140 mg/kg</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cropP" className="text-xs font-semibold text-white/80 block">
                    {t("common.p")}
                  </label>
                  <input
                    id="cropP"
                    type="number"
                    required
                    min={5}
                    max={145}
                    value={P}
                    onChange={(e) => setP(Number(e.target.value))}
                    placeholder={t("crop.placeholderP")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                  <span className="text-[10px] text-white/40 block">Range: 5-145 mg/kg</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cropK" className="text-xs font-semibold text-white/80 block">
                    {t("common.k")}
                  </label>
                  <input
                    id="cropK"
                    type="number"
                    required
                    min={5}
                    max={205}
                    value={K}
                    onChange={(e) => setK(Number(e.target.value))}
                    placeholder={t("crop.placeholderK")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                  <span className="text-[10px] text-white/40 block">Range: 5-205 mg/kg</span>
                </div>
              </div>

              {/* Climate indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cropPh" className="text-xs font-semibold text-white/80 block">
                    {t("common.ph")}
                  </label>
                  <input
                    id="cropPh"
                    type="number"
                    required
                    step="0.1"
                    min={3.5}
                    max={9.5}
                    value={ph}
                    onChange={(e) => setPh(Number(e.target.value))}
                    placeholder="e.g., 6.5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                  <span className="text-[10px] text-white/40 block">Range: 3.5 - 9.5 pH</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cropTemp" className="text-xs font-semibold text-white/80 block">
                    {t("common.temp")} (°C)
                  </label>
                  <input
                    id="cropTemp"
                    type="number"
                    required
                    step="0.01"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    placeholder="25.5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cropHum" className="text-xs font-semibold text-white/80 block">
                    {t("common.humidity")} (%)
                  </label>
                  <input
                    id="cropHum"
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    placeholder="80"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cropRain" className="text-xs font-semibold text-white/80 block">
                    {t("common.rainfall")} (mm)
                  </label>
                  <input
                    id="cropRain"
                    type="number"
                    required
                    step="0.01"
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    placeholder="150"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl">
                  ⚠️ {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                <Clover size={16} />
                {t("crop.recommendBtn")}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results output panel details */}
        <div className="lg:col-span-5 space-y-6">
          {!result && (
            <Card hoverEffect={false} className="bg-[#2D6A4F]/5 border-[#2D6A4F]/20 p-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-[#74C69D] uppercase font-mono flex items-center gap-1.5 mb-4">
                  <Info size={14} />
                  Agronomic Classifier Advice
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  By processing your micro-soil metrics against historic regional crop charts using a Random Forest formulation, our platform is able to locate the specific plant species that minimizes stress indices.
                </p>
              </div>

              {/* Hint guidelines */}
              <div className="mt-8 bg-white/5 border border-white/10 p-4 rounded-xl flex gap-3 items-start">
                <span className="p-1.5 bg-[#2D6A4F]/20 rounded-lg text-[#74C69D]">
                  💡
                </span>
                <div className="space-y-1 text-xs">
                  <h4 className="font-semibold text-white">Speech Instructions</h4>
                  <p className="text-white/50 leading-relaxed">
                    Click the microphone icon and speak clearly: e.g., <span className="text-[#74C69D] italic font-medium">"set Nitrogen to 90"</span> or <span className="text-[#74C69D] italic font-medium">"pH is 6.5"</span>. Your fields update automatically!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card hoverEffect={false} className="border-white/20 bg-black/40 p-6 space-y-5">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="text-4xl">
                    {getCropEmoji(result.crop)}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                      {t("crop.result")}
                    </h4>
                    <h2 className="text-lg font-bold text-[#74C69D] font-serif">
                      {result.crop}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-white/60">Agronomic Confidence</span>
                      <span className="font-bold text-[#74C69D]">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#74C69D]" style={{ width: `${result.confidence * 100}%` }} />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5">
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {t("crop.reasoning")}
                    </h5>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {result.reason}
                    </p>
                  </div>
                </div>
              </Card>

              {result.possibilities && (
                <PossibilitiesPieChart
                  data={result.possibilities.map((p: any) => ({ name: p.crop, value: p.score }))}
                  title="Crop Suitability Possibilities"
                />
              )}

              {result.possibilities && result.possibilities[0] && (
                <Card hoverEffect={false} className="border-white/10 bg-black/40 p-6 space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide text-white/90 font-mono border-b border-white/5 pb-3">
                    🌱 Soil Optimization Guide
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    To achieve 100% ideal soil environment for <span className="text-[#74C69D] font-bold">{result.possibilities[0].crop}</span>, apply the following adjustments:
                  </p>
                  <div className="space-y-3 mt-2">
                    {(() => {
                      const best = result.possibilities[0];
                      const adjustments = [];
                      
                      // N adjustment
                      if (N < best.ideal.N) {
                        adjustments.push(`Add nitrogen-based fertilizer (e.g. Urea) to raise N from ${N} to ${best.ideal.N} mg/kg (+${best.ideal.N - N} mg/kg).`);
                      } else if (N > best.ideal.N + 20) {
                        adjustments.push(`Nitrogen level (${N} mg/kg) is high. Avoid extra nitrogen feed to prevent crop lodging.`);
                      } else {
                        adjustments.push(`Nitrogen level (${N} mg/kg) is optimal.`);
                      }

                      // P adjustment
                      if (P < best.ideal.P) {
                        adjustments.push(`Add phosphorus-rich fertilizer (e.g. DAP) to raise P from ${P} to ${best.ideal.P} mg/kg (+${best.ideal.P - P} mg/kg).`);
                      } else if (P > best.ideal.P + 15) {
                        adjustments.push(`Phosphorus level (${P} mg/kg) is sufficient.`);
                      } else {
                        adjustments.push(`Phosphorus level (${P} mg/kg) is optimal.`);
                      }

                      // K adjustment
                      if (K < best.ideal.K) {
                        adjustments.push(`Add potassium source (e.g. MOP/Potash) to increase K from ${K} to ${best.ideal.K} mg/kg (+${best.ideal.K - K} mg/kg).`);
                      } else {
                        adjustments.push(`Potassium level (${K} mg/kg) is optimal.`);
                      }

                      // pH adjustment
                      if (ph < best.ideal.pH - 0.4) {
                        adjustments.push(`Soil is acidic (pH ${ph}). Add agricultural lime to raise pH toward ${best.ideal.pH}.`);
                      } else if (ph > best.ideal.pH + 0.4) {
                        adjustments.push(`Soil is alkaline (pH ${ph}). Apply gypsum/organic compost to lower pH toward ${best.ideal.pH}.`);
                      } else {
                        adjustments.push(`Soil pH (${ph}) is in the optimal range.`);
                      }

                      return adjustments.map((adj, i) => (
                        <div key={i} className="flex gap-2.5 items-start text-xs text-white/80 font-sans">
                          <span className="p-1 bg-[#2D6A4F]/25 text-[#74C69D] rounded-full shrink-0 mt-0.5">
                            <Check size={10} />
                          </span>
                          <span className="leading-relaxed">{adj}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
