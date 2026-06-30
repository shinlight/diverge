/*
  Divergify — Focus (Pomodoro) service.

  Local widget (no external API). Settings + the day's completed pomodoros
  persist here. Tasks + tags are NOT owned here anymore — they live in the
  shared tasksService (the To-Do widget is the canonical task store); we just
  re-export its loaders so existing Focus code keeps working against one list.

  Data:
    settings  -> customizable timer durations
    sessions  -> log of completed focus pomodoros ({ id, taskId, tagId, date, minutes })
*/

import {
  loadTasks as tasksLoad,
  saveTasks as tasksSave,
  loadTags as tagsLoad,
  saveTags as tagsSave,
  makeTask,
} from "../tasks/tasksService";

const KEYS = {
  settings: "diverge.focus.settings",
  sessions: "diverge.focus.sessions",
};

export const TAG_COLORS = [
  "#7c5cff",
  "#22b8cf",
  "#2fb380",
  "#f0a132",
  "#ff6b6b",
  "#e864c4",
];

export const DEFAULT_SETTINGS = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4, // a long break after every N pomodoros
  autoStart: true, // auto-start the next phase
};

// --- persistence ---------------------------------------------------------

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return fallback;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) });
export const saveSettings = (s) => save(KEYS.settings, s);

// Tasks + tags are owned by the shared tasksService now — re-export so the
// Focus widget reads/writes the same canonical list.
export const loadTags = tagsLoad;
export const saveTags = tagsSave;
export const loadTasks = tasksLoad;
export const saveTasks = tasksSave;

// Build a full-shaped task (the To-Do model) — used by useFocus.addTask so
// tasks created from the Pomodoro widget are consistent everywhere.
export { makeTask };

export const loadSessions = () => load(KEYS.sessions, []);
export const saveSessions = (s) => {
  save(KEYS.sessions, s);
  // Let same-tab listeners (e.g. the Cockpit recap) re-read.
  window.dispatchEvent(new Event("diverge:focus"));
};

// --- helpers -------------------------------------------------------------

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export function todayStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Recap of today's completed pomodoros, with a per-tag breakdown.
export function todayStats(sessions, tags) {
  const today = todayStr();
  const todays = sessions.filter((s) => s.date === today);
  const byTagMap = new Map();

  for (const s of todays) {
    const key = s.tagId ?? "none";
    if (!byTagMap.has(key)) byTagMap.set(key, { count: 0, minutes: 0 });
    const agg = byTagMap.get(key);
    agg.count += 1;
    agg.minutes += s.minutes;
  }

  const byTag = [...byTagMap.entries()].map(([tagId, agg]) => {
    const tag = tags.find((t) => t.id === tagId);
    return {
      tagId,
      name: tag?.name ?? "Senza tag",
      color: tag?.color ?? "#9aa0ad",
      count: agg.count,
      minutes: agg.minutes,
    };
  });
  byTag.sort((a, b) => b.count - a.count);

  return {
    count: todays.length,
    minutes: todays.reduce((sum, s) => sum + s.minutes, 0),
    byTag,
  };
}
