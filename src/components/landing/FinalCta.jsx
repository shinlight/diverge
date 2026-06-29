// src/components/landing/FinalCta.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import WaitlistForm from "./WaitlistForm";
import { useI18n } from "../../lib/i18n/LanguageContext";

export default function FinalCta() {
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
    <SectionWrap id="cta" bg="accent">
      <motion.div className="mx-auto max-w-[1000px] text-center" {...anim}>
        <MonoKicker
          className="mb-6"
          color="rgba(27,16,67,0.65)"
        >
          {t("landing.cta.kicker")}
        </MonoKicker>

        <h2
          className="lp-display mb-6 text-[46px] font-semibold leading-[1.02] sm:text-[58px]"
          style={{ color: "var(--lp-accent-ink)", letterSpacing: "-0.025em" }}
        >
          {t("landing.cta.h2")}
        </h2>

        <p
          className="mx-auto mb-10 max-w-[52ch] text-[18px] leading-[1.5] sm:text-[20px]"
          style={{ color: "rgba(42,31,107,0.85)" }}
        >
          {t("landing.cta.sub")}
        </p>

        <div className="flex flex-col items-center gap-5">
          <WaitlistForm dark={false} />
          <p
            className="lp-mono text-[12.5px] uppercase tracking-[0.04em]"
            style={{ color: "rgba(27,16,67,0.6)" }}
          >
            {t("landing.cta.social")}
          </p>
        </div>
      </motion.div>
    </SectionWrap>
  );
}
