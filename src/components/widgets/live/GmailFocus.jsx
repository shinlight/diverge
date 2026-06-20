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
  ReplyAll,
  MailOpen,
  ArrowLeft,
  Send,
  Inbox,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import {
  relativeTime,
  fullDate,
  parseAddressList,
} from "../../../lib/widgets/gmail/gmailService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#ea4335";

export default function GmailFocus({
  open,
  onClose,
  gmail,
  initialSelectedId,
  initialCompose,
}) {
  const { t } = useI18n();
  const {
    messages,
    unread,
    status,
    refresh,
    markRead,
    toggleStar,
    remove,
    send,
    loadBody,
    openAttachment,
    selfEmail,
  } = gmail;
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? null);
  const [mode, setMode] = useState("read"); // read | compose
  const [draft, setDraft] = useState(null);
  const [composeSeq, setComposeSeq] = useState(0);
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (!open) return;
    if (initialCompose) {
      startCompose();
    } else if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setMode("read");
      markRead(initialSelectedId, true);
      loadBody?.(initialSelectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSelectedId, initialCompose]);

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

  // Reply / quoting helpers.
  const reSubject = (s = "") => (/^re:/i.test(s.trim()) ? s : `Re: ${s}`);
  function quoted(msg) {
    const src = msg.body || msg.snippet || "";
    const q = src
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
    return `\n\n${t("gmail.inReplyTo")}\n${q}`;
  }
  function threadingOf(msg) {
    return {
      threadId: msg.threadId,
      inReplyTo: msg.messageId,
      references: msg.references
        ? `${msg.references} ${msg.messageId}`
        : msg.messageId,
    };
  }

  function startCompose() {
    setDraft(null);
    setMode("compose");
    setComposeSeq((n) => n + 1);
  }
  function startReply(msg) {
    setDraft({
      kind: "reply",
      to: msg.email,
      cc: "",
      subject: reSubject(msg.subject),
      body: quoted(msg),
      ...threadingOf(msg),
    });
    setMode("compose");
    setComposeSeq((n) => n + 1);
  }
  function startReplyAll(msg) {
    const self = (selfEmail || "").toLowerCase();
    const others = [...parseAddressList(msg.to), ...parseAddressList(msg.cc)].filter(
      (e) => e && e !== self && e !== msg.email.toLowerCase()
    );
    setDraft({
      kind: "replyAll",
      to: msg.email,
      cc: [...new Set(others)].join(", "),
      subject: reSubject(msg.subject),
      body: quoted(msg),
      ...threadingOf(msg),
    });
    setMode("compose");
    setComposeSeq((n) => n + 1);
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
                <button
                  onClick={startCompose}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2
                    text-sm font-medium text-accent-contrast hover:brightness-110"
                >
                  <PenSquare size={16} /> {t("gmail.compose")}
                </button>
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
                    key={composeSeq}
                    draft={draft}
                    onCancel={() => setMode("read")}
                    onSend={send}
                  />
                ) : selected ? (
                  <ReaderPane
                    message={selected}
                    onBack={() => setSelectedId(null)}
                    onReply={() => startReply(selected)}
                    onReplyAll={() => startReplyAll(selected)}
                    onToggleStar={() => toggleStar(selected.id)}
                    onMarkUnread={() => {
                      markRead(selected.id, false);
                      setSelectedId(null);
                    }}
                    onDelete={() => handleDelete(selected.id)}
                    onOpenAttachment={(att) => openAttachment?.(selected.id, att)}
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

function ListRow({ message, active, onOpen, onStar, onDelete }) {
  const { t, lang } = useI18n();
  return (
    <li
      onClick={onOpen}
      className={`group flex cursor-pointer items-start gap-2.5 border-b border-line/60 px-4 py-3
        transition-colors ${active ? "bg-surface-2/70" : "hover:bg-surface-2/40"}`}
    >
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
    </li>
  );
}

function ReaderPane({
  message,
  onBack,
  onReply,
  onReplyAll,
  onToggleStar,
  onMarkUnread,
  onDelete,
  onOpenAttachment,
}) {
  const { t, lang } = useI18n();
  const attachments = message.attachments || [];
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
        <button
          onClick={onReply}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
        >
          <Reply size={16} /> {t("gmail.reply")}
        </button>
        <button
          onClick={onReplyAll}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
        >
          <ReplyAll size={16} /> {t("gmail.replyAll")}
        </button>
        <button
          onClick={onMarkUnread}
          aria-label={t("gmail.markUnread")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content"
        >
          <MailOpen size={16} />
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
        <div className="ml-auto flex items-center gap-1">
          {message.link && (
            <a
              href={message.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("gmail.openInGmail")}
              title={t("gmail.openInGmail")}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={onDelete}
            aria-label={t("common.delete")}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content"
          >
            <Trash2 size={16} />
          </button>
        </div>
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

        {attachments.length > 0 && (
          <div className="mt-6 border-t border-line pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
              <Paperclip size={13} /> {t("gmail.attachments")} ({attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onOpenAttachment(a)}
                  className="flex max-w-[220px] items-center gap-2 rounded-xl border border-line
                    bg-surface-2/40 px-3 py-2 text-left hover:bg-surface-2"
                >
                  <Paperclip size={14} className="shrink-0 text-muted" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{a.filename}</span>
                    {a.size > 0 && (
                      <span className="block text-xs text-muted">{formatBytes(a.size)}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComposePane({ draft, onCancel, onSend }) {
  const { t } = useI18n();
  const [to, setTo] = useState(draft?.to ?? "");
  const [cc, setCc] = useState(draft?.cc ?? "");
  const [showCc, setShowCc] = useState(Boolean(draft?.cc));
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  const [attachments, setAttachments] = useState([]); // {filename,mimeType,contentBase64,size}
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const title =
    draft?.kind === "replyAll"
      ? t("gmail.replyAll")
      : draft?.kind === "reply"
        ? t("gmail.reply")
        : t("gmail.newEmail");

  async function onFiles(e) {
    const files = [...e.target.files];
    e.target.value = ""; // allow re-selecting the same file
    const read = await Promise.all(files.map(readFileAsBase64));
    setAttachments((list) => [...list, ...read.filter(Boolean)]);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!to.trim()) return;
    setSending(true);
    setError(false);
    const res = await onSend({
      to,
      cc: showCc ? cc : "",
      subject,
      body,
      attachments,
      threadId: draft?.threadId,
      inReplyTo: draft?.inReplyTo,
      references: draft?.references,
    });
    setSending(false);
    if (res?.ok === false) {
      setError(true);
      return;
    }
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
      <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {!showCc && (
          <button
            type="button"
            onClick={() => setShowCc(true)}
            className="text-xs font-medium text-muted hover:text-content"
          >
            {t("gmail.cc")}
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <Field label={t("gmail.to")}>
          <input
            type="text"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={t("gmail.recipient")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </Field>
        {showCc && (
          <Field label={t("gmail.cc")}>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder={t("gmail.recipient")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </Field>
        )}
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
          rows={9}
          className="w-full resize-none rounded-xl border border-line bg-surface-2/40 px-4 py-3
            text-sm leading-relaxed outline-none placeholder:text-muted focus:border-accent"
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <span
                key={i}
                className="flex max-w-[220px] items-center gap-1.5 rounded-lg border border-line
                  bg-surface-2/40 px-2.5 py-1.5 text-xs"
              >
                <Paperclip size={12} className="shrink-0 text-muted" />
                <span className="min-w-0 truncate">{a.filename}</span>
                <span className="shrink-0 text-muted">{formatBytes(a.size)}</span>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((list) => list.filter((_, j) => j !== i))
                  }
                  aria-label={t("common.delete")}
                  className="shrink-0 text-muted hover:text-content"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{t("gmail.sendError")}</p>
        )}
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
        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5
            text-sm text-muted hover:bg-surface-2 hover:text-content"
        >
          <Paperclip size={16} /> {t("gmail.attach")}
          <input type="file" multiple onChange={onFiles} className="hidden" />
        </label>
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
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

function readFileAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result);
      const comma = res.indexOf(",");
      resolve({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64: comma >= 0 ? res.slice(comma + 1) : res,
        size: file.size,
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function formatBytes(n) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
