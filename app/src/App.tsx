import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./i18n"; // Bootstrap translations
import { motion, AnimatePresence } from "motion/react";
import {
  Clover,
  LayoutDashboard,
  ShieldAlert,
  Droplets,
  CloudSun,
  ClipboardList,
  Sparkles,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Compass
} from "lucide-react";

// Import Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import CropRecommendation from "./pages/CropRecommendation";
import FertilizerRecommendation from "./pages/FertilizerRecommendation";
import Weather from "./pages/Weather";
import Reports from "./pages/Reports";
import RAGAssistant from "./pages/RAGAssistant";

// Protection Route Guard Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A120D] flex items-center justify-center text-white/50">
        <div className="animate-spin h-8 w-8 text-[#74C69D] border-4 border-t-transparent border-current rounded-full" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Sidebar & Main Layout Wrapper
function AppLayout() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Toggle dark/light class on body container
  useEffect(() => {
    const isLight = localStorage.getItem("agri-theme-light") === "true";
    setDarkMode(!isLight);
    if (isLight) {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const targetLight = darkMode; // if current dark, make light
    setDarkMode(!targetLight);
    if (targetLight) {
      document.body.classList.add("light");
      localStorage.setItem("agri-theme-light", "true");
    } else {
      document.body.classList.remove("light");
      localStorage.setItem("agri-theme-light", "false");
    }
  };

  const menuItems = [
    { name: t("common.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("common.disease"), path: "/disease", icon: ShieldAlert },
    { name: t("common.crop"), path: "/crop", icon: Clover },
    { name: t("common.fertilizer"), path: "/fertilizer", icon: Droplets },
    { name: t("common.weather"), path: "/weather", icon: CloudSun },
    { name: t("common.reports"), path: "/reports", icon: ClipboardList },
    { name: t("common.assistant"), path: "/assistant", icon: Sparkles }
  ];

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white transition-colors duration-200">
      {/* Dynamic Theme Color Styles */}
      <style>{`
        body.light {
          background-color: #F4F7F5 !important;
          color: #1A3A2B !important;
        }
        body.light .bg-neutral-950,
        body.light .bg-black\\/40,
        body.light .bg-white\\/15,
        body.light .bg-black\\/30 {
          background-color: #FFFFFF !important;
          color: #1A3A2B !important;
          border-color: #E2E8F0 !important;
        }
        body.light .bg-white\\/10,
        body.light .bg-white\\/5 {
          background-color: #F8FAFC !important;
          color: #1A3A2B !important;
          border-color: #E2E8F0 !important;
        }
        body.light .text-white,
        body.light .text-white\\/95,
        body.light .text-white\\/90 {
          color: #1A3A2B !important;
        }
        body.light .text-white\\/60,
        body.light .text-white\\/50,
        body.light .text-white\\/40 {
          color: #64748B !important;
        }
        body.light select,
        body.light option {
          background-color: #FFFFFF !important;
          color: #1A3A2B !important;
        }
      `}</style>

      {/* Desktop Sidebar menu panel */}
      <aside className="hidden lg:flex flex-col w-64 bg-black/40 border-r border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/5">
          <span className="p-2 bg-[#2D6A4F]/20 text-[#74C69D] rounded-xl border border-[#74C69D]/30">
            <Clover size={20} className="animate-spin-slow" />
          </span>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white font-serif">
              {t("common.appName")}
            </h2>
            <span className="text-[9px] text-[#74C69D] font-mono tracking-widest uppercase">
              AGRI-INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#2D6A4F] text-white shadow-lg shadow-green-950/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} className={isActive ? "text-emerald-200" : "text-white/50"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Farmer Session profile footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-[#2D6A4F]/20 text-[#74C69D] border border-[#74C69D]/20 rounded-xl flex items-center justify-center font-bold text-xs">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
              <p className="text-[10px] text-white/40 truncate">{user?.location}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main viewport panels */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header panel bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 lg:px-8 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 lg:hidden cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <span className="lg:hidden p-1.5 bg-[#2D6A4F]/10 rounded-lg">
              <Clover className="text-[#74C69D]" size={16} />
            </span>
            <div className="text-xs text-white/50 flex items-center gap-1.5">
              <Compass size={14} className="text-[#74C69D]" />
              <span className="font-mono font-medium hidden sm:inline">District Dashboard</span>
              <span className="font-mono font-bold text-white uppercase ml-1">
                {location.pathname.replace("/", "") || "Portal"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle option */}
            <button
              onClick={toggleTheme}
              title={darkMode ? t("common.lightMode") : t("common.darkMode")}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
            >
              {darkMode ? <Sun size={15} className="text-amber-300" /> : <Moon size={15} className="text-blue-300" />}
            </button>
          </div>
        </header>

        {/* Scrollable responsive viewport canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/crop" element={<CropRecommendation />} />
            <Route path="/fertilizer" element={<FertilizerRecommendation />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/assistant" element={<RAGAssistant />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile navigation side-drawer modal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />

            {/* Slide up Drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-neutral-950 border-r border-white/10 z-40 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Clover className="text-[#74C69D]" size={18} />
                  <span className="font-bold font-serif text-sm">{t("common.appName")}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? "bg-[#2D6A4F] text-white shadow-lg shadow-green-950/20"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-8 bg-[#2D6A4F]/20 text-[#74C69D] rounded-lg flex items-center justify-center font-bold text-xs border border-[#74C69D]/20">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
                    <p className="text-[10px] text-white/40 truncate">{user?.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 text-xs rounded-lg transition"
                >
                  <LogOut size={12} />
                  <span>{t("common.logout")}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
