import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSign,
  RefreshCw,
  Loader2,
  AlertCircle,
  Inbox,
  PenSquare,
  Maximize2,
  Settings,
} from "lucide-react";
import { useImap } from "../../../lib/widgets/imap/useImap";
import { relativeTime } from "../../../lib/widgets/imap/imapService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import ImapFocus from "./ImapFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#6366f1";

export default function ImapWidget({ title = "Email (IMAP)", onRename }) {
  const { t, lang } = useI18n();
  const imap = useImap();
  const { connected, status, messages, unread } = imap;
  const [focus, setFocus] = useState({ open: false, setup: false, compose: false });

  const openFocus = (opts = {}) =>
    setFocus({ open: true, setup: opts.setup ?? false, compose: opts.compose ?? false });
  const closeFocus = () => setFocus((f) => ({ ...f, open: false }));

  const preview = messages.slice(0, 5);

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={AtSign}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={connected ? imap.config?.email || t("imap.inbox") : t("imap.notConfigured")}
        badge={
          connected && unread > 0 ? (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: ACCENT }}>
              {unread}
            </span>
          ) : null
        }
        actions={
          connected ? (
            <>
              <button onClick={() => openFocus({ compose: true })} aria-label={t("imap.composeEmail")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
                <PenSquare size={16} />
              </button>
              <button onClick={imap.refresh} disabled={status === "loading"} aria-label={t("common.refresh")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content disabled:opacity-50">
                <RefreshCw size={15} className={status === "loading" ? "animate-spin" : ""} />
              </button>
              <button onClick={() => openFocus()} aria-label={t("common.expand")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
                <Maximize2 size={15} />
              </button>
            </>
          ) : null
        }
      />

      <div className="min-h-[140px] flex-1">
        {!connected ? (
          <SetupPrompt onSetup={() => openFocus({ setup: true })} t={t} />
        ) : status === "loading" && messages.length === 0 ? (
          <CenteredState>
            <Loader2 size={20} className="animate-spin text-muted" />
            <span>{t("imap.loading")}</span>
          </CenteredState>
        ) : status === "error" ? (
          <CenteredState>
            <AlertCircle size={20} className="text-muted" />
            <span>{t("common.error")}</span>
            <button onClick={imap.refresh} className="mt-1 text-sm font-medium text-accent hover:underline">{t("common.retry")}</button>
          </CenteredState>
        ) : messages.length === 0 ? (
          <CenteredState>
            <Inbox size={20} className="text-muted" />
            <span>{t("imap.empty")}</span>
          </CenteredState>
        ) : (
          <ul className="-mx-2 space-y-0.5">
            <AnimatePresence initial={false}>
              {preview.map((m, i) => (
                <motion.li key={m.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                  <button onClick={() => openFocus()} className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2/60">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.unread ? "" : "opacity-0"}`} style={{ backgroundColor: ACCENT }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-sm ${m.unread ? "font-semibold" : "text-content/90"}`}>{m.from}</span>
                        <span className="shrink-0 text-xs text-muted">{relativeTime(m.date, lang)}</span>
                      </span>
                      <span className={`block truncate text-sm ${m.unread ? "text-content" : "text-muted"}`}>{m.subject}</span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ImapFocus open={focus.open} onClose={closeFocus} imap={imap} initialSetup={focus.setup} initialCompose={focus.compose} />
    </div>
  );
}

function SetupPrompt({ onSetup, t }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
        <AtSign size={22} />
      </span>
      <p className="whitespace-pre-line text-sm text-muted">{t("imap.setupPrompt")}</p>
      <button onClick={onSetup}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2">
        <Settings size={16} /> {t("imap.setupCta")}
      </button>
    </div>
  );
}

function CenteredState({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
      {children}
    </div>
  );
}
