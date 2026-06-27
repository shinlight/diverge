import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSign,
  X,
  RefreshCw,
  PenSquare,
  Settings,
  Star,
  Trash2,
  Reply,
  MailOpen,
  ArrowLeft,
  Send,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { relativeTime, fullDate, DEFAULT_CONFIG } from "../../../lib/widgets/imap/imapService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#6366f1";

export default function ImapFocus({ open, onClose, imap, initialSetup, initialCompose }) {
  const { t } = useI18n();
  const { connected, config, status, refresh, saveConfig, disconnect, markRead, toggleStar, remove, send } = imap;
  const [view, setView] = useState("read"); // read | compose | setup
  const [selectedId, setSelectedId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const selected = imap.messages.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (!open) return;
    if (initialSetup || !connected) setView("setup");
    else if (initialCompose) { setView("compose"); setReplyTo(null); }
    else setView("read");
  }, [open, initialSetup, initialCompose, connected]);

  function openMessage(id) {
    setSelectedId(id);
    setView("read");
    markRead(id, true);
  }
  async function handleDelete(id) {
    await remove(id);
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <AtSign size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{t("widgets.imap.name")}</h2>
                {connected && config?.email && (
                  <p className="truncate text-xs text-muted">{config.email}</p>
                )}
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                {connected && view !== "setup" && (
                  <>
                    <button onClick={() => { setView("compose"); setReplyTo(null); }}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast hover:brightness-110">
                      <PenSquare size={16} /> {t("imap.compose")}
                    </button>
                    <button onClick={refresh} disabled={status === "loading"} aria-label={t("common.refresh")}
                      className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content disabled:opacity-50">
                      <RefreshCw size={16} className={status === "loading" ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setView("setup")} aria-label={t("imap.settings")} title={t("imap.settings")}
                      className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                      <Settings size={16} />
                    </button>
                  </>
                )}
                <button onClick={onClose} aria-label={t("common.close")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                  <X size={18} />
                </button>
              </div>
            </div>

            {view === "setup" ? (
              <SetupForm config={config} onSave={async (cfg) => { await saveConfig(cfg); setView("read"); }}
                onCancel={() => connected && setView("read")} onDisconnect={connected ? () => { disconnect(); } : null}
                canCancel={connected} t={t} />
            ) : (
              <div className="flex min-h-0 flex-1">
                <div className={`w-full shrink-0 overflow-y-auto border-r border-line sm:w-[320px]
                  ${selected || view === "compose" ? "hidden sm:block" : "block"}`}>
                  {imap.messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                      <Inbox size={20} /> {t("imap.emptyInbox")}
                    </div>
                  ) : (
                    <ul>
                      {imap.messages.map((m) => (
                        <ListRow key={m.id} message={m} active={m.id === selectedId && view === "read"}
                          onOpen={() => openMessage(m.id)} onStar={() => toggleStar(m.id)} onDelete={() => handleDelete(m.id)} t={t} />
                      ))}
                    </ul>
                  )}
                </div>
                <div className={`min-h-0 flex-1 overflow-y-auto ${selected || view === "compose" ? "block" : "hidden sm:block"}`}>
                  {view === "compose" ? (
                    <ComposePane replyTo={replyTo} onCancel={() => setView("read")} onSend={send} t={t} />
                  ) : selected ? (
                    <ReaderPane message={selected} onBack={() => setSelectedId(null)}
                      onReply={() => { setReplyTo(selected); setView("compose"); }}
                      onToggleStar={() => toggleStar(selected.id)}
                      onMarkUnread={() => { markRead(selected.id, false); setSelectedId(null); }}
                      onDelete={() => handleDelete(selected.id)} t={t} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                      <MailOpen size={22} /> {t("imap.selectEmail")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SetupForm({ config, onSave, onCancel, onDisconnect, canCancel, t }) {
  const [cfg, setCfg] = useState(() => ({ ...DEFAULT_CONFIG, ...(config ?? {}) }));
  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const valid = cfg.email.trim() && cfg.password.trim() && cfg.imapHost.trim();

  function submit(e) {
    e.preventDefault();
    if (!valid) return;
    onSave({ ...cfg, imapPort: Number(cfg.imapPort) || 993, smtpPort: Number(cfg.smtpPort) || 465 });
  }

  return (
    <form onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-xs text-muted">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
          <span>{t("imap.securityNote")}</span>
        </div>

        <Field label={t("imap.name")}>
          <input value={cfg.name} onChange={(e) => set("name", e.target.value)} placeholder={t("imap.namePlaceholder")} className={INPUT} />
        </Field>
        <Field label={t("imap.email")} required>
          <input type="email" value={cfg.email} onChange={(e) => set("email", e.target.value)} placeholder="tuonome@dominio.it" className={INPUT} />
        </Field>
        <Field label={t("imap.password")} required>
          <input type="password" value={cfg.password} onChange={(e) => set("password", e.target.value)} placeholder={t("imap.passwordPlaceholder")} className={INPUT} />
        </Field>

        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("imap.incoming")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><Field label={t("imap.imapHost")} required>
            <input value={cfg.imapHost} onChange={(e) => set("imapHost", e.target.value)} placeholder="imap.dominio.it" className={INPUT} />
          </Field></div>
          <Field label={t("imap.port")}>
            <input type="number" value={cfg.imapPort} onChange={(e) => set("imapPort", e.target.value)} className={INPUT} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={cfg.imapSecure} onChange={(e) => set("imapSecure", e.target.checked)} />
          {t("imap.useSSL")}
        </label>

        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("imap.outgoing")}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><Field label={t("imap.smtpHost")}>
            <input value={cfg.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.dominio.it" className={INPUT} />
          </Field></div>
          <Field label={t("imap.port")}>
            <input type="number" value={cfg.smtpPort} onChange={(e) => set("smtpPort", e.target.value)} className={INPUT} />
          </Field>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" disabled={!valid}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast hover:brightness-110 disabled:opacity-50">
            {t("imap.connect")}
          </button>
          {canCancel && (
            <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-content">
              {t("common.cancel")}
            </button>
          )}
          {onDisconnect && (
            <button type="button" onClick={onDisconnect} className="ml-auto rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
              {t("imap.disconnect")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

const INPUT =
  "w-full rounded-xl border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">
        {label} {required && <span style={{ color: ACCENT }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function ListRow({ message, active, onOpen, onStar, onDelete, t }) {
  const { lang } = useI18n();
  return (
    <li onClick={onOpen}
      className={`group flex cursor-pointer items-start gap-2.5 border-b border-line/60 px-4 py-3 transition-colors ${active ? "bg-surface-2/70" : "hover:bg-surface-2/40"}`}>
      <button onClick={(e) => { e.stopPropagation(); onStar(); }} aria-label={t("imap.important")} className="mt-0.5 shrink-0 text-muted hover:text-content">
        <Star size={15} fill={message.starred ? "#f5b400" : "none"} color={message.starred ? "#f5b400" : "currentColor"} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-sm ${message.unread ? "font-semibold" : "text-content/90"}`}>{message.from}</span>
          <span className="shrink-0 text-xs text-muted">{relativeTime(message.date, lang)}</span>
        </div>
        <p className={`truncate text-sm ${message.unread ? "text-content" : "text-muted"}`}>{message.subject}</p>
        <p className="truncate text-xs text-muted">{message.snippet}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label={t("common.delete")}
        className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100">
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function ReaderPane({ message, onBack, onReply, onToggleStar, onMarkUnread, onDelete, t }) {
  const { lang } = useI18n();
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-line px-4 py-2.5">
        <button onClick={onBack} aria-label={t("common.back")} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content sm:hidden">
          <ArrowLeft size={16} />
        </button>
        <button onClick={onReply} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content">
          <Reply size={16} /> {t("imap.reply")}
        </button>
        <button onClick={onMarkUnread} aria-label={t("imap.markUnread")} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content">
          <MailOpen size={16} />
        </button>
        <button onClick={onToggleStar} aria-label={t("imap.important")} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content">
          <Star size={16} fill={message.starred ? "#f5b400" : "none"} color={message.starred ? "#f5b400" : "currentColor"} />
        </button>
        <button onClick={onDelete} aria-label={t("common.delete")} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h1 className="text-xl font-semibold">{message.subject}</h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: ACCENT }}>
            {message.from[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{message.from}</p>
            <p className="truncate text-xs text-muted">{message.email}</p>
          </div>
          <span className="ml-auto shrink-0 text-xs text-muted">{fullDate(message.date, lang)}</span>
        </div>
        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-content/90">{message.body}</p>
      </div>
    </div>
  );
}

function ComposePane({ replyTo, onCancel, onSend, t }) {
  const [to, setTo] = useState(replyTo?.email ?? "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body, setBody] = useState(replyTo ? `\n\n${t("imap.inReplyTo")}\n${replyTo.snippet}` : "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!to.trim()) return;
    setSending(true);
    await onSend({ to, subject, body });
    setSending(false);
    setSent(true);
    setTimeout(onCancel, 1100);
  }

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundColor: ACCENT }}>
          <Send size={20} />
        </span>
        <p className="text-sm font-medium">{t("imap.sent")}</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSend} className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-line px-5 py-3">
        <h3 className="text-sm font-semibold">{replyTo ? t("imap.reply") : t("imap.newEmail")}</h3>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <ComposeField label={t("imap.to")}>
          <input type="text" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="destinatario@email.it"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
        </ComposeField>
        <ComposeField label={t("imap.subject")}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("imap.subject")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
        </ComposeField>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("imap.messagePlaceholder")} rows={10}
          className="w-full resize-none rounded-xl border border-line bg-surface-2/40 px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted focus:border-accent" />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
        <button type="submit" disabled={sending || !to.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast hover:brightness-110 disabled:opacity-50">
          {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />} {t("imap.send")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-content">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function ComposeField({ label, children }) {
  return (
    <label className="flex items-center gap-3 border-b border-line/60 pb-2">
      <span className="w-16 shrink-0 text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
