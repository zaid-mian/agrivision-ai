import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Settings, Info, Droplets, BookOpen, Layers, Check } from "lucide-react";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PossibilitiesPieChart from "../components/charts/PossibilitiesPieChart";

export default function FertilizerRecommendation() {
  const { apiFetch } = useAuth();
  const { t } = useTranslation();

  const [crop, setCrop] = useState("Wheat");
  const [N, setN] = useState<number>(80);
  const [P, setP] = useState<number>(40);
  const [K, setK] = useState<number>(60);
  const [season, setSeason] = useState("kharif");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const cropsList = [
    "Wheat (Gandum)",
    "Rice (Chawal)",
    "Cotton (Kapas)",
    "Maize (Makai)",
    "Lentils (Masoor)",
    "Grapes (Angoor)",
    "Potato (Aloo)",
    "Citrus Orchard"
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await apiFetch("/api/fertilizer/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          N: Number(N),
          P: Number(P),
          K: Number(K),
          season
        })
      });

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to calculate fertilizer dose");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
          {t("fertilizer.title")}
        </h1>
        <p className="text-white/60 text-sm mt-1">
          {t("fertilizer.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Fertilizer entry forms */}
        <div className="lg:col-span-7">
          <Card hoverEffect={false} className="border-white/10 p-6 bg-black/40">
            <h2 className="text-base font-semibold text-white border-b border-white/5 pb-4 mb-6 flex items-center gap-2">
              <Settings size={18} className="text-[#74C69D]" />
              Nutrition Parameters
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Crop select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">
                  {t("fertilizer.cropChoice")}
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                >
                  {cropsList.map((item) => (
                    <option key={item} value={item} className="bg-neutral-900">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* N-P-K inputs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fertN" className="text-xs font-semibold text-white/80 block">
                    {t("common.n")}
                  </label>
                  <input
                    id="fertN"
                    type="number"
                    required
                    min={0}
                    max={200}
                    value={N}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="fertP" className="text-xs font-semibold text-white/80 block">
                    {t("common.p")}
                  </label>
                  <input
                    id="fertP"
                    type="number"
                    required
                    min={0}
                    max={200}
                    value={P}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="fertK" className="text-xs font-semibold text-white/80 block">
                    {t("common.k")}
                  </label>
                  <input
                    id="fertK"
                    type="number"
                    required
                    min={0}
                    max={200}
                    value={K}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
                  />
                </div>
              </div>

              {/* Cropping Season choices */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 block">
                  {t("fertilizer.season")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer select-none transition ${
                    season === "kharif"
                      ? "border-[#74C69D] bg-[#2D6A4F]/10 text-white"
                      : "border-white/10 bg-white/5 hover:bg-white/8 text-white/70"
                  }`}>
                    <input
                      type="radio"
                      name="season-radio"
                      checked={season === "kharif"}
                      onChange={() => setSeason("kharif")}
                      className="accent-[#74C69D]"
                    />
                    <span className="text-xs font-medium">{t("fertilizer.seasonOptions.kharif")}</span>
                  </label>

                  <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer select-none transition ${
                    season === "rabi"
                      ? "border-[#74C69D] bg-[#2D6A4F]/10 text-white"
                      : "border-white/10 bg-white/5 hover:bg-white/8 text-white/70"
                  }`}>
                    <input
                      type="radio"
                      name="season-radio"
                      checked={season === "rabi"}
                      onChange={() => setSeason("rabi")}
                      className="accent-[#74C69D]"
                    />
                    <span className="text-xs font-medium">{t("fertilizer.seasonOptions.rabi")}</span>
                  </label>

                  <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer select-none transition ${
                    season === "zaid"
                      ? "border-[#74C69D] bg-[#2D6A4F]/10 text-white"
                      : "border-white/10 bg-white/5 hover:bg-white/8 text-white/70"
                  }`}>
                    <input
                      type="radio"
                      name="season-radio"
                      checked={season === "zaid"}
                      onChange={() => setSeason("zaid")}
                      className="accent-[#74C69D]"
                    />
                    <span className="text-xs font-medium">{t("fertilizer.seasonOptions.zaid")}</span>
                  </label>
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
                <Droplets size={16} />
                {t("fertilizer.recommendBtn")}
              </Button>
            </form>
          </Card>
        </div>

        {/* Prescription results cards */}
        <div className="lg:col-span-5 space-y-6">
          {!result && (
            <Card hoverEffect={false} className="bg-[#2D6A4F]/5 border-[#2D6A4F]/20 p-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-[#74C69D] uppercase font-mono flex items-center gap-1.5 mb-4">
                  <Info size={14} />
                  Agronomic Dosing Policy
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Applying correct compound fertilizers ensures vital tillering, chlorophyll replenishment, and grain-fill. Mixing chemical NPK with natural compost balances nitrogen leaching during heavy rainfall.
                </p>
              </div>

              <div className="mt-8 space-y-3.5">
                <div className="flex gap-3 text-xs text-white/80">
                  <span className="p-1.5 bg-[#2D6A4F]/25 text-[#74C69D] rounded-lg font-bold flex items-center justify-center w-6 h-6">1</span>
                  <p className="leading-relaxed">Verify moisture is adequate before applying granular grains to avoid nutrient chemical root burn.</p>
                </div>
                <div className="flex gap-3 text-xs text-white/80">
                  <span className="p-1.5 bg-[#2D6A4F]/25 text-[#74C69D] rounded-lg font-bold flex items-center justify-center w-6 h-6">2</span>
                  <p className="leading-relaxed">Keep fertilizer materials separate from weed seedlings to optimize direct nutritional access.</p>
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
              <Card hoverEffect={false} className="border-white/20 bg-neutral-950 p-6 space-y-5 shadow-2x">
                <div className="border-b border-white/10 pb-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#74C69D]">
                    {t("fertilizer.result")}
                  </h4>
                  <h2 className="text-lg font-extrabold text-white mt-1">
                    {result.fertilizer}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#2D6A4F]/10 border border-[#2D6A4F]/30 px-4 py-3 rounded-xl">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">{t("fertilizer.quantity")}</span>
                    <span className="text-base font-bold text-[#74C69D] mt-0.5 block">{result.quantity}</span>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <BookOpen size={12} />
                      {t("fertilizer.instructions")}
                    </h5>
                    <p className="text-xs text-white/80 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl font-sans">
                      {result.instructions}
                    </p>
                  </div>
                </div>
              </Card>

              {result.possibilities && (
                <PossibilitiesPieChart
                  data={result.possibilities.map((p: any) => ({ name: p.name, value: p.percentage }))}
                  title="Nutrient Deficiencies Breakdown"
                />
              )}

              {result.possibilities && (
                <Card hoverEffect={false} className="border-white/10 bg-black/40 p-6 space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide text-white/90 font-mono border-b border-white/5 pb-3">
                    🧪 Application Schedule & Best Practices
                  </h3>
                  <div className="space-y-3 mt-2">
                    <div className="flex gap-2.5 items-start text-xs text-white/80">
                      <span className="p-1 bg-[#2D6A4F]/25 text-[#74C69D] rounded-full shrink-0 mt-0.5">
                        <Check size={10} />
                      </span>
                      <span className="leading-relaxed">Verify that soil moisture is adequate before broadcasting chemical granular tilling mixes to prevent fertilizer sprout/root burn.</span>
                    </div>

                    {result.possibilities.some((p: any) => p.name.includes("Urea")) && (
                      <div className="flex gap-2.5 items-start text-xs text-white/80">
                        <span className="p-1 bg-[#2D6A4F]/25 text-[#74C69D] rounded-full shrink-0 mt-0.5">
                          <Check size={10} />
                        </span>
                        <span className="leading-relaxed">Split-apply Urea (Nitrogen source) into two or three side-dressings during the active vegetative growth phase for optimal root uptake.</span>
                      </div>
                    )}

                    {result.possibilities.some((p: any) => p.name.includes("DAP")) && (
                      <div className="flex gap-2.5 items-start text-xs text-white/80">
                        <span className="p-1 bg-[#2D6A4F]/25 text-[#74C69D] rounded-full shrink-0 mt-0.5">
                          <Check size={10} />
                        </span>
                        <span className="leading-relaxed">Incorporate DAP (Phosphorus source) deeply into seed rows during tilling so that phosphorus remains close to developing roots.</span>
                      </div>
                    )}

                    {result.possibilities.some((p: any) => p.name.includes("MOP")) && (
                      <div className="flex gap-2.5 items-start text-xs text-white/80">
                        <span className="p-1 bg-[#2D6A4F]/25 text-[#74C69D] rounded-full shrink-0 mt-0.5">
                          <Check size={10} />
                        </span>
                        <span className="leading-relaxed">Broadcast MOP/Potash completely during early tilling to strengthen the plant canopy and improve fruit/grain density.</span>
                      </div>
                    )}

                    <div className="flex gap-2.5 items-start text-xs text-white/80">
                      <span className="p-1 bg-[#2D6A4F]/25 text-[#74C69D] rounded-full shrink-0 mt-0.5">
                        <Check size={10} />
                      </span>
                      <span className="leading-relaxed">Avoid mixing micro-fertilizers directly with weed herbicides. Distribute them with at least a 7-day interval.</span>
                    </div>
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
