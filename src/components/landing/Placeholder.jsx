// src/components/landing/Placeholder.jsx
// Editorial frame for a real photo/screenshot. When `src` is given it renders
// the real image inside the rounded, bordered frame; otherwise it falls back to
// the diagonal-stripe placeholder + monospace caption in [square brackets]
// (still used for the human-photo slots that have no asset yet).
export default function Placeholder({ caption, src, height = 480, className = "" }) {
  if (src) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-[18px] ${className}`}
        style={{
          border: "1px solid var(--lp-line)",
          backgroundColor: "var(--lp-panel)",
        }}
      >
        <img
          src={src}
          alt={caption || ""}
          loading="lazy"
          className="block w-full h-auto"
        />
      </div>
    );
  }

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
    />
  );
}
