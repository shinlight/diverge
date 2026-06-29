// src/components/landing/BuiltForYourBrain.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker, Pill } from "./MonoKicker";
import { useI18n } from "../../lib/i18n/LanguageContext";

const FEATURES = [
  { key: "f1", color: "#22b8cf", borderColor: "rgba(34,184,207,.4)" },
  { key: "f2", color: "#2fb380", borderColor: "rgba(47,179,128,.4)" },
  { key: "f3", color: "#8f78ff", borderColor: "rgba(143,120,255,.4)" },
  { key: "f4", color: "#e864c4", borderColor: "rgba(232,100,196,.4)" },
  { key: "f5", color: "#f0a132", borderColor: "rgba(240,161,50,.4)" },
  { key: "f6", color: "#22b8cf", borderColor: "rgba(34,184,207,.4)" },
];

export default function BuiltForYourBrain() {
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
    <SectionWrap>
      <motion.div {...anim}>
        <MonoKicker className="mb-[22px]">{t("landing.brain.kicker")}</MonoKicker>
        <h2
          className="lp-display mb-14 max-w-[20ch] text-[32px] font-semibold leading-[1.04] sm:text-[48px]"
          style={{ letterSpacing: "-0.025em", color: "var(--lp-content)" }}
        >
          {t("landing.brain.h2")}
        </h2>

        <div className="flex flex-col">
          {FEATURES.map(({ key, color, borderColor }, i) => (
            <div
              key={key}
              className="grid gap-10 py-[30px] md:grid-cols-[.8fr_1.2fr]"
              style={{
                borderTop: "1px solid var(--lp-line)",
                borderBottom: i === FEATURES.length - 1 ? "1px solid var(--lp-line)" : undefined,
                alignItems: "baseline",
              }}
            >
              {/* LEFT — name + tag pill */}
              <div>
                <h3
                  className="lp-display mb-2.5 text-[26px] font-semibold"
                  style={{ letterSpacing: "-0.01em", color: "var(--lp-content)" }}
                >
                  {t(`landing.brain.${key}.name`)}
                </h3>
                <span
                  className="lp-mono inline-flex items-center rounded-full px-[11px] py-1.5 text-[11px] font-medium uppercase tracking-[0.06em]"
                  style={{ color, border: `1px solid ${borderColor}` }}
                >
                  {t(`landing.brain.${key}.tag`)}
                </span>
              </div>
              {/* RIGHT — description */}
              <p
                className="text-[18px] leading-[1.55]"
                style={{ color: "var(--lp-muted)" }}
              >
                {t(`landing.brain.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionWrap>
  );
}
