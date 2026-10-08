import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { ClipboardList, FileText, Download, ShieldCheck, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Reports() {
  const { user, token, logout, apiFetch } = useAuth();
  const { t } = useTranslation();

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [highSeverityCount, setHighSeverityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        // Load diagnostics history from database
        const dbRes = await fetch("/farm_database.json").then((r) => r.json()).catch(() => null);
        if (dbRes && user) {
          const userScans = dbRes.diseaseResults.filter((r: any) => r.userId === user.id);
          // Sort descending
          userScans.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecentScans(userScans.slice(0, 10));
          setTotalScans(userScans.length);

          const highCount = userScans.filter((s: any) => s.severity === "high").length;
          setHighSeverityCount(highCount);
        }
      } catch (e) {
        console.error("Error loading stats:", e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadStats();
    }
  }, [user]);

  const handleDownloadPdf = async () => {
    if (!token) return;
    setIsDownloading(true);
    try {
      // Direct binary stream file downloader
      const response = await fetch("/api/reports/pdf", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        alert("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not construct PDF file binary");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Farm_Report_${user?.name.replace(/\s+/g, "_") || "Farmer"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error generating PDF document. Please retry shortly.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteScan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scan record?")) return;
    try {
      const res = await fetch(`/api/disease/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        alert("Your session has expired. Please log in again.");
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete record");
      }
      // Update state
      setRecentScans((prev) => prev.filter((s) => s.id !== id));
      setTotalScans((prev) => Math.max(0, prev - 1));
      
      // Re-fetch database to calculate high severity counts properly
      const dbRes = await fetch("/farm_database.json").then((r) => r.json()).catch(() => null);
      if (dbRes && user) {
        const userScans = dbRes.diseaseResults.filter((r: any) => r.userId === user.id);
        const highCount = userScans.filter((s: any) => s.severity === "high").length;
        setHighSeverityCount(highCount);
        setTotalScans(userScans.length);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete scan record.");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "text-red-400 border-red-500/30 bg-red-500/10";
      case "medium":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      default:
        return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">
            {t("reports.title")}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {t("reports.description")}
          </p>
        </div>

        {/* Generate PDF Button */}
        <Button
          onClick={handleDownloadPdf}
          isLoading={isDownloading}
          className="gap-2.5 self-start py-3.5 px-6 shadow-xl"
        >
          <FileText size={16} />
          {t("reports.generate")}
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/50">
          <RefreshCw size={24} className="animate-spin text-[#74C69D] mb-3" />
          <p className="text-sm">Assembling records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Metrics & Guidelines */}
          <div className="lg:col-span-4 space-y-6">
            <Card hoverEffect={false} className="border-white/10 bg-black/40 p-6 space-y-6">
              <h3 className="text-sm font-semibold tracking-wider text-[#74C69D] uppercase font-mono flex items-center gap-1.5 border-b border-white/5 pb-4">
                <ClipboardList size={16} />
                Auditor Summary
              </h3>

              <div className="space-y-5">
                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Total Compiled Scans</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{totalScans}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40 block">High Severity Critical Incidents</span>
                  <span className="text-3xl font-extrabold text-red-400 mt-1 block">{highSeverityCount}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Farming Plot Districts</span>
                  <span className="text-lg font-bold text-[#74C69D] mt-1 block truncate">{user?.location || "N/A"}</span>
                </div>
              </div>
            </Card>

            <Card hoverEffect={false} className="bg-[#2D6A4F]/5 border-[#2D6A4F]/20 p-5 flex items-start gap-3">
              <span className="p-1.5 bg-[#2D6A4F]/25 text-[#74C69D] rounded-lg">
                📋
              </span>
              <div className="space-y-1.5 text-xs text-white/80 leading-relaxed">
                <h4 className="font-semibold text-white">Certified Diagnostic Reports</h4>
                <p className="text-white/50">
                  Reports compile last 30 days of leaf disease incidents, compound soil nutrient recommendations, seasonal weather warnings, and farm ecological indices.
                </p>
              </div>
            </Card>
          </div>

          {/* Historical Audits Table */}
          <div className="lg:col-span-8">
            <Card hoverEffect={false} className="border-white/10 bg-black/40 overflow-hidden p-0">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-base font-semibold text-white">
                  {t("reports.historicalTable")}
                </h3>
              </div>

              {recentScans.length === 0 ? (
                <div className="py-20 text-center text-white/40 text-xs">
                  {t("reports.noRecords")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 uppercase font-mono text-white/50 tracking-wider border-b border-white/10">
                        <th className="px-6 py-4">{t("reports.tableHeader.date")}</th>
                        <th className="px-6 py-4">{t("reports.tableHeader.disease")}</th>
                        <th className="px-6 py-4">{t("reports.tableHeader.severity")}</th>
                        <th className="px-6 py-4 text-right">{t("reports.tableHeader.confidence")}</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentScans.map((scan) => (
                        <tr key={scan.id} className="hover:bg-white/5 text-white/90">
                          <td className="px-6 py-4 font-mono">
                            {new Date(scan.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#74C69D]">
                            {scan.disease}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase ${getSeverityBadge(scan.severity)}`}>
                              {scan.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold">
                            {Math.round(scan.confidence * 100)}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteScan(scan.id)}
                              className="inline-flex items-center justify-center p-1 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg border border-transparent hover:border-red-500/20 transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
