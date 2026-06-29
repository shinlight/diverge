// src/components/landing/Hero.jsx
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../../lib/i18n/LanguageContext";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import Placeholder from "./Placeholder";
import CockpitBand from "./CockpitBand";

// Mini floating product card — 2x2 grid of widget tile stubs
function FloatingProductCard({ label }) {
  const TILE_LABELS = ["Gmail", "Calendar", "To-Do", "Weather"];
  return (
    <div
      className="hidden md:block absolute"
      style={{
        bottom: "-26px",
        left: "-34px",
        width: "290px",
        background: "#2a251d",
        border: "1px solid rgba(239,233,221,.14)",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 22px 48px rgba(0,0,0,.5)",
      }}
    >
      {/* Traffic-light dots */}
      <div className="flex gap-[6px]" style={{ marginBottom: "12px" }}>
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#2fb380", display: "inline-block" }} />
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#f0a132", display: "inline-block" }} />
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--lp-accent)", display: "inline-block" }} />
      </div>

      {/* 2x2 widget grid */}
      <div className="grid grid-cols-2 gap-2">
        {TILE_LABELS.map((name) => (
          <div
            key={name}
            style={{
              height: "52px",
              borderRadius: "8px",
              backgroundColor: "#352f25",
              backgroundImage:
                "repeating-linear-gradient(135deg,rgba(239,233,221,.05) 0 8px,transparent 8px 16px)",
              display: "flex",
              alignItems: "flex-end",
              padding: "6px 8px",
            }}
          >
            <span
              className="lp-mono"
              style={{
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(239,233,221,.4)",
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>

      <div
        className="lp-mono"
        style={{
          marginTop: "10px",
          fontSize: "10.5px",
          fontWeight: 500,
          lineHeight: 1,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#9a9183",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.4 },
      };

  return (
    <SectionWrap id="hero" className="!py-0 !px-0">
      {/* Main hero grid */}
      <motion.div
        {...anim}
        className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] items-center gap-16 px-6 sm:px-16 pt-20 sm:pt-24 pb-16 sm:pb-20"
      >
        {/* LEFT — copy */}
        <div>
          <MonoKicker className="mb-7">{t("landing.hero.kicker")}</MonoKicker>

          <h1
            className="lp-display"
            style={{
              fontWeight: 600,
              fontSize: "clamp(42px, 5vw, 66px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              margin: "0 0 26px",
              maxWidth: "15ch",
            }}
          >
            {t("landing.hero.h1Before")}{" "}
            <span style={{ color: "var(--lp-accent)" }}>
              {t("landing.hero.h1Accent")}
            </span>{" "}
            {t("landing.hero.h1After")}
          </h1>

          <p
            style={{
              fontSize: "19px",
              lineHeight: 1.55,
              color: "var(--lp-muted)",
              maxWidth: "46ch",
              margin: "0 0 36px",
            }}
          >
            {t("landing.hero.sub")}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#cta"
              style={{
                background: "var(--lp-accent)",
                color: "var(--lp-accent-ink)",
                padding: "15px 28px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "16px",
                display: "inline-block",
              }}
            >
              {t("landing.hero.ctaPrimary")}
            </a>
            <a
              href="#how"
              style={{
                fontSize: "16px",
                color: "var(--lp-content)",
                borderBottom: "1.5px solid rgba(239,233,221,.6)",
                paddingBottom: "2px",
              }}
            >
              {t("landing.hero.ctaSecondary")}
            </a>
          </div>
        </div>

        {/* RIGHT — portrait placeholder + floating card */}
        <div className="relative" style={{ alignSelf: "stretch", minHeight: "480px" }}>
          <Placeholder
            caption={t("landing.hero.portrait")}
            height={480}
          />
          <FloatingProductCard label={t("landing.hero.floatingCard")} />
        </div>
      </motion.div>

      {/* Cockpit band — full width inside the section */}
      <div className="px-6 sm:px-16 pb-11">
        <CockpitBand />
      </div>
    </SectionWrap>
  );
}
