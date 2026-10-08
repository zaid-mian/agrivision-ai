import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Sun, Thermometer, Droplets, CloudRain, Wind, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Weather() {
  const { user, apiFetch } = useAuth();
  const { t } = useTranslation();

  const [searchDistrict, setSearchDistrict] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDistrictWeather(user.location || "Sargodha");
    }
  }, [user]);

  const fetchDistrictWeather = async (locName: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiFetch(`/api/weather/${encodeURIComponent(locName)}`);
      setWeather(data);
      setCurrentDistrict(locName);
    } catch (err: any) {
      setErrorMsg("Failed to query weather reports for this district. Please search another regional name.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDistrict.trim()) {
      fetchDistrictWeather(searchDistrict.trim());
    }
  };

  const getRiskBadgeStyles = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return { text: t("weather.riskLevels.high"), color: "bg-red-500/10 text-red-400 border-red-500/30" };
      case "medium":
        return { text: t("weather.riskLevels.medium"), color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
      default:
        return { text: t("weather.riskLevels.low"), color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
    }
  };

  const riskInfo = getRiskBadgeStyles(weather?.disease_risk);

  return (
    <div className="space-y-8 font-sans pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
            {t("weather.title")}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Analyze air ranges, rain probability percentages, and crop-specific fungal multipliers based on real-time climate telemetry.
          </p>
        </div>

        {/* District Manual Search Override Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              required
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder={t("weather.searchPlaceholder")}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
            />
          </div>
          <Button type="submit" className="px-5 py-2.5 text-xs">
            Query
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-white/60">
          <div className="animate-spin h-8 w-8 text-[#74C69D] border-4 border-t-transparent border-current rounded-full mb-3" />
          <p className="text-sm">Fetching agricultural meteorological bulletins...</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-4 rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {!isLoading && weather && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header Region indicator */}
          <Card hoverEffect={false} className="bg-black/30 border-white/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-[#2D6A4F]/20 text-[#74C69D] rounded-xl border border-[#74C69D]/20">
                <MapPin size={24} />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">District Plot Site</span>
                <h2 className="text-2xl font-bold text-white font-serif mt-0.5">{currentDistrict}</h2>
              </div>
            </div>

            <div className="flex flex-col sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Atmospheric Condition</span>
              <span className="text-base font-bold text-[#74C69D] mt-0.5">{weather.condition}</span>
            </div>
          </Card>

          {/* Core metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverEffect={false} className="bg-white/5 border-white/10 p-5 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-rose-500/10 text-rose-300 rounded-lg">
                  <Thermometer size={20} />
                </span>
                <span className="text-[10px] font-mono text-white/30 uppercase">Thermal Index</span>
              </div>
              <div>
                <h4 className="text-xs text-white/50">{t("weather.temp")}</h4>
                <p className="text-3xl font-extrabold text-white mt-1">{weather.temperature}°C</p>
              </div>
            </Card>

            <Card hoverEffect={false} className="bg-white/5 border-white/10 p-5 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-blue-500/10 text-blue-300 rounded-lg">
                  <Droplets size={20} />
                </span>
                <span className="text-[10px] font-mono text-white/30 uppercase">Foliage Humidity</span>
              </div>
              <div>
                <h4 className="text-xs text-white/50">{t("weather.humidity")}</h4>
                <p className="text-3xl font-extrabold text-white mt-1">{weather.humidity}%</p>
              </div>
            </Card>

            <Card hoverEffect={false} className="bg-white/5 border-white/10 p-5 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-teal-500/10 text-teal-300 rounded-lg">
                  <CloudRain size={20} />
                </span>
                <span className="text-[10px] font-mono text-white/30 uppercase">Irrigation Gauge</span>
              </div>
              <div>
                <h4 className="text-xs text-white/50">{t("weather.rainProb")}</h4>
                <p className="text-3xl font-extrabold text-white mt-1">{Math.round(weather.rain_probability * 100)}%</p>
              </div>
            </Card>

            <Card hoverEffect={false} className="bg-white/5 border-white/10 p-5 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-amber-500/10 text-amber-300 rounded-lg">
                  <Wind size={20} />
                </span>
                <span className="text-[10px] font-mono text-white/30 uppercase">Pathogen Spore</span>
              </div>
              <div>
                <h4 className="text-xs text-white/50">{t("weather.risk")}</h4>
                <p className="text-lg font-extrabold text-white mt-2 flex items-center gap-1.5">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${weather.disease_risk === "high" ? "bg-red-500" : weather.disease_risk === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {riskInfo.text}
                </p>
              </div>
            </Card>
          </div>

          {/* Big custom advice card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card hoverEffect={false} className="lg:col-span-8 bg-[#2D6A4F]/10 border-[#2D6A4F]/30 p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#74C69D]" />
                {t("weather.advice")}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed bg-[#0E1B14] p-5 rounded-xl border border-[#2D6A4F]/30">
                {weather.farming_advice}
              </p>
            </Card>

            <Card hoverEffect={false} className="lg:col-span-4 bg-white/5 border-white/10 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white/95 mb-2">Meteorological Alerts</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Sudden drops in dew-points trigger nocturnal fungal leaf-spots. Check soil moisture daily.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-[10px] font-mono text-white/40 uppercase">
                Offline Rule Engine v1.4
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
