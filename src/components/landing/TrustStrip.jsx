// src/components/landing/TrustStrip.jsx
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../../lib/i18n/LanguageContext";
import SectionWrap from "./SectionWrap";

export default function TrustStrip() {
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
    <SectionWrap className="!py-0">
      <motion.div
        {...anim}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10 py-9"
      >
        {/* Count + label */}
        <div className="flex items-baseline gap-[14px]">
          <span
            className="lp-display"
            style={{ fontSize: "34px", fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            {t("landing.trust.count")}
          </span>
          <span
            className="lp-mono"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: 1.4,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--lp-mono-muted)",
              whiteSpace: "pre-line",
            }}
          >
            {t("landing.trust.countLabel")}
          </span>
        </div>

        {/* Quote */}
        <div
          style={{
            flex: 1,
            minWidth: "260px",
            maxWidth: "520px",
            fontSize: "18px",
            lineHeight: 1.5,
            color: "#cfc8ba",
          }}
        >
          <span style={{ fontStyle: "italic" }}>{t("landing.trust.quote")}</span>
          <span
            className="lp-mono"
            style={{
              display: "block",
              marginTop: "8px",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--lp-accent)",
            }}
          >
            {t("landing.trust.quoteAttr")}
          </span>
        </div>

        {/* Badge */}
        <div
          className="lp-mono flex items-center gap-[10px]"
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--lp-muted)",
            whiteSpace: "pre-line",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#2fb380",
              flexShrink: 0,
            }}
          />
          {t("landing.trust.badge")}
        </div>
      </motion.div>
    </SectionWrap>
  );
}
