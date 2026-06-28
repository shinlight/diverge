import { useState } from "react";
import { Plus, X, MailCheck, UserPlus, Check } from "lucide-react";
import {
  loadAllowlist,
  addAllowed,
  removeAllowed,
  loadWaitlist,
  addToWaitlist,
  removeFromWaitlist,
} from "../../lib/access/accessService";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { SectionShell } from "./AdminUI";

export default function Access() {
  const { t } = useI18n();
  const [allow, setAllow] = useState(() => loadAllowlist());
  const [wait, setWait] = useState(() => loadWaitlist());
  const [email, setEmail] = useState("");

  function add(e) {
    e.preventDefault();
    const v = email.trim();
    if (!v) return;
    setAllow(addAllowed(v));
    setEmail("");
  }

  function approve(w) {
    setAllow(addAllowed(w.email));
    setWait(removeFromWaitlist(w.email));
  }

  return (
    <SectionShell title={t("admin.access")} subtitle={t("admin.accessSub", { n: allow.length })}>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Allowlist */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <MailCheck size={16} className="text-accent" /> {t("admin.allowlist")}
          </p>
          <form onSubmit={add} className="mb-3 flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tester@email.com"
              className="flex-1 rounded-xl border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent" />
            <button type="submit" disabled={!email.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-contrast hover:brightness-110 disabled:opacity-50">
              <Plus size={15} /> {t("common.add")}
            </button>
          </form>
          <ul className="space-y-1">
            {allow.map((e) => (
              <li key={e} className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface-2/40">
                <span className="truncate text-sm">{e}</span>
                <button onClick={() => setAllow(removeAllowed(e))} aria-label={t("common.delete")}
                  className="shrink-0 text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Waitlist */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <UserPlus size={16} className="text-amber-500" /> {t("admin.waitlist")} <span className="text-muted">({wait.length})</span>
          </p>
          {wait.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t("admin.waitlistEmpty")}</p>
          ) : (
            <ul className="space-y-1">
              {wait.map((w) => (
                <li key={w.email} className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface-2/40">
                  <span className="truncate text-sm">{w.email}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button onClick={() => approve(w)} title={t("admin.approve")}
                      className="grid h-7 w-7 place-items-center rounded-lg text-green-500 hover:bg-surface-2">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setWait(removeFromWaitlist(w.email))} aria-label={t("common.delete")}
                      className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-red-400">
                      <X size={15} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-line bg-surface-2/30 px-4 py-3 text-xs text-muted">
        {t("admin.accessNote")}
      </p>
    </SectionShell>
  );
}
