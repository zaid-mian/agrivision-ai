import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("agri-platform-lang", lng);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("agri-platform-lang") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  // Synchronize document direction for RTL support
  useEffect(() => {
    if (i18n.language === "ur") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ur";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, [i18n.language]);

  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
      <button
        onClick={() => changeLanguage("en")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-200 cursor-pointer ${
          i18n.language !== "ur"
            ? "bg-[#2D6A4F] text-white shadow-md shadow-green-950/20"
            : "text-white/75 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Globe size={13} />
        EN
      </button>
      <button
        onClick={() => changeLanguage("ur")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
          i18n.language === "ur"
            ? "bg-[#2D6A4F] text-white shadow-md shadow-green-950/20"
            : "text-white/75 hover:bg-white/5 hover:text-white"
        }`}
      >
        اردو
      </button>
    </div>
  );
}
