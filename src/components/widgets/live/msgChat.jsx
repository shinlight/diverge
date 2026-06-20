import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, Check, Search, MessageSquare, Clock, Ban } from "lucide-react";
import Avatar from "../../ui/Avatar";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import { CHANNEL_LIST, CHANNELS, msgTime, peerName } from "../../../lib/widgets/messaging/messagingService";

const toAvatar = (peer) => ({ nickname: peerName(peer), avatarUrl: peer?.avatar_url });

/* --------------------------- Channel selector --------------------------- */

export function ChannelSelect({ channel, onSelect, align = "left" }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const c = CHANNELS[channel] ?? CHANNELS.internal;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line
          bg-surface-2/50 py-1 pl-2 pr-2.5 text-xs font-medium hover:bg-surface-2"
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
        {c.name}
        <ChevronDown size={13} className="text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className={`absolute top-full z-40 mt-1.5 w-56 overflow-hidden rounded-xl border
                border-line bg-surface shadow-xl shadow-black/30 ${align === "right" ? "right-0" : "left-0"}`}
            >
              {CHANNEL_LIST.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelect(ch.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-2"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ch.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{ch.name}</span>
                    <span className="block text-xs text-muted">
                      {ch.status === "live"
                        ? t("messaging.live")
                        : ch.status === "unavailable"
                          ? t("messaging.unavailableWeb")
                          : t("common.soon")}
                    </span>
                  </span>
                  {ch.id === channel && <Check size={15} className="text-accent" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------ Non-internal channel UI ----------------------- */

export function ChannelStatus({ channel }) {
  const { t } = useI18n();
  const c = CHANNELS[channel];
  const unavailable = c?.status === "unavailable";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ backgroundColor: `${c.color}1a`, color: c.color }}
      >
        {unavailable ? <Ban size={22} /> : <Clock size={22} />}
      </span>
      <p className="text-sm font-medium">{c?.name}</p>
      <p className="max-w-[220px] text-xs text-muted">
        {unavailable ? t("messaging.unavailableWebLong") : t("messaging.soonLong")}
      </p>
    </div>
  );
}

/* ---------------------------- Conversation row -------------------------- */

export function ConversationRow({ conv, peer, myId, active, onClick }) {
  const { lang } = useI18n();
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors
        ${active ? "bg-surface-2" : "hover:bg-surface-2/50"}`}
    >
      <Avatar user={toAvatar(peer)} size={36} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{peerName(peer)}</span>
          <span className="shrink-0 text-[11px] text-muted">{msgTime(conv.last.created_at, lang)}</span>
        </span>
        <span className="block truncate text-xs text-muted">
          {conv.last.sender_id === myId ? "↩ " : ""}
          {conv.last.content}
        </span>
      </span>
      {conv.unread > 0 && (
        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-contrast">
          {conv.unread}
        </span>
      )}
    </button>
  );
}

/* ------------------------------ New chat -------------------------------- */

export function NewChatSearch({ onSearch, onPick }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    let active = true;
    const id = setTimeout(async () => {
      const r = await onSearch(q);
      if (active) setResults(r);
    }, 200);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [q, onSearch]);

  return (
    <div>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("messaging.search")}
          className="w-full rounded-xl border border-line bg-surface-2/40 py-2.5 pl-9 pr-3 text-sm
            outline-none placeholder:text-muted focus:border-accent"
        />
      </div>
      <div className="mt-2 space-y-0.5">
        {results.map((u) => (
          <button
            key={u.id}
            onClick={() => onPick(u)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-surface-2"
          >
            <Avatar user={toAvatar(u)} size={32} />
            <span className="truncate text-sm">{peerName(u)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Message thread --------------------------- */

export function MessageThread({ messages, myId, peer, onSend, autoFocus }) {
  const { t, lang } = useI18n();
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
            <MessageSquare size={20} />
            <span>{t("messaging.startConversation", { name: peerName(peer) })}</span>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === myId;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm leading-relaxed ${
                    mine
                      ? "rounded-br-md bg-accent text-accent-contrast"
                      : "rounded-bl-md bg-surface-2 text-content"
                  }`}
                >
                  <span className="whitespace-pre-line break-words">{m.content}</span>
                  <span className={`ml-2 align-bottom text-[10px] ${mine ? "text-accent-contrast/70" : "text-muted"}`}>
                    {msgTime(m.created_at, lang)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="mt-2 flex items-center gap-2">
        <input
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messaging.messagePlaceholder")}
          className="h-[42px] flex-1 rounded-xl border border-line bg-surface-2/40 px-3.5 text-sm
            outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label={t("messaging.send")}
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-accent
            text-accent-contrast transition hover:brightness-110 disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
