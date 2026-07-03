import { ReactNode } from "react";
import { motion } from "framer-motion";
import { HeroCard } from "./HeroCard";
import { LucideIcon } from "lucide-react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children?: ReactNode;
  variant?: "emerald" | "deep";
}

/**
 * Standard premium page header used across secondary screens.
 * Provides the same dark-emerald surface as the dashboard hero.
 */
export const PageHero = ({ title, subtitle, icon: Icon, action, children, variant = "emerald" }: PageHeroProps) => (
  <HeroCard className="p-6" variant={variant} pattern>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="h-12 w-12 rounded-2xl flex items-center justify-center bg-white/10 border border-white/15 backdrop-blur-md shrink-0"
          >
            <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
          </motion.div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-white leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/70 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children && <div className="mt-5">{children}</div>}
  </HeroCard>
);
