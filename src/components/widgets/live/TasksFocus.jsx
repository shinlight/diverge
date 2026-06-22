import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  X,
  Plus,
  Star,
  Trash2,
  Sparkles,
  Dice5,
  RefreshCw,
  Check,
  ChevronRight,
  Inbox,
  Moon,
  Circle,
  CircleCheck,
  CalendarClock,
  Play,
  Target,
  SkipForward,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
  Clock,
  Hourglass,
} from "lucide-react";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import { ENERGY_META, TIME_META } from "../../../lib/widgets/tasks/meta";
import { TAG_COLORS } from "../../../lib/widgets/tasks/tasksService";

const ACCENT = "#2fb380";

const ENERGY_ICON = { low: BatteryLow, med: BatteryMedium, high: BatteryFull };
const TIME_ICON = { tiny: Zap, quick: Clock, deep: Hourglass };

export default function TasksFocus({ open, onClose, tasks }) {
  const { t, lang } = useI18n();
  const {
    tasks: all,
    tags,
    big3,
    doneToday,
    chunkingIds,
    addTask,
    updateTask,
    removeTask,
    toggleDone,
    toggleBig3,
    setStatus,
    chunkTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    addTag,
    spin,
    startPomodoro,
  } = tasks;

  const [group, setGroup] = useState("all"); // all | inbox | <tagId> | someday
  const [energyFilter, setEnergyFilter] = useState(null);
  const [timeFilter, setTimeFilter] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [spunId, setSpunId] = useState(null);
  const [quick, setQuick] = useState("");
  const [mono, setMono] = useState(false); // "one thing" focus mode
  const [monoIdx, setMonoIdx] = useState(0);
  const rowRefs = useRef({});

  useEffect(() => {
    if (!open) {
      setExpandedId(null);
      setSpunId(null);
    }
  }, [open]);

  function inGroup(task) {
    if (group === "someday") return task.status === "someday";
    if (task.status === "someday") return false;
    if (group === "inbox") return !task.tagId;
    if (group === "all") return true;
    return task.tagId === group;
  }
  function matchFilters(task) {
    if (energyFilter && task.energy !== energyFilter) return false;
    if (timeFilter && task.time !== timeFilter) return false;
    return true;
  }

  const visible = all.filter((x) => !x.done && inGroup(x) && matchFilters(x));
  const doneList = all.filter(
    (x) => x.done && x.doneAt?.slice(0, 10) === todayStr() && inGroup(x)
  );
  // "One thing" mode walks Big 3 first, then the other active tasks.
  const monoList = [
    ...big3,
    ...all.filter((x) => !x.done && x.status === "active" && !big3.some((b) => b.id === x.id)),
  ];

  function submitQuick(e) {
    e.preventDefault();
    const tagId = ["inbox", "all", "someday"].includes(group) ? null : group;
    const created = addTask({ title: quick, tagId, status: group === "someday" ? "someday" : "active" });
    if (created) setQuick("");
  }

  function doSpin() {
    const id = spin(energyFilter);
    if (!id) return;
    setSpunId(id);
    setExpandedId(null);
    setTimeout(() => rowRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  const counts = {
    inbox: all.filter((x) => !x.done && x.status === "active" && !x.tagId).length,
    someday: all.filter((x) => x.status === "someday").length,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <ListTodo size={18} />
              </span>
              <h2 className="text-base font-semibold">{t("widgets.tasks.name")}</h2>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                {t("tasks.doneToday", { n: doneToday })}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => { setMono((m) => !m); setMonoIdx(0); }}
                  aria-label={t("tasks.focusMode")} title={t("tasks.focusMode")}
                  className={`grid h-9 w-9 place-items-center rounded-xl ${mono ? "bg-accent text-accent-contrast" : "text-muted hover:bg-surface-2 hover:text-content"}`}>
                  <Target size={17} />
                </button>
                <button onClick={doSpin}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2
                    text-sm font-medium text-accent-contrast hover:brightness-110">
                  <Dice5 size={16} /> {t("tasks.spin")}
                </button>
                <button onClick={onClose} aria-label={t("common.close")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                  <X size={18} />
                </button>
              </div>
            </div>

            {mono ? (
              <OneThing
                list={monoList}
                index={Math.min(monoIdx, Math.max(0, monoList.length - 1))}
                tags={tags}
                t={t}
                chunkingIds={chunkingIds}
                onDone={(id) => toggleDone(id)}
                onSkip={() => setMonoIdx((i) => i + 1)}
                onPomodoro={(id) => startPomodoro(id)}
                onChunk={(id) => chunkTask(id)}
                onExit={() => setMono(false)}
              />
            ) : (
            <>
            {/* Big 3 */}
            <Big3Strip big3={big3} all={all} onToggleDone={toggleDone} onAdd={toggleBig3} t={t} />

            {/* Body */}
            <div className="flex min-h-0 flex-1">
              {/* Sidebar */}
              <div className="hidden w-[200px] shrink-0 flex-col overflow-y-auto border-r border-line p-3 sm:flex">
                <GroupItem icon={ListTodo} label={t("tasks.all")} active={group === "all"} onClick={() => setGroup("all")} />
                <GroupItem icon={Inbox} label={t("tasks.inbox")} count={counts.inbox} active={group === "inbox"} onClick={() => setGroup("inbox")} />

                <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("tasks.projects")}
                </p>
                {tags.map((tag) => (
                  <button key={tag.id} onClick={() => setGroup(tag.id)}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm
                      ${group === tag.id ? "bg-surface-2 font-medium" : "text-muted hover:bg-surface-2/60"}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="min-w-0 flex-1 truncate">{tag.name}</span>
                  </button>
                ))}
                <AddProject onAdd={addTag} t={t} />

                <GroupItem icon={Moon} label={t("tasks.someday")} count={counts.someday} active={group === "someday"} onClick={() => setGroup("someday")} className="mt-1" />

                <div className="my-3 border-t border-line" />
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("tasks.filters")}
                </p>
                <FilterRow meta={ENERGY_META} icons={ENERGY_ICON} value={energyFilter} onChange={setEnergyFilter} t={t} />
                <div className="h-2" />
                <FilterRow meta={TIME_META} icons={TIME_ICON} value={timeFilter} onChange={setTimeFilter} t={t} />
              </div>

              {/* List */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <form onSubmit={submitQuick}
                  className="mb-3 flex items-center gap-2 rounded-xl border border-line px-3 py-2 focus-within:border-accent">
                  <Plus size={16} className="text-muted" />
                  <input value={quick} onChange={(e) => setQuick(e.target.value)}
                    placeholder={t("tasks.quickAdd")}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
                </form>

                {visible.length === 0 && doneList.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted">
                    <CircleCheck size={22} /> {t("tasks.empty")}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {visible.map((task) => (
                      <li key={task.id} ref={(el) => (rowRefs.current[task.id] = el)}>
                        <TaskRow
                          task={task} tags={tags} lang={lang} t={t}
                          expanded={expandedId === task.id}
                          spun={spunId === task.id}
                          chunking={chunkingIds.has(task.id)}
                          onExpand={() => setExpandedId((id) => (id === task.id ? null : task.id))}
                          onToggleDone={() => toggleDone(task.id)}
                          onToggleBig3={() => toggleBig3(task.id)}
                          onPomodoro={() => startPomodoro(task.id)}
                          onUpdate={(patch) => updateTask(task.id, patch)}
                          onRemove={() => removeTask(task.id)}
                          onChunk={() => chunkTask(task.id)}
                          onToggleSub={(sid) => toggleSubtask(task.id, sid)}
                          onAddSub={(title) => addSubtask(task.id, title)}
                          onRemoveSub={(sid) => removeSubtask(task.id, sid)}
                          onSomeday={() => setStatus(task.id, task.status === "someday" ? "active" : "someday")}
                        />
                      </li>
                    ))}
                    {doneList.map((task) => (
                      <li key={task.id}>
                        <button onClick={() => toggleDone(task.id)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left opacity-55 hover:opacity-80">
                          <CircleCheck size={18} style={{ color: ACCENT }} />
                          <span className="truncate text-sm line-through">{task.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function todayStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function OneThing({ list, index, tags, t, chunkingIds, onDone, onSkip, onPomodoro, onChunk, onExit }) {
  const task = list[index] ?? null;
  const chunking = task ? chunkingIds.has(task.id) : false;
  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <CircleCheck size={32} style={{ color: ACCENT }} />
        <p className="text-lg font-medium">{t("tasks.allClear")}</p>
        <button onClick={onExit} className="rounded-xl border border-line px-4 py-2 text-sm hover:bg-surface-2">
          {t("tasks.exitFocus")}
        </button>
      </div>
    );
  }
  const tag = tags.find((x) => x.id === task.tagId) ?? null;
  const subDone = task.subtasks.filter((s) => s.done).length;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 p-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t("tasks.oneThing")} · {index + 1}/{list.length}
      </p>
      <div className="max-w-xl">
        {tag && (
          <span className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
          </span>
        )}
        <h3 className="text-2xl font-semibold leading-snug">{task.title}</h3>
        {task.subtasks.length > 0 && (
          <p className="mt-2 text-sm text-muted">{subDone}/{task.subtasks.length} step</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => onPomodoro(task.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast hover:brightness-110">
          <Play size={16} /> {t("tasks.startPomodoro")}
        </button>
        <button onClick={() => onDone(task.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-surface-2">
          <CircleCheck size={16} /> {t("tasks.complete")}
        </button>
        <button onClick={() => onChunk(task.id)} disabled={chunking} style={{ color: ACCENT }}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-surface-2 disabled:opacity-70">
          {chunking ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {chunking ? t("tasks.chunking") : t("tasks.chunkIt")}
        </button>
        <button onClick={onSkip}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-content">
          <SkipForward size={16} /> {t("tasks.skip")}
        </button>
      </div>
      <button onClick={onExit} className="text-xs text-muted underline hover:text-content">
        {t("tasks.exitFocus")}
      </button>
    </div>
  );
}

function Big3Strip({ big3, all, onToggleDone, onAdd, t }) {
  const slots = [0, 1, 2];
  const today = todayStr();
  const candidates = all.filter(
    (x) => !x.done && x.status === "active" && !(x.big3 && x.big3Date === today)
  );
  return (
    <div className="shrink-0 border-b border-line bg-surface-2/40 px-5 py-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
        <Star size={13} /> {t("tasks.big3")}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {slots.map((i) => {
          const task = big3[i];
          if (!task)
            return <Big3AddSlot key={`add-${i}`} candidates={candidates} onPick={onAdd} t={t} />;
          return (
            <div key={task.id}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
              <button onClick={() => onToggleDone(task.id)} aria-label={t("tasks.complete")} className="shrink-0">
                <Circle size={16} className="text-muted hover:text-content" />
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{task.title}</span>
              <button onClick={() => onAdd(task.id)} aria-label={t("common.delete")}
                className="shrink-0 text-muted hover:text-content">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Big3AddSlot({ candidates, onPick, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => candidates.length && setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-sm text-muted
          ${candidates.length ? "hover:border-accent hover:text-content" : "opacity-60"}`}>
        <Plus size={15} /> {t("tasks.big3Add")}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-xl">
            {candidates.map((task) => (
              <button key={task.id}
                onClick={() => { onPick(task.id); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2">
                <Star size={13} className="shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate">{task.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GroupItem({ icon: Icon, label, count, active, onClick, className = "" }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm
        ${active ? "bg-surface-2 font-medium" : "text-muted hover:bg-surface-2/60"} ${className}`}>
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count > 0 && <span className="text-xs text-muted">{count}</span>}
    </button>
  );
}

function AddProject({ onAdd, t }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  if (!adding)
    return (
      <button onClick={() => setAdding(true)}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-muted hover:bg-surface-2/60">
        <Plus size={16} /> {t("tasks.addProject")}
      </button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
        if (onAdd(name, color)) {
          setName("");
          setAdding(false);
        }
      }}
      className="px-1 py-1"
    >
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
        onBlur={() => !name && setAdding(false)}
        placeholder={t("tasks.projectName")}
        className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-accent" />
    </form>
  );
}

function FilterRow({ meta, icons, value, onChange, t }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {Object.entries(meta).map(([key, m]) => {
        const Icon = icons[key];
        const on = value === key;
        return (
          <button key={key} onClick={() => onChange(on ? null : key)}
            title={t(m.labelKey)}
            className="flex flex-col items-center gap-1 rounded-lg border px-1 py-1.5 text-[11px] transition-colors"
            style={{
              borderColor: on ? m.color : "var(--color-line)",
              backgroundColor: on ? `${m.color}1f` : "transparent",
              color: on ? m.color : "var(--color-muted)",
            }}>
            <Icon size={15} />
            {t(m.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function LevelSelect({ meta, icons, value, onChange, label, hint, t }) {
  return (
    <div>
      <p className="text-xs font-medium">{label}</p>
      <p className="mb-2 text-[11px] text-muted">{hint}</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(meta).map(([key, m]) => {
          const Icon = icons[key];
          const on = value === key;
          return (
            <button key={key} type="button" onClick={() => onChange(on ? null : key)}
              className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all"
              style={{
                borderColor: on ? m.color : "var(--color-line)",
                outline: on ? `2px solid ${m.color}` : "none",
                outlineOffset: "-1px",
                backgroundColor: `${m.color}14`,
                color: m.color,
              }}>
              <Icon size={18} />
              <span className="text-xs font-medium">{t(m.labelKey)}</span>
              <span className="text-[11px] opacity-80">{t(m.hintKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({
  task, tags, lang, t, expanded, spun, chunking,
  onExpand, onToggleDone, onToggleBig3, onPomodoro, onUpdate, onRemove,
  onChunk, onToggleSub, onAddSub, onRemoveSub, onSomeday,
}) {
  const tag = tags.find((x) => x.id === task.tagId) ?? null;
  const subDone = task.subtasks.filter((s) => s.done).length;
  const [sub, setSub] = useState("");

  return (
    <div className="rounded-xl border transition-colors"
      style={{ borderColor: spun ? ACCENT : "var(--color-line)", outline: spun ? `1.5px solid ${ACCENT}` : "none" }}>
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <button onClick={onToggleDone} aria-label={t("tasks.complete")} className="mt-0.5 shrink-0">
          <Circle size={18} className="text-muted hover:text-content" />
        </button>
        <button onClick={onExpand} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-medium">{task.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {tag && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} /> {tag.name}
              </span>
            )}
            {task.energy && <MiniChip meta={ENERGY_META[task.energy]} icon={ENERGY_ICON[task.energy]} t={t} />}
            {task.time && <MiniChip meta={TIME_META[task.time]} icon={TIME_ICON[task.time]} t={t} />}
            {task.due && <DueChip due={task.due} lang={lang} t={t} />}
            {task.subtasks.length > 0 && (
              <span className="text-[11px] text-muted">{subDone}/{task.subtasks.length}</span>
            )}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5 text-muted">
          <button onClick={onPomodoro} aria-label={t("tasks.startPomodoro")} title={t("tasks.startPomodoro")}
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-surface-2 hover:text-content">
            <Play size={15} />
          </button>
          <button onClick={onChunk} disabled={chunking} aria-label="chunk-it" title="chunk-it"
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-surface-2 hover:text-content disabled:opacity-100">
            {chunking ? <RefreshCw size={15} className="animate-spin" style={{ color: ACCENT }} /> : <Sparkles size={15} style={{ color: ACCENT }} />}
          </button>
          <button onClick={onToggleBig3} aria-label={t("tasks.big3")} title={t("tasks.big3")}
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-surface-2 hover:text-content">
            <Star size={15} fill={task.big3 ? "#f5b400" : "none"} color={task.big3 ? "#f5b400" : "currentColor"} />
          </button>
          <button onClick={onExpand} aria-label={t("common.expand")}
            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-surface-2 hover:text-content">
            <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* Subtasks (always visible if present) */}
      {task.subtasks.length > 0 && (
        <div className="ml-12 mr-3 border-l-2 pl-3" style={{ borderColor: `${ACCENT}55` }}>
          {task.subtasks.map((s) => (
            <div key={s.id} className="group flex items-center gap-2 py-1">
              <button onClick={() => onToggleSub(s.id)} className="shrink-0">
                {s.done ? <CircleCheck size={15} style={{ color: ACCENT }} /> : <Circle size={15} className="text-muted" />}
              </button>
              <span className={`flex-1 text-sm ${s.done ? "text-muted line-through" : ""}`}>{s.title}</span>
              <button onClick={() => onRemoveSub(s.id)} aria-label={t("common.delete")}
                className="shrink-0 text-muted opacity-0 hover:text-content group-hover:opacity-100">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded editor */}
      {expanded && (
        <div className="space-y-4 border-t border-line px-4 py-4">
          <input value={task.title} onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-transparent text-sm font-medium outline-none" />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{t("tasks.project")}</span>
            <select value={task.tagId ?? ""} onChange={(e) => onUpdate({ tagId: e.target.value || null })}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-sm outline-none [color-scheme:dark]">
              <option value="">{t("tasks.inbox")}</option>
              {tags.map((tg) => (<option key={tg.id} value={tg.id}>{tg.name}</option>))}
            </select>
            <span className="ml-2 text-xs text-muted">{t("tasks.due")}</span>
            <input type="date" value={task.due ? task.due.slice(0, 10) : ""}
              onChange={(e) => onUpdate({ due: e.target.value || null })}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-sm outline-none [color-scheme:dark]" />
          </div>

          <LevelSelect meta={ENERGY_META} icons={ENERGY_ICON} value={task.energy}
            onChange={(v) => onUpdate({ energy: v })}
            label={t("tasks.energyQ")} hint={t("tasks.energyHint")} t={t} />
          <LevelSelect meta={TIME_META} icons={TIME_ICON} value={task.time}
            onChange={(v) => onUpdate({ time: v })}
            label={t("tasks.timeQ")} hint={t("tasks.timeHint")} t={t} />

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onChunk} disabled={chunking}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent px-3 py-1.5 text-sm font-medium disabled:opacity-70"
              style={{ color: ACCENT }}>
              {chunking ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {chunking ? t("tasks.chunking") : task.subtasks.length ? t("tasks.rechunk") : t("tasks.chunkIt")}
            </button>
            <form onSubmit={(e) => { e.preventDefault(); if (sub.trim()) { onAddSub(sub); setSub(""); } }}
              className="flex flex-1 items-center gap-2 rounded-lg border border-line px-2 py-1.5">
              <Plus size={14} className="text-muted" />
              <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder={t("tasks.addSubtask")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
            </form>
          </div>

          <div className="flex items-center gap-2 border-t border-line pt-3">
            <button onClick={onSomeday}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content">
              <Moon size={15} /> {task.status === "someday" ? t("tasks.moveActive") : t("tasks.moveSomeday")}
            </button>
            <button onClick={onRemove} aria-label={t("common.delete")}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-content">
              <Trash2 size={15} /> {t("common.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniChip({ meta, icon: Icon, t }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px]"
      style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}>
      <Icon size={11} /> {t(meta.labelKey)}
    </span>
  );
}

function DueChip({ due, lang, t }) {
  const d = new Date(due);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const days = Math.round((dd - today) / 86400000);
  const overdue = days < 0;
  let label;
  if (days === 0) label = t("calendar.today");
  else if (days === 1) label = t("calendar.tomorrow");
  else label = d.toLocaleDateString(lang === "it" ? "it-IT" : "en-US", { day: "numeric", month: "short" });
  return (
    <span className="inline-flex items-center gap-1 text-[11px]"
      style={{ color: overdue ? "#d8893a" : "var(--color-muted)" }}>
      <CalendarClock size={11} /> {label}
    </span>
  );
}
