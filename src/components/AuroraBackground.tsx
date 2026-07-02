/**
 * Aurora background — translucent geometric flow shapes for hero surfaces.
 * Purely decorative SVG. Use inside a relative/overflow-hidden container.
 */
export const AuroraBackground = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Soft radial glow */}
      <div
        className="absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-40 blur-3xl aurora-drift"
        style={{ background: "radial-gradient(circle, rgba(61,255,179,0.45) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full opacity-30 blur-3xl aurora-drift"
        style={{ background: "radial-gradient(circle, rgba(22,166,114,0.5) 0%, transparent 70%)", animationDelay: "-4s" }}
      />

      {/* Aurora curves */}
      <svg
        viewBox="0 0 400 240"
        className="absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="none"
        style={{ mixBlendMode: "screen" }}
      >
        <defs>
          <linearGradient id="aurora-stroke-1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3DFFB3" stopOpacity="0" />
            <stop offset="50%" stopColor="#3DFFB3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3DFFB3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aurora-stroke-2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#16A672" stopOpacity="0" />
            <stop offset="60%" stopColor="#16A672" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#16A672" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -20 180 Q 100 60 220 130 T 440 90"
          stroke="url(#aurora-stroke-1)"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M -20 210 Q 120 110 240 170 T 440 140"
          stroke="url(#aurora-stroke-2)"
          strokeWidth="1"
          fill="none"
        />
        {/* Translucent triangle accents */}
        <polygon points="320,20 380,10 350,80" fill="rgba(61,255,179,0.08)" />
        <polygon points="30,90 90,60 70,150" fill="rgba(255,255,255,0.05)" />
      </svg>

      {/* Fine noise/highlight top */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
      />
    </div>
  );
};
