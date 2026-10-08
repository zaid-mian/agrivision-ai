import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, MapPin, Eye, EyeOff, Clover } from "lucide-react";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";

export default function Register() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength gauge
  const getPasswordStrength = () => {
    if (!password) return { text: "", color: "bg-transparent", percentage: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { text: t("auth.weak"), color: "bg-red-500", percentage: 33 };
    if (score <= 4) return { text: t("auth.medium"), color: "bg-amber-500", percentage: 66 };
    return { text: t("auth.strong"), color: "bg-green-500", percentage: 100 };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError(t("auth.validation.name"));
      return;
    }
    if (!email.includes("@")) {
      setError(t("auth.validation.email"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.validation.password"));
      return;
    }
    if (!location.trim()) {
      setError(t("auth.validation.location"));
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, location);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete registration. Please check inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F2016] via-[#153022] to-[#0A120D] px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D6A4F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#74C69D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card hoverEffect={false} className="border-white/10 shadow-2xl bg-black/40 p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-[#2D6A4F]/20 rounded-2xl border border-[#74C69D]/30 mb-3">
              <Clover size={36} className="text-[#74C69D]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              {t("auth.register")}
            </h1>
            <p className="text-white/60 text-xs mt-1">
              Join the smart farming advisor network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            <div className="space-y-1">
              <label htmlFor="regName" className="text-xs font-semibold text-white/80 block">
                {t("auth.name")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  id="regName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmad Saeed"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="regEmail" className="text-xs font-semibold text-white/80 block">
                {t("auth.email")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="regEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmad@farm.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="regPassword" className="text-xs font-semibold text-white/80 block">
                {t("auth.password")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="regPassword"
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

              {/* Password strength display box */}
              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/60">{t("auth.passwordStrength")}</span>
                    <span className="font-semibold" style={{ color: strength.percentage === 100 ? "#4ade80" : strength.percentage === 66 ? "#fbbf24" : "#f87171" }}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="regLoc" className="text-xs font-semibold text-white/80 block">
                {t("auth.location")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/40 pointer-events-none">
                  <MapPin size={16} />
                </span>
                <input
                  id="regLoc"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Sargodha, Punjab"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              {t("auth.register")}
            </Button>
          </form>

          <p className="text-xs text-center text-white/50 mt-5">
            {t("auth.hasAccount")}{" "}
            <Link
              to="/login"
              className="text-[#74C69D] font-medium hover:underline ml-1"
            >
              {t("auth.login")}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
