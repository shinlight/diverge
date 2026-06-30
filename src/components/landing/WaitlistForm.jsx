// src/components/landing/WaitlistForm.jsx
import { useState } from "react";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { addToWaitlist, isAllowed, loadWaitlist } from "../../lib/access/accessService";
import { isValidEmail } from "./isValidEmail";

// status: "idle" | "success" | "already" | "invalid" | "error"
export default function WaitlistForm({ dark = true }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  function submit(e) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!isValidEmail(value)) return setStatus("invalid");
    try {
      if (isAllowed(value) || loadWaitlist().some((w) => w.email === value)) {
        return setStatus("already");
      }
      addToWaitlist(value);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "already") {
    return (
      <p className="lp-mono text-sm" style={{ color: dark ? "var(--lp-content)" : "var(--lp-accent-ink)" }}>
        {t(`landing.waitlist.${status}`)}
      </p>
    );
  }

  const showError = status === "invalid" || status === "error";
  return (
    <div className="w-full max-w-md">
      <form onSubmit={submit} className="flex w-full flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
          placeholder={t("landing.waitlist.placeholder")}
          aria-label={t("landing.waitlist.placeholder")}
          className="lp-mono flex-1 rounded-full px-5 py-3 text-sm outline-none"
          style={{ background: "var(--lp-panel)", color: "var(--lp-content)", border: "1px solid var(--lp-line)" }}
        />
        <button
          type="submit"
          className="lp-mono rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.1em]"
          style={{ background: "var(--lp-accent)", color: "var(--lp-accent-ink)" }}
        >
          {t("landing.waitlist.cta")}
        </button>
      </form>
      {showError ? (
        <p className="lp-mono mt-2 text-xs" style={{ color: "#e0a0a0" }}>
          {t(`landing.waitlist.${status}`)}
        </p>
      ) : null}
    </div>
  );
}
