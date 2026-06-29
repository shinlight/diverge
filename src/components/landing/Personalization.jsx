// src/components/landing/Personalization.jsx
import { motion, useReducedMotion } from "framer-motion";
import SectionWrap from "./SectionWrap";
import { MonoKicker } from "./MonoKicker";
import { useI18n } from "../../lib/i18n/LanguageContext";

const ACCENT_SWATCHES = [
  { color: "#8f78ff", active: true },
  { color: "#2fb380", active: false },
  { color: "#f0a132", active: false },
  { color: "#22b8cf", active: false },
  { color: "#e864c4", active: false },
  { color: "#f97316", active: false },
];

export default function Personalization() {
  const { t, lang } = useI18n();
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
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        {/* LEFT — text */}
        <div>
          <MonoKicker className="mb-[22px]">{t("landing.personalization.kicker")}</MonoKicker>
          <h2
            className="lp-display mb-6 max-w-[14ch] text-[32px] font-semibold leading-[1.04] sm:text-[48px]"
            style={{ letterSpacing: "-0.025em", color: "var(--lp-content)" }}
          >
            {t("landing.personalization.h2")}
          </h2>
          <p
            className="max-w-[46ch] text-[19px] leading-[1.55]"
            style={{ color: "var(--lp-muted)" }}
          >
            {t("landing.personalization.body")}
          </p>
        </div>

        {/* RIGHT — preferences mock panel */}
        <div
          className="rounded-[18px] p-[30px]"
          style={{
            background: "var(--lp-panel)",
            border: "1px solid var(--lp-line)",
          }}
        >
          {/* Theme row */}
          <p
            className="lp-mono mb-3.5 text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: "var(--lp-mono-muted)" }}
          >
            {t("landing.personalization.themeLabel")}
          </p>
          <div className="mb-[26px] flex flex-wrap gap-2.5">
            {/* Light — unselected */}
            <span
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px]"
              style={{
                border: "1px solid rgba(239,233,221,.18)",
                color: "var(--lp-content)",
              }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ background: "#f4eee2", border: "1px solid rgba(0,0,0,.15)" }}
              />
              {t("landing.personalization.themeLight")}
            </span>
            {/* Cream — unselected */}
            <span
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px]"
              style={{
                border: "1px solid rgba(239,233,221,.18)",
                color: "var(--lp-content)",
              }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ background: "#e7e0d2" }}
              />
              {t("landing.personalization.themeCream")}
            </span>
            {/* Total Black — selected */}
            <span
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px]"
              style={{
                border: "1px solid #8f78ff",
                background: "rgba(143,120,255,.12)",
                color: "var(--lp-content)",
              }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ background: "#0a0a0a" }}
              />
              {t("landing.personalization.themeBlack")}
            </span>
          </div>

          {/* Accent swatches */}
          <p
            className="lp-mono mb-3.5 text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: "var(--lp-mono-muted)" }}
          >
            {t("landing.personalization.accentLabel")}
          </p>
          <div className="mb-[26px] flex flex-wrap gap-3">
            {ACCENT_SWATCHES.map(({ color, active }) => (
              <span
                key={color}
                className="inline-block h-[30px] w-[30px] rounded-full"
                style={{
                  background: color,
                  ...(active
                    ? { outline: "2px solid var(--lp-content)", outlineOffset: "2px" }
                    : {}),
                }}
              />
            ))}
          </div>

          {/* Dashed chips */}
          <div className="flex flex-wrap gap-2.5">
            {[
              t("landing.personalization.drag"),
              t("landing.personalization.pin"),
              t("landing.personalization.dilate"),
              t("landing.personalization.lang"),
            ].map((label) => (
              <span
                key={label}
                className="lp-mono rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-[0.06em]"
                style={{
                  border: "1px dashed rgba(239,233,221,.25)",
                  color: "var(--lp-muted)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        </div>

        {/* The same dashboard, your way — total black theme */}
        <div
          className="mt-12 overflow-hidden rounded-[18px]"
          style={{
            border: "1px solid var(--lp-line)",
            backgroundColor: "var(--lp-panel)",
          }}
        >
          <img
            src={`/landing/08-dashboard-totalblack.${lang}.png`}
            alt={t("landing.personalization.h2")}
            loading="lazy"
            className="block w-full h-auto"
          />
        </div>
      </motion.div>
    </SectionWrap>
  );
}
