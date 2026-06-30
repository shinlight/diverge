// src/components/landing/LandingFooter.jsx
import { useI18n } from "../../lib/i18n/LanguageContext";

export default function LandingFooter() {
  const { t, setLang } = useI18n();

  return (
    <footer
      style={{
        background: "var(--lp-bg)",
        color: "var(--lp-content)",
        borderTop: "1px solid var(--lp-line)",
      }}
    >
      {/* 4-column grid */}
      <div
        className="mx-auto grid max-w-[1240px] gap-10 px-6 pb-10 pt-20 sm:px-16 md:grid-cols-4"
        style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}
      >
        {/* Brand */}
        <div>
          <div
            className="lp-display mb-3.5 flex items-center gap-2 text-[22px] font-semibold"
          >
            Divergify
            <span
              className="inline-block rounded-full"
              style={{ width: 8, height: 8, background: "var(--lp-accent)" }}
            />
          </div>
          <p
            className="max-w-[32ch] text-[15px] leading-[1.5]"
            style={{ color: "var(--lp-mono-muted)" }}
          >
            {t("landing.footer.tagline")}
          </p>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-3 text-[14.5px]" style={{ color: "var(--lp-muted)" }}>
          <span
            className="lp-mono mb-1 text-[11px] uppercase tracking-[0.08em]"
            style={{ color: "#6f685c" }}
          >
            {t("landing.footer.product")}
          </span>
          <a href="#product">{t("landing.footer.p1")}</a>
          <a href="#how">{t("landing.footer.p2")}</a>
          <a href="#pricing">{t("landing.footer.p3")}</a>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3 text-[14.5px]" style={{ color: "var(--lp-muted)" }}>
          <span
            className="lp-mono mb-1 text-[11px] uppercase tracking-[0.08em]"
            style={{ color: "#6f685c" }}
          >
            {t("landing.footer.company")}
          </span>
          <a href="#manifesto">Manifesto</a>
          <a href={`mailto:${t("landing.footer.email")}`}>{t("landing.footer.contact")}</a>
          <a href="#cta">{t("landing.footer.earlyAccess")}</a>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3 text-[14.5px]" style={{ color: "var(--lp-muted)" }}>
          <span
            className="lp-mono mb-1 text-[11px] uppercase tracking-[0.08em]"
            style={{ color: "#6f685c" }}
          >
            {t("landing.footer.legal")}
          </span>
          <a href="#">{t("landing.footer.privacy")}</a>
          <a href="#">{t("landing.footer.terms")}</a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-6 pb-12 pt-6 sm:px-16"
        style={{
          borderTop: "1px solid var(--lp-line)",
          fontSize: 13,
          color: "#6f685c",
        }}
      >
        <span>
          {t("landing.footer.rights")} · {t("landing.footer.email")}
        </span>
        <div
          className="lp-mono flex items-center text-[13px]"
          style={{ color: "var(--lp-muted)" }}
        >
          <button
            onClick={() => setLang("en")}
            className="langbtn-en px-1.5 opacity-40 hover:opacity-100"
            style={{ background: "none", border: "none", font: "inherit", cursor: "pointer", color: "inherit" }}
          >
            EN
          </button>
          <span style={{ opacity: 0.3 }}>/</span>
          <button
            onClick={() => setLang("it")}
            className="langbtn-it px-1.5 opacity-40 hover:opacity-100"
            style={{ background: "none", border: "none", font: "inherit", cursor: "pointer", color: "inherit" }}
          >
            IT
          </button>
        </div>
      </div>
    </footer>
  );
}
