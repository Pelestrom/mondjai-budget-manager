import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type Tone = "primary" | "success" | "danger" | "warning" | "info" | "muted" | "glass";

const toneStyles: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  success: "chip-success",
  danger:  "chip-danger",
  warning: "chip-warning",
  info:    "chip-info",
  muted:   "bg-muted text-muted-foreground",
  glass:   "bg-white/15 text-white backdrop-blur-md border border-white/20",
};

interface IconBadgeProps {
  icon?: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

export const IconBadge = ({ icon: Icon, tone = "primary", size = "md", className = "", children }: IconBadgeProps) => {
  const sizes = {
    sm: "h-8 w-8 rounded-xl",
    md: "h-10 w-10 rounded-2xl",
    lg: "h-12 w-12 rounded-2xl",
  };
  const iconSizes = { sm: 16, md: 18, lg: 22 };
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${sizes[size]} ${toneStyles[tone]} ${className}`}>
      {Icon ? <Icon size={iconSizes[size]} strokeWidth={2.2} /> : children}
    </span>
  );
};
