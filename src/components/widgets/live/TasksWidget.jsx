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
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
  Clock,
  Hourglass,
} from "lucide-react";
import { useTasks } from "../../../lib/widgets/tasks/useTasks";
import { ENERGY_META, TIME_META } from "../../../lib/widgets/tasks/meta";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import TasksFocus from "./TasksFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#2fb380";
const ENERGY_ICON = { low: BatteryLow, med: BatteryMedium, high: BatteryFull };
const TIME_ICON = { tiny: Zap, quick: Clock, deep: Hourglass };

export default function TasksWidget({ title = "To-Do", onRename }) {
  const { t } = useI18n();
  const tasks = useTasks();
  const { big3, doneToday, activeCount, tags, toggleDone, addTask, spin } = tasks;
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState("");
  const [spun, setSpun] = useState(null);

  const usingBig3 = big3.length > 0;
  const preview = usingBig3
    ? big3
    : tasks.tasks.filter((x) => !x.done && x.status === "active").slice(0, 4);

  const total = doneToday + activeCount;
  const pct = total > 0 ? Math.round((doneToday / total) * 100) : 0;

  function submitQuick(e) {
    e.preventDefault();
    if (addTask({ title: quick })) setQuick("");
  }
  function doSpin() {
    const id = spin();
    if (id) setSpun(tasks.tasks.find((x) => x.id === id) ?? null);
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

      {/* Progress */}
      {total > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted">{doneToday}/{total}</span>
        </div>
      )}

      <div className="min-h-[120px] flex-1">
        {spun && (
          <button onClick={() => setOpen(true)}
            className="mb-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm"
            style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}14` }}>
            <Play size={15} style={{ color: ACCENT }} />
            <span className="min-w-0 flex-1 truncate font-medium">{spun.title}</span>
            <span className="shrink-0 text-xs text-muted">{t("tasks.doThis")}</span>
          </button>
        )}

        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <Star size={12} /> {usingBig3 ? t("tasks.big3") : t("tasks.next")}
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
                  <Row task={task} tags={tags} t={t} onToggle={() => toggleDone(task.id)} onOpen={() => setOpen(true)} />
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

function Row({ task, tags, t, onToggle, onOpen }) {
  const tag = tags.find((x) => x.id === task.tagId) ?? null;
  const EIcon = task.energy ? ENERGY_ICON[task.energy] : null;
  const TIcon = task.time ? TIME_ICON[task.time] : null;
  const hasMeta = tag || task.energy || task.time;
  return (
    <div className="flex items-center gap-2.5 rounded-lg py-1 pr-1 hover:bg-surface-2/60">
      <span className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: tag ? tag.color : "transparent" }} />
      <button onClick={onToggle} aria-label={t("tasks.complete")} className="shrink-0">
        <Circle size={17} className="text-muted hover:text-content" />
      </button>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm">{task.title}</span>
        {hasMeta && (
          <span className="mt-0.5 flex items-center gap-2">
            {task.energy && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: ENERGY_META[task.energy].color }}>
                <EIcon size={12} /> {t(ENERGY_META[task.energy].labelKey)}
              </span>
            )}
            {task.time && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: TIME_META[task.time].color }}>
                <TIcon size={12} /> {t(TIME_META[task.time].labelKey)}
              </span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
