import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Clover,
  Activity,
  Droplets,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { motion } from "motion/react";
import Card from "../components/ui/Card";
import HealthScoreGauge from "../components/charts/HealthScoreGauge";
import DiseaseHistoryChart from "../components/charts/DiseaseHistoryChart";

export default function Dashboard() {
  const { user, apiFetch } = useAuth();
  const { t } = useTranslation();

  const [healthScore, setHealthScore] = useState(100);
  const [factors, setFactors] = useState<any[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [diseasesCount, setDiseasesCount] = useState(0);
  const [lastCrop, setLastCrop] = useState("N/A");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch health score
        const scoreData = await apiFetch("/api/health-score");
        if (scoreData) {
          setHealthScore(scoreData.score);
          setFactors(scoreData.factors || []);
        }

        // Fetch weather for user location
        const loc = user?.location || "Lahore";
        const weather = await apiFetch(`/api/weather/${encodeURIComponent(loc)}`);
        if (weather) {
          setWeatherData(weather);
        }

        // Build mock dashboard stat summaries by generating files check or simulating
        // inside local database properties.
        const dbRes = await fetch("/farm_database.json").then((r) => r.json()).catch(() => null);
        if (dbRes && user) {
          const userScans = dbRes.diseaseResults.filter((r: any) => r.userId === user.id);
          const userRecoms = dbRes.recommendations.filter((r: any) => r.userId === user.id && r.type === "crop");

          setRecentScans(userScans);
          setTotalScans(userScans.length);
          
          const uniqueDiseases = new Set(
            userScans.filter((s: any) => s.severity === "high" || s.severity === "medium").map((s: any) => s.disease)
          );
          setDiseasesCount(uniqueDiseases.size);

          if (userRecoms.length > 0) {
            setLastCrop(userRecoms[userRecoms.length - 1].result.crop || "N/A");
          }
        }
      } catch (err) {
        console.error("Dashboard Loading Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, apiFetch]);

  // Simulated scan trend across 7 days
  const chartData = [
    { day: "Mon", scans: recentScans.filter((s) => new Date(s.date).getDay() === 1).length || 2 },
    { day: "Tue", scans: recentScans.filter((s) => new Date(s.date).getDay() === 2).length || 1 },
    { day: "Wed", scans: recentScans.filter((s) => new Date(s.date).getDay() === 3).length || 0 },
    { day: "Thu", scans: recentScans.filter((s) => new Date(s.date).getDay() === 4).length || 1 },
    { day: "Fri", scans: recentScans.filter((s) => new Date(s.date).getDay() === 5).length || 3 },
    { day: "Sat", scans: recentScans.filter((s) => new Date(s.date).getDay() === 6).length || 1 },
    { day: "Sun", scans: recentScans.filter((s) => new Date(s.date).getDay() === 0).length || 2 }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight text-white font-serif"
          >
            {t("dashboard.welcome", { name: user?.name || "Farmer" })}
          </motion.h1>
          <p className="text-white/60 text-sm mt-1">
            Let's review today's ecological diagnostics and nutrient prescriptions for your farm.
          </p>
        </div>
        <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 self-start font-mono">
          <Calendar size={14} className="text-[#74C69D]" />
          <span>Local System Time: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Grid of 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4 bg-[#2D6A4F]/10 border-[#2D6A4F]/30">
          <div className="p-3 bg-[#2D6A4F]/20 rounded-xl text-[#74C69D]">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-white/50 lowercase first-letter:uppercase">
              {t("dashboard.metrics.totalScans")}
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {isLoading ? "..." : totalScans}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-amber-500/10 border-amber-500/20">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs text-white/50 lowercase first-letter:uppercase">
              {t("dashboard.metrics.diseasesFound")}
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {isLoading ? "..." : diseasesCount}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-teal-500/10 border-teal-500/20">
          <div className="p-3 bg-teal-500/20 rounded-xl text-teal-300">
            <Clover size={24} />
          </div>
          <div>
            <p className="text-xs text-white/50 lowercase first-letter:uppercase">
              {t("dashboard.metrics.lastCrop")}
            </p>
            <h3 className="text-lg font-bold text-white mt-1 truncate max-w-[150px]">
              {isLoading ? "..." : lastCrop}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-blue-500/10 border-blue-500/20">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300">
            <CloudSun size={24} />
          </div>
          <div>
            <p className="text-xs text-white/50 lowercase first-letter:uppercase">
              {t("dashboard.metrics.currentWeather")}
            </p>
            <h3 className="text-lg font-bold text-white mt-1">
              {isLoading ? "..." : weatherData ? `${weatherData.temperature}°C` : "N/A"}
            </h3>
          </div>
        </Card>
      </div>

      {/* Main Charts & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Health Score Circular Gauge */}
        <div className="lg:col-span-1">
          <HealthScoreGauge score={healthScore} />
        </div>

        {/* 7-Day Disease Log Bar Chart */}
        <div className="lg:col-span-2">
          <DiseaseHistoryChart data={chartData} />
        </div>
      </div>

      {/* Quick Actions / Link Navigation row */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
          <Layers size={18} className="text-[#74C69D]" />
          {t("dashboard.quickActions")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link to="/disease" className="group">
            <Card className="h-full border-white/5 hover:border-[#74C69D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-[#2D6A4F]/20 text-[#74C69D] rounded-lg">
                  <ShieldAlert size={20} />
                </span>
                <span className="text-white/30 group-hover:text-[#74C69D] transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-[#74C69D] transition-colors">
                {t("common.disease")}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                Upload leaf photographs and scan crops using our offline neural networks.
              </p>
            </Card>
          </Link>

          <Link to="/crop" className="group">
            <Card className="h-full border-white/5 hover:border-[#74C69D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-teal-500/10 text-teal-300 rounded-lg">
                  <Clover size={20} />
                </span>
                <span className="text-white/30 group-hover:text-teal-300 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                {t("common.crop")}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                Calculate the perfect yield match using soil chemistry NPK inputs.
              </p>
            </Card>
          </Link>

          <Link to="/fertilizer" className="group">
            <Card className="h-full border-white/5 hover:border-[#74C69D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-amber-500/10 text-amber-300 rounded-lg">
                  <Droplets size={20} />
                </span>
                <span className="text-white/30 group-hover:text-amber-300 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                {t("common.fertilizer")}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                Inquire exact nitrogen, phosphorous or bioorganic compost dosing counts.
              </p>
            </Card>
          </Link>

          <Link to="/weather" className="group">
            <Card className="h-full border-white/5 hover:border-[#74C69D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-blue-500/10 text-blue-300 rounded-lg">
                  <CloudSun size={20} />
                </span>
                <span className="text-white/30 group-hover:text-blue-300 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                {t("common.weather")}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                Assess heat ranges, rainfall predictions and micro pathogen risk scales.
              </p>
            </Card>
          </Link>

          <Link to="/assistant" className="group">
            <Card className="h-full border-white/5 hover:border-[#74C69D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-purple-500/10 text-purple-300 rounded-lg">
                  <Sparkles size={20} />
                </span>
                <span className="text-white/30 group-hover:text-purple-300 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                {t("common.assistant")}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                Chat with our local RAG intelligence matching 50+ regional crop queries.
              </p>
            </Card>
          </Link>

          <Link to="/reports" className="group">
            <Card className="h-full border-white/5 hover:border-[#74C69D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-rose-500/10 text-rose-300 rounded-lg">
                  <ClipboardList size={20} />
                </span>
                <span className="text-white/30 group-hover:text-rose-300 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-rose-300 transition-colors">
                {t("common.reports")}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                Compile historical records and download official certified farm PDFs.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
