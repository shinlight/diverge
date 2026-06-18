import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, Check, Sparkles } from "lucide-react";
import { MODELS, modelById } from "../../../lib/widgets/ai/aiService";

/* ----------------------- Model selector (the "link") ---------------------- */

export function ModelSelect({ model, onSelect, align = "left" }) {
  const [open, setOpen] = useState(false);
  const m = modelById(model);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line
          bg-surface-2/50 py-1 pl-2 pr-2.5 text-xs font-medium hover:bg-surface-2"
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
        {m.name}
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
              className={`absolute top-full z-40 mt-1.5 w-60 overflow-hidden rounded-xl
                border border-line bg-surface shadow-xl shadow-black/30 ${
                  align === "right" ? "right-0" : "left-0"
                }`}
            >
              {MODELS.map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    onSelect(x.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left
                    hover:bg-surface-2"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: x.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{x.name}</span>
                    <span className="block text-xs text-muted">{x.provider}</span>
                  </span>
                  {x.id === model && <Check size={15} className="text-accent" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- Chat thread ------------------------------ */

export function ChatThread({ messages, sending, onSend, model, autoFocus }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const m = modelById(model);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  function submit(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <span
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ backgroundColor: `${m.color}1a`, color: m.color }}
            >
              <Sparkles size={20} />
            </span>
            <p className="text-sm text-muted">
              Inizia a chattare con <span className="text-content">{m.name}</span>.
            </p>
          </div>
        ) : (
          messages.map((msg) => <Bubble key={msg.id} msg={msg} color={m.color} />)
        )}
        {sending && <Typing color={m.color} />}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="mt-2.5 flex items-end gap-2">
        <textarea
          rows={1}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
          placeholder={`Scrivi a ${m.name}…`}
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-line
            bg-surface-2/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-muted
            focus:border-accent"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Invia"
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl
            bg-accent text-accent-contrast transition hover:brightness-110
            disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}

function Bubble({ msg, color }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-accent text-accent-contrast"
            : "rounded-bl-md bg-surface-2 text-content"
        }`}
        style={!isUser ? { borderLeft: `2px solid ${color}` } : undefined}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

function Typing({ color }) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
