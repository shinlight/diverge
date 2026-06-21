import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Maximize2,
  Dice5,
  Plus,
  Circle,
  CircleCheck,
  Star,
  Play,
} from "lucide-react";
import { useTasks } from "../../../lib/widgets/tasks/useTasks";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import TasksFocus from "./TasksFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#2fb380";

export default function TasksWidget({ title = "To-Do", onRename }) {
  const { t } = useI18n();
  const tasks = useTasks();
  const { big3, doneToday, activeCount, toggleDone, addTask, spin } = tasks;
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState("");
  const [spun, setSpun] = useState(null);

  const preview = big3.length
    ? big3
    : tasks.tasks.filter((x) => !x.done && x.status === "active").slice(0, 3);

  function submitQuick(e) {
    e.preventDefault();
    if (addTask({ title: quick })) setQuick("");
  }
  function doSpin() {
    const id = spin();
    if (!id) return;
    setSpun(tasks.tasks.find((x) => x.id === id) ?? null);
  }

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={ListTodo}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={t("tasks.cardSubtitle", { done: doneToday, active: activeCount })}
        actions={
          <>
            <button onClick={doSpin} aria-label={t("tasks.spin")}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
              <Dice5 size={16} />
            </button>
            <button onClick={() => setOpen(true)} aria-label={t("common.expand")}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
              <Maximize2 size={15} />
            </button>
          </>
        }
      />

      <div className="min-h-[140px] flex-1">
        {spun && (
          <button
            onClick={() => { setOpen(true); }}
            className="mb-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm"
            style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}14` }}
          >
            <Play size={15} style={{ color: ACCENT }} />
            <span className="min-w-0 flex-1 truncate font-medium">{spun.title}</span>
            <span className="shrink-0 text-xs text-muted">{t("tasks.doThis")}</span>
          </button>
        )}

        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <Star size={12} /> {big3.length ? t("tasks.big3") : t("tasks.next")}
        </p>

        {preview.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-2 text-center text-sm text-muted">
            <CircleCheck size={20} /> {t("tasks.empty")}
          </div>
        ) : (
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {preview.map((task) => (
                <motion.li key={task.id} layout
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-2/60">
                    <button onClick={() => toggleDone(task.id)} aria-label={t("tasks.complete")} className="shrink-0">
                      <Circle size={17} className="text-muted hover:text-content" />
                    </button>
                    <button onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm">{task.title}</span>
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <form onSubmit={submitQuick}
        className="mt-2 flex items-center gap-2 rounded-xl border border-line px-3 py-2 focus-within:border-accent">
        <Plus size={15} className="text-muted" />
        <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder={t("tasks.quickAdd")}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
      </form>

      <TasksFocus open={open} onClose={() => setOpen(false)} tasks={tasks} />
    </div>
  );
}
