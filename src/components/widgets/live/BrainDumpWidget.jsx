import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Maximize2, Plus, ListPlus, Trash2, Sparkles } from "lucide-react";
import { useBrainDump } from "../../../lib/widgets/braindump/useBrainDump";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import BrainDumpFocus from "./BrainDumpFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#a855f7";

export default function BrainDumpWidget({ title = "Brain Dump", onRename }) {
  const { t } = useI18n();
  const dump = useBrainDump();
  const { items, add, remove, toTask } = dump;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (text.trim()) {
      add(text);
      setText("");
    }
  }

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={BrainCircuit}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={items.length ? t("braindump.toTriage", { n: items.length }) : t("braindump.quickCapture")}
        actions={
          <button onClick={() => setOpen(true)} aria-label={t("common.expand")}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
            <Maximize2 size={15} />
          </button>
        }
      />

      {/* Capture — the hero */}
      <form onSubmit={submit}
        className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2.5 focus-within:border-accent"
        style={{ borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}0f` }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("braindump.placeholder")}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
        <button type="submit" aria-label={t("common.add")}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-accent-contrast"
          style={{ backgroundColor: ACCENT }}>
          <Plus size={16} />
        </button>
      </form>

      <div className="min-h-[80px] flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
            <Sparkles size={20} /> {t("braindump.empty")}
          </div>
        ) : (
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {items.slice(0, 6).map((it) => (
                <motion.li key={it.id} layout
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2/60">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                  <span className="min-w-0 flex-1 truncate text-sm">{it.text}</span>
                  <button onClick={() => toTask(it.id)} aria-label={t("braindump.toTask")} title={t("braindump.toTask")}
                    className="shrink-0 text-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100">
                    <ListPlus size={15} />
                  </button>
                  <button onClick={() => remove(it.id)} aria-label={t("common.delete")}
                    className="shrink-0 text-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <BrainDumpFocus open={open} onClose={() => setOpen(false)} dump={dump} />
    </div>
  );
}
