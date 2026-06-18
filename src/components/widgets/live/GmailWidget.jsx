import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  RefreshCw,
  Loader2,
  AlertCircle,
  Inbox,
  PenSquare,
  Maximize2,
} from "lucide-react";
import { useGmail } from "../../../lib/widgets/gmail/useGmail";
import { relativeTime } from "../../../lib/widgets/gmail/gmailService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import GmailFocus from "./GmailFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#ea4335";

export default function GmailWidget({ title = "Gmail", onRename }) {
  const { t, lang } = useI18n();
  const gmail = useGmail();
  const { connected, connecting, status, messages, unread, connect } = gmail;
  const [focus, setFocus] = useState({
    open: false,
    selectedId: null,
    compose: false,
  });

  const openFocus = (opts = {}) =>
    setFocus({
      open: true,
      selectedId: opts.selectedId ?? null,
      compose: opts.compose ?? false,
    });
  const closeFocus = () => setFocus((f) => ({ ...f, open: false }));

  const preview = messages.slice(0, 5);

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={Mail}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={connected ? t("gmail.inbox") : t("common.notConnected")}
        badge={
          connected && unread > 0 ? (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              {unread}
            </span>
          ) : null
        }
        actions={
          connected ? (
            <>
              <button
                onClick={() => openFocus({ compose: true })}
                aria-label={t("gmail.composeEmail")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content"
              >
                <PenSquare size={16} />
              </button>
              <button
                onClick={gmail.refresh}
                disabled={status === "loading"}
                aria-label={t("common.refresh")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={status === "loading" ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => openFocus()}
                aria-label={t("common.expand")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content"
              >
                <Maximize2 size={15} />
              </button>
            </>
          ) : null
        }
      />

      {/* Body */}
      <div className="min-h-[140px] flex-1">
        {!connected ? (
          <ConnectPrompt onConnect={connect} connecting={connecting} />
        ) : status === "loading" && messages.length === 0 ? (
          <CenteredState>
            <Loader2 size={20} className="animate-spin text-muted" />
            <span>{t("gmail.loading")}</span>
          </CenteredState>
        ) : status === "error" ? (
          <CenteredState>
            <AlertCircle size={20} className="text-muted" />
            <span>{t("common.error")}</span>
            <button
              onClick={gmail.refresh}
              className="mt-1 text-sm font-medium text-accent hover:underline"
            >
              {t("common.retry")}
            </button>
          </CenteredState>
        ) : messages.length === 0 ? (
          <CenteredState>
            <Inbox size={20} className="text-muted" />
            <span>{t("gmail.empty")}</span>
          </CenteredState>
        ) : (
          <>
            <ul className="-mx-2 space-y-0.5">
              <AnimatePresence initial={false}>
                {preview.map((m, i) => (
                  <motion.li
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <button
                      onClick={() => openFocus({ selectedId: m.id })}
                      className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left
                        transition-colors hover:bg-surface-2/60"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          m.unread ? "" : "opacity-0"
                        }`}
                        style={{ backgroundColor: ACCENT }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={`truncate text-sm ${
                              m.unread ? "font-semibold" : "text-content/90"
                            }`}
                          >
                            {m.from}
                          </span>
                          <span className="shrink-0 text-xs text-muted">
                            {relativeTime(m.date, lang)}
                          </span>
                        </span>
                        <span
                          className={`block truncate text-sm ${
                            m.unread ? "text-content" : "text-muted"
                          }`}
                        >
                          {m.subject}
                        </span>
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {messages.length > preview.length && (
              <button
                onClick={() => openFocus()}
                className="mt-2 w-full rounded-lg py-1.5 text-center text-xs font-medium
                  text-muted hover:bg-surface-2/60 hover:text-content"
              >
                {t("gmail.seeAll", { n: messages.length })}
              </button>
            )}
          </>
        )}
      </div>

      <GmailFocus
        open={focus.open}
        onClose={closeFocus}
        gmail={gmail}
        initialSelectedId={focus.selectedId}
        initialCompose={focus.compose}
      />
    </div>
  );
}

function ConnectPrompt({ onConnect, connecting }) {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="whitespace-pre-line text-sm text-muted">
        {t("gmail.connectPrompt")}
      </p>
      <button
        onClick={onConnect}
        disabled={connecting}
        data-testid="gmail-connect"
        className="inline-flex items-center gap-2 rounded-xl border border-line
          bg-surface-2/50 px-4 py-2.5 text-sm font-medium transition-colors
          hover:bg-surface-2 disabled:opacity-60"
      >
        {connecting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GoogleGlyph />
        )}
        {connecting ? t("common.connecting") : t("gmail.connect")}
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

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
