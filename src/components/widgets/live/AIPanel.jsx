import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Plus, Trash2, MessageSquare } from "lucide-react";
import { ChatThread, ModelSelect } from "./aiChat";

export default function AIPanel({ open, onClose, ai, title }) {
  const messages = ai.current?.messages ?? [];

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
            className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: "#7c5cff1a", color: "#7c5cff" }}
              >
                <Sparkles size={18} />
              </span>
              <h2 className="truncate text-base font-semibold">{title}</h2>
              <div className="ml-auto flex items-center gap-2">
                <ModelSelect model={ai.model} onSelect={ai.setModel} align="right" />
                <button
                  onClick={onClose}
                  aria-label="Chiudi"
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted
                    hover:bg-surface-2 hover:text-content"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body: chat history + thread */}
            <div className="flex min-h-0 flex-1">
              {/* History */}
              <div className="flex w-64 shrink-0 flex-col border-r border-line">
                <div className="p-3">
                  <button
                    onClick={ai.newChat}
                    className="flex w-full items-center justify-center gap-2 rounded-xl
                      bg-accent px-3 py-2.5 text-sm font-medium text-accent-contrast
                      hover:brightness-110"
                  >
                    <Plus size={16} /> Nuova chat
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  {ai.conversations.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted">
                      Nessuna chat. Inizia a scrivere!
                    </p>
                  ) : (
                    ai.conversations.map((c) => (
                      <HistoryRow
                        key={c.id}
                        conv={c}
                        active={c.id === ai.currentId}
                        onOpen={() => ai.selectChat(c.id)}
                        onDelete={() => ai.deleteChat(c.id)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Thread */}
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <ChatThread
                  key={ai.currentId ?? "empty"}
                  messages={messages}
                  sending={ai.sending}
                  onSend={ai.send}
                  model={ai.model}
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HistoryRow({ conv, active, onOpen, onDelete }) {
  return (
    <div
      onClick={onOpen}
      className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2
        transition-colors ${active ? "bg-surface-2" : "hover:bg-surface-2/50"}`}
    >
      <MessageSquare size={14} className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1 truncate text-sm">{conv.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Elimina chat"
        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
