import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Check, Plus, Trash2 } from "lucide-react";
import { computeStreak, isDoneToday, dayKey } from "../../../lib/widgets/habits/habitsService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#f97316";
const EMOJI_CHOICES = ["✅", "💧", "🧘", "📖", "🏃", "💊", "🌱", "🦷", "☀️", "✍️", "🎯", "😴"];

export default function HabitsFocus({ open, onClose, habits }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    habits.add(name, emoji);
    setName("");
    setEmoji("✅");
  }

  // Weekday initials for the last 7 days (oldest → today).
  const week = [6, 5, 4, 3, 2, 1, 0].map((off) => {
    const key = dayKey(off);
    const d = new Date(key);
    return { key, off, label: d.toLocaleDateString(lang === "it" ? "it-IT" : "en-US", { weekday: "narrow" }) };
  });

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
                <Flame size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{t("widgets.habits.name")}</h2>
                <p className="truncate text-xs text-muted">{t("habits.todayCount", { done: habits.doneToday, total: habits.total })}</p>
              </div>
              <button onClick={onClose} aria-label={t("common.close")}
                className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {/* Week header */}
              <div className="mb-2 flex items-center gap-3 pl-[2.75rem] pr-1">
                <div className="ml-auto flex gap-1.5">
                  {week.map((w) => (
                    <span key={w.key} className="w-6 text-center text-[10px] uppercase text-muted">{w.label}</span>
                  ))}
                </div>
              </div>

              {habits.habits.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">{t("habits.empty")}</p>
              ) : (
                <ul className="space-y-1">
                  {habits.habits.map((h) => {
                    const streak = computeStreak(h.history);
                    const done = isDoneToday(h);
                    return (
                      <li key={h.id} className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2/40">
                        <button
                          onClick={() => habits.toggleToday(h.id)}
                          aria-label={done ? t("habits.markUndone") : t("habits.markDone")}
                          aria-pressed={done}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors"
                          style={done ? { backgroundColor: ACCENT, borderColor: ACCENT } : { borderColor: "var(--color-line)" }}
                        >
                          {done && <Check size={16} className="text-white" />}
                        </button>
                        <span className="text-lg leading-none">{h.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{h.name}</span>
                          {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: ACCENT }}>
                              <Flame size={12} /> {t("habits.streak", { n: streak })}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 gap-1.5">
                          {week.map((w) => {
                            const hit = h.history.includes(w.key);
                            return (
                              <span key={w.key} className="grid w-6 place-items-center">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hit ? ACCENT : "var(--color-line)" }} />
                              </span>
                            );
                          })}
                        </span>
                        <button onClick={() => habits.remove(h.id)} aria-label={t("common.delete")}
                          className="shrink-0 text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                          <Trash2 size={15} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Add habit */}
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
              <div className="flex items-center gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("habits.addPlaceholder")}
                  className="flex-1 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent" />
                <button type="submit" disabled={!name.trim()}
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
