import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Shuffle, Check, Plus, Trash2, Clock } from "lucide-react";
import { ENERGY_LEVELS } from "../../../lib/widgets/dopamine/dopamineService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#eab308";
const EMOJI_CHOICES = ["✨", "🫧", "🌬️", "🚶", "🎧", "💃", "🧹", "✍️", "💬", "🎯", "🤸", "🌱"];

export default function DopamineFocus({ open, onClose, dopamine }) {
  const { t } = useI18n();
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [energy, setEnergy] = useState("med");
  const [minutes, setMinutes] = useState(3);

  function submit(e) {
    e.preventDefault();
    if (!label.trim()) return;
    dopamine.add(label, emoji, energy, Number(minutes) || 1);
    setLabel("");
    setEmoji("✨");
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
            className="relative z-10 flex h-full w-full max-w-3xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <Zap size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{t("widgets.dopamine.name")}</h2>
                <p className="truncate text-xs text-muted">{t("dopamine.doneToday", { n: dopamine.doneToday })}</p>
              </div>
              <button onClick={onClose} aria-label={t("common.close")}
                className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {/* Current suggestion */}
              {dopamine.suggestion && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-surface-2/30 p-4">
                  <span className="text-4xl">{dopamine.suggestion.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{dopamine.suggestion.label}</p>
                    <p className="inline-flex items-center gap-1 text-xs text-muted">
                      <Clock size={11} /> {t("dopamine.minutes", { n: dopamine.suggestion.minutes })}
                    </p>
                  </div>
                  <button onClick={() => dopamine.shuffle()} aria-label={t("dopamine.shuffle")}
                    className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                    <Shuffle size={16} />
                  </button>
                  <button onClick={dopamine.markDone}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white hover:brightness-110"
                    style={{ backgroundColor: ACCENT }}>
                    <Check size={15} /> {t("dopamine.done")}
                  </button>
                </div>
              )}

              {/* Menu by energy */}
              {ENERGY_LEVELS.map((lvl) => {
                const items = dopamine.activities.filter((a) => a.energy === lvl);
                if (items.length === 0) return null;
                return (
                  <div key={lvl} className="mb-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{t(`dopamine.energy.${lvl}`)}</p>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {items.map((a) => (
                        <div key={a.id} className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/30 px-3 py-2">
                          <button onClick={() => dopamine.choose(a)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                            <span className="text-xl">{a.emoji}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm">{a.label}</span>
                              <span className="text-xs text-muted">{t("dopamine.minutes", { n: a.minutes })}</span>
                            </span>
                          </button>
                          <button onClick={() => dopamine.remove(a.id)} aria-label={t("common.delete")}
                            className="shrink-0 text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add custom activity */}
            <form onSubmit={submit} className="shrink-0 border-t border-line px-5 py-4">
              <div className="mb-2 flex flex-wrap gap-1">
                {EMOJI_CHOICES.map((e) => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`grid h-8 w-8 place-items-center rounded-lg text-base transition-colors ${emoji === e ? "" : "opacity-60 hover:opacity-100"}`}
                    style={emoji === e ? { backgroundColor: `${ACCENT}1a` } : undefined}>
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("dopamine.addPlaceholder")}
                  className="min-w-[8rem] flex-1 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent" />
                <select value={energy} onChange={(e) => setEnergy(e.target.value)}
                  className="rounded-xl border border-line bg-surface-2/40 px-2 py-2.5 text-sm outline-none focus:border-accent">
                  {ENERGY_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{t(`dopamine.energy.${lvl}`)}</option>
                  ))}
                </select>
                <input type="number" min="1" max="60" value={minutes} onChange={(e) => setMinutes(e.target.value)} aria-label={t("dopamine.minutesLabel")}
                  className="w-16 rounded-xl border border-line bg-surface-2/40 px-2 py-2.5 text-sm outline-none focus:border-accent" />
                <button type="submit" disabled={!label.trim()}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}>
                  <Plus size={16} /> {t("common.add")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
