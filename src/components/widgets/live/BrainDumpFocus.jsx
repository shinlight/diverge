import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, X, Plus, ListPlus, Trash2, Sparkles } from "lucide-react";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#a855f7";

export default function BrainDumpFocus({ open, onClose, dump }) {
  const { t, lang } = useI18n();
  const { items, add, remove, clear, toTask } = dump;
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (text.trim()) {
      add(text);
      setText("");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[80vh] sm:rounded-3xl"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <BrainCircuit size={18} />
              </span>
              <h2 className="text-base font-semibold">{t("widgets.braindump.name")}</h2>
              {items.length > 0 && (
                <button onClick={clear}
                  className="ml-auto rounded-lg px-2.5 py-1 text-xs text-muted hover:bg-surface-2 hover:text-content">
                  {t("braindump.clear")}
                </button>
              )}
              <button onClick={onClose} aria-label={t("common.close")}
                className={`${items.length > 0 ? "" : "ml-auto"} grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content`}>
                <X size={18} />
              </button>
            </div>

            <div className="shrink-0 border-b border-line p-4">
              <form onSubmit={submit} className="flex items-end gap-2">
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }}
                  rows={2} autoFocus placeholder={t("braindump.placeholder")}
                  className="min-h-0 flex-1 resize-none rounded-xl border border-line bg-surface-2/40 px-3 py-2
                    text-sm outline-none placeholder:text-muted focus:border-accent" />
                <button type="submit"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-contrast hover:brightness-110">
                  <Plus size={18} />
                </button>
              </form>
              <p className="mt-1.5 text-[11px] text-muted">{t("braindump.hint")}</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted">
                  <Sparkles size={22} /> {t("braindump.empty")}
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it.id}
                      className="group flex items-start gap-3 rounded-xl border border-line px-3 py-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                      <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm">{it.text}</p>
                      <div className="flex shrink-0 items-center gap-1">
                        <button onClick={() => toTask(it.id)} title={t("braindump.toTask")} aria-label={t("braindump.toTask")}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content">
                          <ListPlus size={16} />
                        </button>
                        <button onClick={() => remove(it.id)} title={t("common.delete")} aria-label={t("common.delete")}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
