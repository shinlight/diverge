import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  X,
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  Flame,
  Clock,
  Hash,
} from "lucide-react";
import { formatTime, TAG_COLORS } from "../../../lib/widgets/focus/focusService";
import { useTheme } from "../../../lib/theme/ThemeContext";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#e864c4";

const TABS = [
  { key: "tasks", labelKey: "focus.tasks" },
  { key: "recap", labelKey: "focus.recap" },
  { key: "settings", labelKey: "focus.settings" },
];

export default function FocusPanel({ open, onClose, focus, initialTab = "tasks" }) {
  const { t } = useI18n();
  const [tab, setTab] = useState(initialTab);
  const { mono } = useTheme();
  const acc = mono ? "#ffffff" : ACCENT;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl"
          >
            {/* Timer header — always visible */}
            <div className="flex shrink-0 items-center gap-4 border-b border-line px-5 py-4">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{
                  backgroundColor: mono ? "rgba(255,255,255,0.1)" : `${ACCENT}1a`,
                  color: acc,
                }}
              >
                <Target size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{focus.phaseLabel}</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatTime(focus.secondsLeft)}
                </p>
              </div>
              <button
                onClick={focus.running ? focus.pause : focus.start}
                className={`grid h-11 w-11 place-items-center rounded-full
                  transition-transform hover:scale-105 active:scale-95 ${
                    mono ? "text-black" : "text-white"
                  }`}
                style={{ backgroundColor: acc }}
              >
                {focus.running ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <button
                onClick={onClose}
                aria-label={t("common.close")}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted
                  hover:bg-surface-2 hover:text-content"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 gap-1 border-b border-line px-3">
              {TABS.map((tb) => (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                    tab === tb.key ? "text-content" : "text-muted hover:text-content"
                  }`}
                >
                  {t(tb.labelKey)}
                  {tab === tb.key && (
                    <motion.span
                      layoutId="focus-tab"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                      style={{ backgroundColor: acc }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === "tasks" && <TasksTab focus={focus} />}
              {tab === "recap" && <RecapTab focus={focus} />}
              {tab === "settings" && <SettingsTab focus={focus} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------- Tasks ------------------------------- */

function TasksTab({ focus }) {
  const { t } = useI18n();
  const { tags, tasks, currentTaskId, setCurrentTaskId, addTask, toggleTask, deleteTask } = focus;
  const [title, setTitle] = useState("");
  const [tagId, setTagId] = useState(tags[0]?.id ?? null);

  function submit(e) {
    e.preventDefault();
    addTask(title, tagId);
    setTitle("");
  }

  const groups = [
    ...tags.map((tg) => ({ tag: tg, items: tasks.filter((x) => x.tagId === tg.id) })),
    {
      tag: null,
      items: tasks.filter((x) => !x.tagId || !tags.some((tg) => tg.id === x.tagId)),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="px-5 py-4">
      <form onSubmit={submit} className="mb-5 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("focus.newTask")}
          className="flex-1 rounded-xl border border-line bg-surface-2/40 px-4 py-2.5
            text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <select
          value={tagId ?? ""}
          onChange={(e) => setTagId(e.target.value || null)}
          className="rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {tags.map((tg) => (
            <option key={tg.id} value={tg.id}>
              {tg.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
          style={{ backgroundColor: ACCENT }}
          aria-label={t("focus.addTask")}
        >
          <Plus size={18} />
        </button>
      </form>

      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{t("focus.noTasks")}</p>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.tag?.id ?? "none"}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: g.tag?.color ?? "#9aa0ad" }}
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {g.tag?.name ?? t("focus.noTag")}
                </span>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    active={task.id === currentTaskId}
                    onSelect={() => setCurrentTaskId(task.id)}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <TagManager focus={focus} />
    </div>
  );
}

function TaskRow({ task, active, onSelect, onToggle, onDelete }) {
  const { t } = useI18n();
  return (
    <li
      className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        active ? "border-accent bg-accent/5" : "border-line hover:bg-surface-2/40"
      }`}
    >
      <button
        onClick={onToggle}
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
          task.done ? "border-transparent bg-accent text-white" : "border-line"
        }`}
      >
        {task.done && <Check size={13} />}
      </button>
      <button onClick={onSelect} className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-sm ${task.done ? "text-muted line-through" : ""}`}>
          {task.title}
        </span>
      </button>
      {task.pomodoros > 0 && (
        <span className="shrink-0 text-xs text-muted">🍅 {task.pomodoros}</span>
      )}
      {active && <Target size={14} className="shrink-0 text-accent" />}
      <button
        onClick={onDelete}
        aria-label={t("common.delete")}
        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function TagManager({ focus }) {
  const { t } = useI18n();
  const { tags, addTag, deleteTag } = focus;
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  return (
    <div className="mt-6 border-t border-line pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {t("focus.tag")}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {tags.map((tg) => (
          <span
            key={tg.id}
            className="group inline-flex items-center gap-1.5 rounded-full border border-line py-1 pl-2.5 pr-1.5 text-xs"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tg.color }} />
            {tg.name}
            <button
              onClick={() => deleteTag(tg.id)}
              aria-label={t("common.delete")}
              className="text-muted hover:text-content"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTag(name, color);
          setName("");
        }}
        className="flex items-center gap-2"
      >
        <div className="flex gap-1">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`h-5 w-5 rounded-full ${color === c ? "ring-2 ring-offset-1 ring-offset-surface" : ""}`}
              style={{ backgroundColor: c, "--tw-ring-color": c }}
            />
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("focus.newTag")}
          className="flex-1 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-content"
        >
          {t("common.add")}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------- Recap ------------------------------- */

