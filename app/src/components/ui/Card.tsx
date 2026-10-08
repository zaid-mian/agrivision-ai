import React from "react";
import { motion } from "motion/react";

interface CardProps {
  hoverEffect?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = "",
  hoverEffect = true,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-xl text-white ${className}`}
      {...props}
    >
      {/* Subtle top ambient sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
