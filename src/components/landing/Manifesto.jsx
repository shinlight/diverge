// src/components/landing/Manifesto.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { useI18n } from "../../lib/i18n/LanguageContext";

export default function Manifesto() {
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
    <SectionWrap id="manifesto" bg="cream">
      <motion.div {...anim} className="max-w-[1000px] mx-auto">
        <p
          className="lp-mono mb-[34px] text-[12.5px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "#b87716" }}
        >
          Manifesto
        </p>
        <p
          className="lp-display mb-9 text-3xl font-[500] leading-[1.22] sm:text-[40px]"
          style={{ letterSpacing: "-0.02em", color: "var(--lp-cream-ink)" }}
        >
          {t("landing.manifesto.seg1")}
          <span style={{ color: "#2fb380" }}>{t("landing.manifesto.kw1")}</span>
          {t("landing.manifesto.seg2")}
          <span style={{ color: "#2fb380" }}>{t("landing.manifesto.kw2")}</span>
          {t("landing.manifesto.seg3")}
        </p>
        <p
          className="lp-mono text-[14px] font-medium uppercase leading-[1.5] tracking-[0.04em]"
          style={{ color: "var(--lp-cream-muted)" }}
        >
          {t("landing.manifesto.closing")}
        </p>
      </motion.div>
    </SectionWrap>
  );
}
