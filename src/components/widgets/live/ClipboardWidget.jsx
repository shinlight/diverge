import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ClipboardPaste, Plus, Copy, Check, Trash2, Eraser } from "lucide-react";
import { useClipboard } from "../../../lib/widgets/clipboard/useClipboard";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#14b8a6";

export default function ClipboardWidget({ title, onRename }) {
  const { t } = useI18n();
  const { items, max, add, grab, copyTo, remove, clear } = useClipboard();
  const [text, setText] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [hint, setHint] = useState("");

  function submit(e) {
    e.preventDefault();
    if (add(text)) setText("");
  }

  async function handleGrab() {
    const res = await grab();
    if (res === "error") {
      setHint(t("clipboard.grabError"));
      setTimeout(() => setHint(""), 2600);
    }
  }

  async function handleCopy(item) {
    const ok = await copyTo(item.text);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1200);
    }
  }

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={ClipboardList}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={t("clipboard.count", { n: items.length, max })}
        actions={
          items.length > 0 ? (
            <button
              onClick={() => {
                if (window.confirm(t("clipboard.clearConfirm"))) clear();
              }}
              aria-label={t("clipboard.clear")}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted
                transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Eraser size={15} />
            </button>
          ) : null
        }
      />

      <form onSubmit={submit} className="mb-1 flex items-center gap-2">
        <button
          type="button"
          onClick={handleGrab}
          aria-label={t("clipboard.grab")}
          title={t("clipboard.grab")}
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl
            border border-line bg-surface-2/40 text-muted hover:bg-surface-2 hover:text-content"
        >
          <ClipboardPaste size={16} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("clipboard.placeholder")}
          className="h-[38px] flex-1 rounded-xl border border-line bg-surface-2/40 px-3.5
            text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label={t("common.add")}
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl text-white
            disabled:opacity-40"
          style={{ backgroundColor: ACCENT }}
        >
          <Plus size={16} />
        </button>
      </form>

      {hint && <p className="mb-1 text-xs text-muted">{hint}</p>}

      <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-muted">
            <ClipboardList size={20} />
            <span>{t("clipboard.empty")}</span>
            <span className="text-xs">{t("clipboard.emptyHint")}</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group flex items-center gap-2 rounded-lg border border-line bg-surface-2/30 px-3 py-2"
              >
                <button
                  onClick={() => handleCopy(item)}
                  className="min-w-0 flex-1 truncate text-left text-sm hover:text-accent"
                  title={item.text}
                >
                  {item.text}
                </button>
                <button
                  onClick={() => handleCopy(item)}
                  aria-label={t("clipboard.copyBack")}
                  className="shrink-0 text-muted hover:text-content"
                >
                  {copiedId === item.id ? (
                    <Check size={15} className="text-accent" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={t("common.delete")}
                  className="shrink-0 text-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
