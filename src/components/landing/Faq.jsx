// src/components/landing/Faq.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import { useI18n } from "../../lib/i18n/LanguageContext";

const QUESTIONS = ["q1", "q2", "q3", "q4", "q5"];

export default function Faq() {
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
      <motion.div className="mx-auto max-w-[860px]" {...anim}>
        <MonoKicker className="mb-5">FAQ</MonoKicker>
        <h2
          className="lp-display mb-12 text-[40px] font-semibold leading-[1.05] sm:text-[44px]"
          style={{ letterSpacing: "-0.025em" }}
        >
          {t("landing.faq.h2")}
        </h2>

        <div>
          {QUESTIONS.map((qk, i) => (
            <details
              key={qk}
              className="lp-faq-item"
              style={{
                borderTop: "1px solid rgba(239,233,221,0.13)",
                borderBottom: i === QUESTIONS.length - 1 ? "1px solid rgba(239,233,221,0.13)" : undefined,
                padding: "6px 0",
              }}
            >
              <summary
                className="flex items-center justify-between gap-5 py-[22px]"
              >
                <span
                  className="lp-display text-[18px] font-medium leading-snug sm:text-[20px]"
                >
                  {t(`landing.faq.${qk}.q`)}
                </span>
                <span
                  className="lp-faq-icon flex-none text-[24px]"
                  style={{ color: "var(--lp-accent)" }}
                >
                  +
                </span>
              </summary>
              <p
                className="max-w-[60ch] pb-6 text-[17px] leading-[1.6]"
                style={{ color: "var(--lp-muted)" }}
              >
                {t(`landing.faq.${qk}.a`)}
              </p>
            </details>
          ))}
        </div>
      </motion.div>
    </SectionWrap>
  );
}
