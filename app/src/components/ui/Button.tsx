import React from "react";
import { motion } from "motion/react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "glass";
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none overflow-hidden select-none cursor-pointer";

  const variants = {
    primary: "bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-lg shadow-green-950/20 active:scale-[0.98]",
    secondary: "bg-[#74C69D]/20 hover:bg-[#74C69D]/30 text-[#74C69D] border border-[#74C69D]/40 active:scale-[0.98]",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/35 active:scale-[0.98]",
    glass: "bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 text-white active:scale-[0.98]"
  };

  const selectedStyle = variants[variant];

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${selectedStyle} ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
