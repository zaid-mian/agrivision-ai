import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, Clover, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";

export default function Login() {
  const { login, loginDemo } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError(t("auth.validation.email"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.validation.password"));
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid login credentials. Please check and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setIsDemoLoading(true);
    try {
      await loginDemo();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to start demo mode. Please register or retry.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F2016] via-[#153022] to-[#0A120D] px-4 py-12 relative overflow-hidden font-sans">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D6A4F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#74C69D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Language Bar */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card hoverEffect={false} className="border-white/10 shadow-2xl bg-black/40 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="p-3 bg-[#2D6A4F]/20 rounded-2xl border border-[#74C69D]/30 mb-3 shadow-[0_0_20px_rgba(116,198,157,0.2)]"
            >
              <Clover size={36} className="text-[#74C69D]" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              AgriVision AI
            </h1>
            <p className="text-[#74C69D] text-[11px] mt-1 uppercase tracking-widest font-mono font-medium">
              Precision Agronomy & On-Device Pathology
            </p>
          </div>

          {/* 1-Click Instant Recruiter / Demo Access Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-[#2D6A4F]/30 to-[#74C69D]/15 border border-[#74C69D]/30 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#D8F3DC]">
              <Sparkles size={14} className="text-[#74C69D]" />
              <span>Hiring Manager / Portfolio Reviewer?</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full py-2.5 px-4 bg-[#52B788] hover:bg-[#74C69D] active:scale-[0.98] text-[#0A120D] text-xs font-bold rounded-xl transition shadow-lg shadow-[#52B788]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDemoLoading ? (
                <div className="h-4 w-4 border-2 border-[#0A120D] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Explore Live Demo as Model Farmer</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-white/50 font-mono">
              ⚡ Instant 1-click access with preloaded telemetry & scans
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="loginEmail" className="text-xs font-semibold text-white/80 block">
                {t("auth.email")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="loginEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="loginPassword" className="text-xs font-semibold text-white/80 block">
                {t("auth.password")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              {t("auth.login")}
            </Button>
          </form>

          <p className="text-xs text-center text-white/50 mt-5">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="text-[#74C69D] font-medium hover:underline ml-1"
            >
              {t("auth.register")}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
