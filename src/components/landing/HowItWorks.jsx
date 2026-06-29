// src/components/landing/HowItWorks.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import { useI18n } from "../../lib/i18n/LanguageContext";

const STEPS = ["s1", "s2", "s3"];
const NUMBERS = ["01", "02", "03"];

export default function HowItWorks() {
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
    <SectionWrap id="how">
      <motion.div {...anim}>
        <MonoKicker className="mb-6">
          {t("landing.how.kicker")}
        </MonoKicker>

        <h2
          className="lp-display text-4xl sm:text-[48px] leading-[1.04] tracking-[-0.025em] mb-16 max-w-[18ch]"
          style={{ color: "var(--lp-content)" }}
        >
          {t("landing.how.h2")}
        </h2>

        <div className="grid gap-12 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className="pt-6"
              style={{ borderTop: "2px solid var(--lp-accent)" }}
            >
              <div
                className="lp-display text-[40px] font-semibold mb-[18px]"
                style={{ color: "var(--lp-accent)" }}
              >
                {NUMBERS[i]}
              </div>
              <h3
                className="lp-display text-[24px] font-semibold tracking-[-0.01em] mb-3"
                style={{ color: "var(--lp-content)" }}
              >
                {t(`landing.how.${step}.title`)}
              </h3>
              <p
                className="text-[17px] leading-[1.55]"
                style={{ color: "var(--lp-muted)" }}
              >
                {t(`landing.how.${step}.body`)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionWrap>
  );
}
