// src/components/landing/LandingNav.jsx
import { useI18n } from "../../lib/i18n/LanguageContext";

export default function LandingNav() {
  const { t, lang, setLang } = useI18n();

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-[12px]"
      style={{
        background: "rgba(27,24,21,.86)",
        borderBottom: "1px solid rgba(239,233,221,.1)",
      }}
    >
      <div
        className="mx-auto flex max-w-[1240px] items-center justify-between px-6 sm:px-16"
        style={{ padding: "18px 64px" }}
      >
        {/* Wordmark */}
        <div
          className="lp-display flex items-center gap-2"
          style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          Divergify
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--lp-accent)",
              flexShrink: 0,
            }}
          />
        </div>

        {/* Nav links — hidden under md */}
        <div
          className="hidden md:flex items-center gap-[30px]"
          style={{ fontSize: "14.5px", color: "var(--lp-muted)" }}
        >
          <a href="#product" className="hover:opacity-80 transition-opacity">{t("landing.nav.product")}</a>
          <a href="#how" className="hover:opacity-80 transition-opacity">{t("landing.nav.how")}</a>
          <a href="#pricing" className="hover:opacity-80 transition-opacity">{t("landing.nav.pricing")}</a>
          <a href="#manifesto" className="hover:opacity-80 transition-opacity">{t("landing.nav.manifesto")}</a>
        </div>

        {/* Right side: lang toggle + CTA */}
        <div className="flex items-center gap-[18px]">
          <div
            className="lp-mono flex items-center"
            style={{ fontSize: "13px", color: "var(--lp-content)" }}
          >
            <button
              onClick={() => setLang("en")}
              style={{
                background: "none",
                border: "none",
                padding: "0 5px",
                cursor: "pointer",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                opacity: lang === "en" ? 1 : 0.4,
                fontWeight: lang === "en" ? 700 : 400,
              }}
            >
              EN
            </button>
            <span style={{ opacity: 0.3 }}>/</span>
            <button
              onClick={() => setLang("it")}
              style={{
                background: "none",
                border: "none",
                padding: "0 5px",
                cursor: "pointer",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                opacity: lang === "it" ? 1 : 0.4,
                fontWeight: lang === "it" ? 700 : 400,
              }}
            >
              IT
            </button>
          </div>

          <a
            href="#cta"
            style={{
              background: "var(--lp-accent)",
              color: "var(--lp-accent-ink)",
              padding: "11px 20px",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            {t("landing.nav.cta")}
          </a>
        </div>
      </div>
    </nav>
  );
}
