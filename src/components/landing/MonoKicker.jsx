// src/components/landing/MonoKicker.jsx
export function MonoKicker({ children, className = "", color = "var(--lp-accent)" }) {
  return (
    <p
      className={`lp-mono text-[12px] font-medium uppercase tracking-[0.2em] ${className}`}
      style={{ color }}
    >
      {children}
    </p>
  );
}

export function Pill({ children, color = "var(--lp-accent)", filled = false }) {
  return (
    <span
      className="lp-mono inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
      style={
        filled
          ? { background: color, color: "var(--lp-accent-ink)" }
          : { border: `1px solid ${color}`, color }
      }
    >
      {children}
    </span>
  );
}
