import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "./AuroraBackground";
import cadrePattern from "@/assets/cadre.jpg";

interface HeroCardProps {
  children: ReactNode;
  className?: string;
  variant?: "emerald" | "deep";
  /** Overlay the geometric green pattern (subtle) for extra depth */
  pattern?: boolean;
}

/**
 * Dark premium hero surface — deep-green gradient + aurora shapes + optional geometric pattern.
 * Foundational visual for MonDjai: use on dashboard header, login, feature banners.
 */
export const HeroCard = ({ children, className = "", variant = "emerald", pattern = false }: HeroCardProps) => {
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
      {pattern && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url(${cadrePattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
          aria-hidden
        />
      )}
      {pattern && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 80% at 80% 0%, rgba(61,255,179,0.18) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(11,61,46,0.25) 0%, rgba(11,61,46,0.55) 100%)",
          }}
          aria-hidden
        />
      )}
      <AuroraBackground />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
