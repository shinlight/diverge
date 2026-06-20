import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  PenSquare,
  RefreshCw,
  X,
  Star,
  Trash2,
  Reply,
  MailOpen,
  ArrowLeft,
  Send,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { relativeTime, fullDate } from "../../../lib/widgets/gmail/gmailService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#ea4335";

export default function GmailFocus({
  open,
  onClose,
  gmail,
  initialSelectedId,
  initialCompose,
  readOnly = false,
}) {
  const { t } = useI18n();
  const { messages, unread, status, refresh, markRead, toggleStar, remove, send, loadBody } =
    gmail;
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? null);
  const [mode, setMode] = useState("read"); // read | compose
  const [replyTo, setReplyTo] = useState(null);
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (!open) return;
    if (initialCompose && !readOnly) {
      setMode("compose");
      setReplyTo(null);
    } else if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setMode("read");
      markRead(initialSelectedId, true);
      loadBody?.(initialSelectedId);
    }
  }, [open, initialSelectedId, initialCompose, readOnly, markRead, loadBody]);

  function openMessage(id) {
    setSelectedId(id);
    setMode("read");
    markRead(id, true);
    loadBody?.(id);
  }

  async function handleDelete(id) {
    await remove(id);
    if (selectedId === id) setSelectedId(null);
  }

  function startReply(msg) {
    setMode("compose");
    setReplyTo(msg);
  }

  function startCompose() {
    setReplyTo(null);
    setMode("compose");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
              >
                <Mail size={18} />
              </span>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                Gmail
                {unread > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {unread}
                  </span>
                )}
              </h2>

              <div className="ml-auto flex items-center gap-1.5">
                {!readOnly && (
                  <button
                    onClick={startCompose}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2
                      text-sm font-medium text-accent-contrast hover:brightness-110"
                  >
                    <PenSquare size={16} /> {t("gmail.compose")}
                  </button>
                )}
                <button
                  onClick={refresh}
                  disabled={status === "loading"}
                  aria-label={t("common.refresh")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted
                    hover:bg-surface-2 hover:text-content disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={status === "loading" ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted
                    hover:bg-surface-2 hover:text-content"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body: list + pane */}
            <div className="flex min-h-0 flex-1">
              {/* List */}
              <div
                className={`w-full shrink-0 overflow-y-auto border-r border-line sm:w-[320px]
                  ${selected || mode === "compose" ? "hidden sm:block" : "block"}`}
              >
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                    <Inbox size={20} />
                    {t("gmail.emptyInbox")}
                  </div>
                ) : (
                  <ul>
                    {messages.map((m) => (
                      <ListRow
                        key={m.id}
                        message={m}
                        active={m.id === selectedId && mode === "read"}
                        readOnly={readOnly}
                        onOpen={() => openMessage(m.id)}
                        onStar={() => toggleStar(m.id)}
                        onDelete={() => handleDelete(m.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>

              {/* Pane */}
              <div
                className={`min-h-0 flex-1 overflow-y-auto
                  ${selected || mode === "compose" ? "block" : "hidden sm:block"}`}
              >
                {mode === "compose" ? (
                  <ComposePane
                    replyTo={replyTo}
                    onCancel={() => setMode("read")}
                    onSend={send}
                  />
                ) : selected ? (
                  <ReaderPane
                    message={selected}
                    readOnly={readOnly}
                    onBack={() => setSelectedId(null)}
                    onReply={() => startReply(selected)}
                    onToggleStar={() => toggleStar(selected.id)}
                    onMarkUnread={() => {
                      markRead(selected.id, false);
                      setSelectedId(null);
                    }}
                    onDelete={() => handleDelete(selected.id)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                    <MailOpen size={22} />
                    {t("gmail.selectEmail")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ListRow({ message, active, readOnly, onOpen, onStar, onDelete }) {
  const { t, lang } = useI18n();
  return (
    <li
      onClick={onOpen}
      className={`group flex cursor-pointer items-start gap-2.5 border-b border-line/60 px-4 py-3
        transition-colors ${active ? "bg-surface-2/70" : "hover:bg-surface-2/40"}`}
    >
      {readOnly ? (
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${message.unread ? "" : "opacity-0"}`}
          style={{ backgroundColor: ACCENT }}
          aria-hidden="true"
        />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar();
          }}
          aria-label={t("gmail.important")}
          className="mt-0.5 shrink-0 text-muted hover:text-content"
        >
          <Star
            size={15}
            fill={message.starred ? "#f5b400" : "none"}
            color={message.starred ? "#f5b400" : "currentColor"}
          />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`truncate text-sm ${
              message.unread ? "font-semibold" : "text-content/90"
            }`}
          >
            {message.from}
          </span>
          <span className="shrink-0 text-xs text-muted">
            {relativeTime(message.date, lang)}
          </span>
        </div>
        <p
          className={`truncate text-sm ${
            message.unread ? "text-content" : "text-muted"
          }`}
        >
          {message.subject}
        </p>
        <p className="truncate text-xs text-muted">{message.snippet}</p>
      </div>
      {!readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={t("common.delete")}
          className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity
            hover:text-content group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      )}
    </li>
  );
}

function ReaderPane({ message, readOnly, onBack, onReply, onToggleStar, onMarkUnread, onDelete }) {
  const { t, lang } = useI18n();
  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-line px-4 py-2.5">
        <button
          onClick={onBack}
          aria-label={t("common.back")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content sm:hidden"
        >
          <ArrowLeft size={16} />
        </button>
        {!readOnly && (
          <>
            <button
              onClick={onReply}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
            >
              <Reply size={16} /> {t("gmail.reply")}
            </button>
            <button
              onClick={onMarkUnread}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
            >
              <MailOpen size={16} /> {t("gmail.markUnread")}
            </button>
            <button
              onClick={onToggleStar}
              aria-label={t("gmail.important")}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content"
            >
              <Star
                size={16}
                fill={message.starred ? "#f5b400" : "none"}
                color={message.starred ? "#f5b400" : "currentColor"}
              />
            </button>
            <button
              onClick={onDelete}
              aria-label={t("common.delete")}
              className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        {readOnly && message.link && (
          <a
            href={message.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
          >
            <ExternalLink size={16} /> {t("gmail.openInGmail")}
          </a>
        )}
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h1 className="text-xl font-semibold">{message.subject}</h1>
        <div className="mt-3 flex items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {message.from[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{message.from}</p>
            <p className="truncate text-xs text-muted">{message.email}</p>
          </div>
          <span className="ml-auto shrink-0 text-xs text-muted">
            {fullDate(message.date, lang)}
          </span>
        </div>
        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-content/90">
          {message.body || message.snippet}
        </p>
      </div>
    </div>
  );
}

function ComposePane({ replyTo, onCancel, onSend }) {
  const { t } = useI18n();
  const [to, setTo] = useState(replyTo?.email ?? "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body, setBody] = useState(
    replyTo ? `\n\n${t("gmail.inReplyTo")}\n${replyTo.snippet}` : ""
  );
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
        <span
          className="grid h-12 w-12 place-items-center rounded-full text-white"
          style={{ backgroundColor: ACCENT }}
        >
          <Send size={20} />
        </span>
        <p className="text-sm font-medium">{t("gmail.sent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-line px-5 py-3">
        <h3 className="text-sm font-semibold">
          {replyTo ? t("gmail.reply") : t("gmail.newEmail")}
        </h3>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <Field label={t("gmail.to")}>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={t("gmail.recipient")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </Field>
        <Field label={t("gmail.subject")}>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("gmail.subject")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </Field>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("gmail.messagePlaceholder")}
          rows={10}
          className="w-full resize-none rounded-xl border border-line bg-surface-2/40 px-4 py-3
            text-sm leading-relaxed outline-none placeholder:text-muted focus:border-accent"
        />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
        <button
          type="submit"
          disabled={sending || !to.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5
            text-sm font-medium text-accent-contrast hover:brightness-110 disabled:opacity-50"
        >
          {sending ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {t("gmail.send")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center gap-3 border-b border-line/60 pb-2">
      <span className="w-16 shrink-0 text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
