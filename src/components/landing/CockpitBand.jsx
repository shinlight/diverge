// src/components/landing/CockpitBand.jsx
import { useI18n } from "../../lib/i18n/LanguageContext";

const DIVIDER = (
  <span
    className="hidden sm:inline-block"
    style={{
      width: "1px",
      height: "16px",
      background: "rgba(239,233,221,.16)",
      flexShrink: 0,
    }}
  />
);

export default function CockpitBand() {
  const { t } = useI18n();
  const c = (key) => t(`landing.hero.cockpit.${key}`);

  return (
    <div
      className="lp-mono flex flex-wrap items-center gap-[22px] rounded-[16px]"
      style={{
        background: "#252019",
        border: "1px solid rgba(239,233,221,.13)",
        padding: "16px 22px",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--lp-muted)",
      }}
    >
      {/* Today */}
      <span className="flex items-center gap-2">
        <span style={{ color: "var(--lp-accent)" }}>●</span>
        {c("today")}
      </span>

      {DIVIDER}

      {/* Next event */}
      <span style={{ color: "var(--lp-content)" }}>
        {c("next")}{" "}
        <span style={{ color: "#22b8cf" }}>{c("nextTime")}</span>
      </span>

      {DIVIDER}

      {/* Big 3 */}
      <span>
        {c("big3")}{" "}
        <span style={{ color: "#2fb380" }}>{c("big3Value")}</span>
      </span>

      {DIVIDER}

      {/* Inbox */}
      <span>
        {c("inbox")}{" "}
        <span style={{ color: "#f0a132" }}>{c("inboxValue")}</span>
      </span>

      {DIVIDER}

      {/* Weather */}
      <span>{c("weather")}</span>
    </div>
  );
}
