/**
 * Aurora background — soft radial glows only (no decorative lines).
 * Purely decorative. Use inside a relative/overflow-hidden container.
 */
export const AuroraBackground = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-40 blur-3xl aurora-drift"
        style={{ background: "radial-gradient(circle, rgba(61,255,179,0.45) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full opacity-30 blur-3xl aurora-drift"
        style={{ background: "radial-gradient(circle, rgba(22,166,114,0.5) 0%, transparent 70%)", animationDelay: "-4s" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
      />
    </div>
  );
};
