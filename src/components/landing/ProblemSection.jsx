// src/components/landing/ProblemSection.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import Placeholder from "./Placeholder";
import { useI18n } from "../../lib/i18n/LanguageContext";

const PAIN_POINTS = ["p1", "p2", "p3"];
const INDEXES = ["01", "02", "03"];

export default function ProblemSection() {
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
    <SectionWrap bg="cream">
      <motion.div
        {...anim}
        className="grid gap-16 lg:grid-cols-[1.05fr_.95fr] items-center"
      >
        {/* Left column */}
        <div>
          <MonoKicker
            className="mb-7"
            color="#b87716"
          >
            {t("landing.problem.kicker")}
          </MonoKicker>

          <h2
            className="lp-display text-4xl sm:text-5xl lg:text-[52px] leading-[1.03] tracking-[-0.025em] mb-6 max-w-[14ch]"
            style={{ color: "var(--lp-cream-ink)" }}
          >
            {t("landing.problem.h2")}
          </h2>

          <p
            className="text-[19px] leading-[1.55] mb-9 max-w-[46ch]"
            style={{ color: "var(--lp-cream-muted)" }}
          >
            {t("landing.problem.sub")}
          </p>

          {/* Numbered pain points */}
          <div className="flex flex-col">
            {PAIN_POINTS.map((key, i) => (
              <div
                key={key}
                className="flex gap-4 py-[18px]"
                style={{
                  borderTop: "1px solid rgba(33,31,27,.16)",
                  borderBottom:
                    i === PAIN_POINTS.length - 1
                      ? "1px solid rgba(33,31,27,.16)"
                      : undefined,
                }}
              >
                <span
                  className="lp-mono text-[14px] font-medium shrink-0 pt-[2px]"
                  style={{ color: "#b87716" }}
                >
                  {INDEXES[i]}
                </span>
                <span
                  className="text-[18px] leading-[1.5]"
                  style={{ color: "var(--lp-cream-ink)" }}
                >
                  {t(`landing.problem.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — placeholder */}
        <Placeholder
          height={520}
          caption={t("landing.problem.photoCaption")}
        />
      </motion.div>
    </SectionWrap>
  );
}
