// src/components/landing/WidgetShowcase.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import Placeholder from "./Placeholder";
import { useI18n } from "../../lib/i18n/LanguageContext";

const CHIPS = [
  "Gmail",
  "Calendar",
  "To-Do",
  "Brain Dump",
  "AI Chat",
  "Weather",
  "Pomodoro",
  "Mood & Energy",
  "Habits",
];

export default function WidgetShowcase() {
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
    <SectionWrap id="product">
      <motion.div {...anim} className="text-center">
        <MonoKicker className="mb-6">
          {t("landing.showcase.kicker")}
        </MonoKicker>

        <h2
          className="lp-display text-4xl sm:text-[48px] leading-[1.04] tracking-[-0.025em] mx-auto mb-5 max-w-[18ch]"
          style={{ color: "var(--lp-content)" }}
        >
          {t("landing.showcase.h2")}
        </h2>

        <p
          className="text-[19px] leading-[1.55] max-w-[54ch] mx-auto mb-14"
          style={{ color: "var(--lp-muted)" }}
        >
          {t("landing.showcase.sub")}
        </p>

        <Placeholder
          height={560}
          caption={t("landing.showcase.photoCaption")}
        />

        {/* Widget chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-7">
          {CHIPS.map((chip) => (
            <span
              key={chip}
              className="lp-mono text-[12px] font-medium uppercase tracking-[0.04em] rounded-full px-[14px] py-[9px]"
              style={{
                color: "var(--lp-muted)",
                border: "1px solid rgba(239,233,221,.16)",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </motion.div>
    </SectionWrap>
  );
}
