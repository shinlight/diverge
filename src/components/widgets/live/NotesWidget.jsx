import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Check, Trash2 } from "lucide-react";
import { useNotes } from "../../../lib/widgets/notes/useNotes";
import { NOTE_COLORS } from "../../../lib/widgets/notes/notesService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#f0a132";

export default function NotesWidget({ title, onRename }) {
  const { t } = useI18n();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [text, setText] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [editingId, setEditingId] = useState(null);

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (editingId) {
      updateNote(editingId, text);
      setEditingId(null);
    } else {
      addNote(text, color);
    }
    setText("");
  }

  function edit(note) {
    setEditingId(note.id);
    setText(note.text);
    setColor(note.color);
  }

  return (
    <div className="flex h-full flex-col p-5">
      <WidgetHeader
        icon={StickyNote}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={notes.length > 0 ? t("notes.count", { n: notes.length }) : undefined}
      />

      <form onSubmit={submit} className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder={t("notes.placeholder")}
          className="w-full resize-none rounded-xl border border-line bg-surface-2/40 px-3.5 py-2.5
            text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <div className="mt-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
                  color === c ? "ring-2 ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ backgroundColor: c, "--tw-ring-color": c }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm
              font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            {editingId ? <Check size={15} /> : <Plus size={15} />}
            {editingId ? t("notes.update") : t("notes.saveNote")}
          </button>
        </div>
      </form>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-muted">
            <StickyNote size={20} />
            <span>{t("notes.empty")}</span>
            <span className="text-xs">{t("notes.emptyHint")}</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notes.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`group flex cursor-pointer items-start gap-2 rounded-xl border border-line
                  bg-surface-2/30 p-3 ${editingId === n.id ? "ring-1 ring-accent" : ""}`}
                style={{ borderLeft: `3px solid ${n.color}` }}
                onClick={() => edit(n)}
              >
                <p className="min-w-0 flex-1 whitespace-pre-line break-words text-sm leading-relaxed line-clamp-3">
                  {n.text}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n.id);
                    if (editingId === n.id) {
                      setEditingId(null);
                      setText("");
                    }
                  }}
                  aria-label={t("common.delete")}
                  className="shrink-0 text-muted opacity-0 transition-opacity
                    hover:text-content group-hover:opacity-100"
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
