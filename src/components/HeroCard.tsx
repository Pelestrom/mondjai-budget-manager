import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "./AuroraBackground";

interface HeroCardProps {
  children: ReactNode;
  className?: string;
  variant?: "emerald" | "deep";
}

/**
 * Dark premium hero surface — deep-green gradient + aurora shapes.
 * Foundational visual for MonDjai: use on dashboard header, login, feature banners.
 */
export const HeroCard = ({ children, className = "", variant = "emerald" }: HeroCardProps) => {
  const bg = variant === "deep"
    ? "var(--gradient-hero-dark)"
    : "var(--gradient-hero-emerald)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`surface-hero text-white ${className}`}
      style={{ background: bg }}
    >
      <AuroraBackground />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
