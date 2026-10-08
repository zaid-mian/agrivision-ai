import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface HealthScoreGaugeProps {
  score: number;
}

export default function HealthScoreGauge({ score = 100 }: HealthScoreGaugeProps) {
  const { t } = useTranslation();

  // Constrain score
  const safeScore = Math.min(100, Math.max(0, score));

  // Circular gauge math
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Determine healthy levels color
  let scoreColor = "#74C69D"; // Optimal
  let statusText = t("dashboard.healthy");
  let gradientId = "greenGrad";

  if (safeScore < 50) {
    scoreColor = "#EF4444"; // Critical
    statusText = t("dashboard.critical");
    gradientId = "redGrad";
  } else if (safeScore < 80) {
    scoreColor = "#F59E0B"; // At Risk
    statusText = t("dashboard.warning");
    gradientId = "yellowGrad";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl h-64 text-center">
      <h3 className="text-sm font-semibold tracking-wide text-white/95 mb-4">
        {t("dashboard.healthGaugeTitle")}
      </h3>

      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D6A4F" />
              <stop offset="100%" stopColor="#74C69D" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Underlay tracking circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-white/10"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animating score ring */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Scoring text overlays */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-3xl font-extrabold tracking-tight text-white"
          >
            {safeScore}
          </motion.span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-white/50">
            {t("common.loading") ? "score" : "index"}
          </span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-xs font-semibold px-3 py-1 rounded-full border"
        style={{
          color: scoreColor,
          borderColor: `${scoreColor}30`,
          backgroundColor: `${scoreColor}10`
        }}
      >
        {statusText}
      </motion.p>
    </div>
  );
}
