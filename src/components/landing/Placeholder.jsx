// src/components/landing/Placeholder.jsx
// Editorial placeholder for a real photo/screenshot. Diagonal stripes +
// monospace caption in [square brackets]. Replace with <img> at go-live.
export default function Placeholder({ caption, height = 480, className = "" }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[18px] ${className}`}
      style={{
        height,
        border: "1px solid var(--lp-line)",
        backgroundColor: "var(--lp-panel)",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(239,233,221,.05) 0 12px, transparent 12px 24px)",
      }}
    >
      <span
        className="lp-mono absolute bottom-4 left-4 right-4 text-[11px] uppercase tracking-[0.12em]"
        style={{ color: "var(--lp-mono-muted)" }}
      >
        {caption}
      </span>
    </div>
  );
}
