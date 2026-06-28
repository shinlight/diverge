import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, X, Zap, Check, Trash2 } from "lucide-react";
import { MOODS, moodEmoji, relativeTime } from "../../../lib/widgets/mood/moodService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#ec4899";

export default function MoodFocus({ open, onClose, mood }) {
  const { t, lang } = useI18n();
  const [pick, setPick] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function save() {
    if (!pick) return;
    mood.addEntry({ mood: pick, energy, note });
    setPick(null);
    setNote("");
    setEnergy(3);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
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
            className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <Smile size={18} />
              </span>
              <h2 className="min-w-0 truncate text-base font-semibold">{t("widgets.mood.name")}</h2>
              <button onClick={onClose} aria-label={t("common.close")}
                className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {/* Check-in form */}
              <div className="rounded-2xl border border-line bg-surface-2/30 p-4">
                <p className="mb-3 text-sm font-medium">{t("mood.prompt")}</p>
                <div className="flex items-center justify-between gap-1.5">
                  {MOODS.map((m) => (
                    <button key={m.v} onClick={() => setPick(m.v)}
                      className={`grid h-14 flex-1 place-items-center rounded-xl text-3xl transition-all hover:scale-105 ${pick === m.v ? "ring-2" : "grayscale-[40%] hover:grayscale-0"}`}
                      style={pick === m.v ? { backgroundColor: `${ACCENT}1a`, "--tw-ring-color": ACCENT } : undefined}>
                      {m.emoji}
                    </button>
                  ))}
                </div>

                <p className="mb-2 mt-4 flex items-center gap-1.5 text-sm font-medium">
                  <Zap size={15} style={{ color: ACCENT }} /> {t("mood.energy")}
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button key={lvl} onClick={() => setEnergy(lvl)}
                      className="h-8 flex-1 rounded-lg border transition-colors"
                      style={lvl <= energy
                        ? { backgroundColor: ACCENT, borderColor: ACCENT }
                        : { borderColor: "var(--color-line)" }}
                      aria-label={`${t("mood.energy")} ${lvl}/5`} />
                  ))}
                </div>

                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("mood.notePlaceholder")} rows={2}
                  className="mt-4 w-full resize-none rounded-xl border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent" />

                <button onClick={save} disabled={!pick}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}>
                  <Check size={16} /> {saved ? t("mood.saved") : t("mood.save")}
                </button>
              </div>

              {/* History */}
              <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("mood.history")}</p>
              {mood.entries.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">{t("mood.empty")}</p>
              ) : (
                <ul className="space-y-1">
                  {mood.entries.map((e) => (
                    <li key={e.id} className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2/40">
                      <span className="text-2xl">{moodEmoji(e.mood)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>{relativeTime(e.ts, lang)}</span>
                          {e.energy != null && (
                            <span className="inline-flex items-center gap-0.5">
                              <Zap size={11} style={{ color: ACCENT }} /> {e.energy}/5
                            </span>
                          )}
                        </div>
                        {e.note && <p className="truncate text-sm text-content/90">{e.note}</p>}
                      </div>
                      <button onClick={() => mood.remove(e.id)} aria-label={t("common.delete")}
                        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                        <Trash2 size={15} />
                      </button>
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