function RecapTab({ focus }) {
  const { t } = useI18n();
  const { stats } = focus;
  const maxCount = Math.max(1, ...stats.byTag.map((row) => row.count));

  return (
    <div className="px-5 py-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label={t("focus.recapToday")} value={stats.count} />
        <StatCard icon={Clock} label={t("focus.recapMinutes")} value={stats.minutes} />
      </div>

      <h4 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold">
        <Hash size={15} className="text-muted" /> {t("focus.recapByTag")}
      </h4>

      {stats.byTag.length === 0 ? (
        <p className="whitespace-pre-line py-8 text-center text-sm text-muted">
          {t("focus.recapEmpty")}
        </p>
      ) : (
        <div className="space-y-3">
          {stats.byTag.map((row) => (
            <div key={row.tagId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                  {row.name}
                </span>
                <span className="text-muted">
                  {row.count} 🍅 · {row.minutes} min
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(row.count / maxCount) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: row.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  const { mono } = useTheme();
  return (
    <div className="rounded-2xl border border-line bg-surface-2/30 p-4">
      <Icon
        size={18}
        className={`mb-2 ${mono ? "" : "text-accent"}`}
        style={mono ? { color: "#ffffff" } : undefined}
      />
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

/* ----------------------------- Settings ----------------------------- */

function SettingsTab({ focus }) {
  const { t } = useI18n();
  const { settings, updateSettings } = focus;

  const fields = [
    { key: "focusMin", label: t("focus.focusDuration"), suffix: t("focus.min"), min: 1, max: 90 },
    { key: "shortMin", label: t("focus.shortBreak"), suffix: t("focus.min"), min: 1, max: 30 },
    { key: "longMin", label: t("focus.longBreak"), suffix: t("focus.min"), min: 1, max: 60 },
    { key: "longEvery", label: t("focus.longEvery"), suffix: t("focus.pomodoros"), min: 2, max: 8 },
  ];

  return (
    <div className="space-y-3 px-5 py-5">
      {fields.map((f) => (
        <div
          key={f.key}
          className="flex items-center justify-between rounded-xl border border-line bg-surface-2/30 px-4 py-3"
        >
          <label htmlFor={f.key} className="text-sm">
            {f.label}
          </label>
          <div className="flex items-center gap-2">
            <input
              id={f.key}
              type="number"
              min={f.min}
              max={f.max}
              value={settings[f.key]}
              onChange={(e) =>
                updateSettings({
                  [f.key]: Math.max(f.min, Math.min(f.max, Number(e.target.value) || f.min)),
                })
              }
              className="w-16 rounded-lg border border-line bg-surface px-2 py-1.5 text-right text-sm outline-none focus:border-accent"
            />
            <span className="w-16 text-xs text-muted">{f.suffix}</span>
          </div>
        </div>
      ))}

      <button
        onClick={() => updateSettings({ autoStart: !settings.autoStart })}
        className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2/30 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm">{t("focus.autoStart")}</span>
          <span className="block text-xs text-muted">{t("focus.autoStartDesc")}</span>
        </span>
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            settings.autoStart ? "bg-accent" : "bg-surface-2"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              settings.autoStart ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
}
