import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Check, Maximize2 } from "lucide-react";
import { useHabits } from "../../../lib/widgets/habits/useHabits";
import { computeStreak, isDoneToday } from "../../../lib/widgets/habits/habitsService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import HabitsFocus from "./HabitsFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#f97316";

export default function HabitsWidget({ title = "Habits", onRename }) {
  const { t } = useI18n();
  const habits = useHabits();
  const { doneToday, total } = habits;
  const [focusOpen, setFocusOpen] = useState(false);

  const preview = habits.habits.slice(0, 4);

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={Flame}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={total > 0 ? t("habits.todayCount", { done: doneToday, total }) : t("habits.subtitle")}
        actions={
          <button onClick={() => setFocusOpen(true)} aria-label={t("common.expand")}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
            <Maximize2 size={15} />
          </button>
        }
      />

      <div className="min-h-[140px] flex-1">
        {total === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
            <Flame size={20} />
            <span>{t("habits.empty")}</span>
            <button onClick={() => setFocusOpen(true)} className="mt-1 text-sm font-medium text-accent hover:underline">
              {t("habits.addCta")}
            </button>
          </div>
        ) : (
          <ul className="-mx-1 space-y-0.5">
            <AnimatePresence initial={false}>
              {preview.map((h) => {
                const done = isDoneToday(h);
                const streak = computeStreak(h.history);
                return (
                  <motion.li key={h.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                      <button
                        onClick={() => habits.toggleToday(h.id)}
                        aria-label={done ? t("habits.markUndone") : t("habits.markDone")}
                        aria-pressed={done}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors"
                        style={done ? { backgroundColor: ACCENT, borderColor: ACCENT } : { borderColor: "var(--color-line)" }}
                      >
                        {done && <Check size={15} className="text-white" />}
                      </button>
                      <span className="text-base leading-none">{h.emoji}</span>
                      <span className={`min-w-0 flex-1 truncate text-sm ${done ? "text-muted line-through" : "text-content"}`}>
                        {h.name}
                      </span>
                      {streak > 0 && (
                        <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold" style={{ color: ACCENT }}>
                          <Flame size={13} /> {streak}
                        </span>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <HabitsFocus open={focusOpen} onClose={() => setFocusOpen(false)} habits={habits} />
    </div>
  );
}
