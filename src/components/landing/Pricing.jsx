// src/components/landing/Pricing.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker, Pill } from "./MonoKicker";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { PLANS } from "../../lib/payments/plans.js";

export default function Pricing() {
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
    <SectionWrap id="pricing">
      <motion.div {...anim}>
        {/* Heading */}
        <div className="mb-14 text-center">
          <MonoKicker className="mb-5">{t("landing.pricing.kicker")}</MonoKicker>
          <h2
            className="lp-display text-[44px] font-semibold leading-[1.04] sm:text-[48px]"
            style={{ letterSpacing: "-0.025em" }}
          >
            {t("landing.pricing.h2")}
          </h2>
        </div>

        {/* Plan cards */}
        <div className="mx-auto grid max-w-[900px] gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const isHighlighted = plan.highlighted === true;
            const priceStr = plan.price === 0 ? "€0" : `€${plan.price}`;
            const featureKeys = plan.id === "free"
              ? ["f1", "f2", "f3"]
              : ["f1", "f2", "f3", "f4"];
            const checkColor = isHighlighted ? "var(--lp-accent)" : "#2fb380";
            const textColor = isHighlighted ? "var(--lp-content)" : "var(--lp-muted)";

            return (
              <div
                key={plan.id}
                className="relative flex flex-col rounded-[20px] p-10"
                style={{
                  border: isHighlighted
                    ? "2px solid var(--lp-accent)"
                    : "1px solid rgba(239,233,221,0.16)",
                  background: isHighlighted
                    ? "rgba(143,120,255,0.06)"
                    : "transparent",
                }}
              >
                {/* Badge */}
                {isHighlighted && (
                  <span
                    className="absolute left-10"
                    style={{ top: "-12px" }}
                  >
                    <Pill filled>{t("landing.pricing.badge")}</Pill>
                  </span>
                )}

                {/* Plan name */}
                <div
                  className="lp-display mb-2 text-[22px] font-semibold"
                >
                  {t(`landing.pricing.${plan.id}.name`)}
                </div>

                {/* Price */}
                <div className="mb-1.5 flex items-baseline gap-2">
                  <span
                    className="lp-display font-semibold"
                    style={{ fontSize: "52px", letterSpacing: "-0.02em" }}
                  >
                    {priceStr}
                  </span>
                </div>

                {/* Period label */}
                <div
                  className="lp-mono mb-7 text-[12px] uppercase tracking-[0.04em]"
                  style={{ color: isHighlighted ? "var(--lp-accent)" : "var(--lp-mono-muted)" }}
                >
                  {t(`landing.pricing.period.${plan.id}`)}
                </div>

                {/* Features */}
                <div className="mb-8 flex flex-col gap-3.5 text-[16px]" style={{ color: textColor }}>
                  {featureKeys.map((fk) => (
                    <span key={fk} className="flex gap-2.5">
                      <span style={{ color: checkColor }}>✓</span>
                      {t(`landing.pricing.${plan.id}.${fk}`)}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href="#cta"
                  className="mt-auto block rounded-full py-3.5 text-center text-[15px] font-semibold"
                  style={
                    isHighlighted
                      ? { background: "var(--lp-accent)", color: "var(--lp-accent-ink)" }
                      : {
                          border: "1px solid rgba(239,233,221,0.3)",
                          color: "var(--lp-content)",
                        }
                  }
                >
                  {t(`landing.pricing.${plan.id}.cta`)}
                </a>
              </div>
            );
          })}
        </div>

        {/* Methods line */}
        <p
          className="lp-mono mt-7 text-center text-[12px] uppercase tracking-[0.04em]"
          style={{ color: "var(--lp-mono-muted)", lineHeight: 1.6 }}
        >
          {t("landing.pricing.methods")}
        </p>
      </motion.div>
    </SectionWrap>
  );
}
