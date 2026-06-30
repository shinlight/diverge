// src/components/landing/SectionWrap.jsx
// Section shell: full-bleed bg, centered 1240px content, generous padding,
// hairline bottom border. bg variant switches the colour context.
const BG = {
  dark: { background: "var(--lp-bg)", color: "var(--lp-content)" },
  cream: { background: "var(--lp-cream)", color: "var(--lp-cream-ink)" },
  accent: { background: "var(--lp-accent)", color: "var(--lp-accent-ink)" },
};

export default function SectionWrap({ id, bg = "dark", className = "", children }) {
  return (
    <section id={id} style={{ ...BG[bg], borderColor: "var(--lp-line)" }} className="w-full border-b">
      <div className={`mx-auto max-w-[1240px] px-6 py-20 sm:px-16 sm:py-[120px] ${className}`}>
        {children}
      </div>
    </section>
  );
}
