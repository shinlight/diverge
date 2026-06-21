/*
  DiVerge — Focus (Pomodoro) service.

  Unlike Gmail/Calendar this widget is LOCAL: no external API to connect to.
  Everything persists in localStorage so tasks, tags, settings and the day's
  completed pomodoros survive reloads.

  Data:
    settings  -> customizable timer durations
    tags      -> groups for tasks ({ id, name, color })
    tasks     -> { id, title, tagId, done, pomodoros }
    sessions  -> log of completed focus pomodoros ({ id, taskId, tagId, date, minutes })
*/

const KEYS = {
  settings: "diverge.focus.settings",
  tags: "diverge.focus.tags",
  tasks: "diverge.focus.tasks",
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

const DEFAULT_TAGS = [
  { id: "work", name: "Lavoro", color: TAG_COLORS[0] },
  { id: "study", name: "Studio", color: TAG_COLORS[1] },
  { id: "personal", name: "Personale", color: TAG_COLORS[2] },
];

const DEFAULT_TASKS = [
  { id: "t1", title: "Sviluppo widget DiVerge", tagId: "work", done: false, pomodoros: 0 },
  { id: "t2", title: "Studiare React hooks", tagId: "study", done: false, pomodoros: 0 },
  { id: "t3", title: "Rispondere alle email", tagId: "work", done: false, pomodoros: 0 },
];

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

export const loadTags = () => load(KEYS.tags, DEFAULT_TAGS);
export const saveTags = (t) => save(KEYS.tags, t);

export const loadTasks = () => load(KEYS.tasks, DEFAULT_TASKS);
export const saveTasks = (t) => {
  save(KEYS.tasks, t);
  // Let same-tab listeners (e.g. the Cockpit) react — `storage` only fires
  // across tabs.
  try {
    window.dispatchEvent(new Event("diverge:tasks"));
  } catch {
    // ignore (non-browser)
  }
};

export const loadSessions = () => load(KEYS.sessions, []);
export const saveSessions = (s) => save(KEYS.sessions, s);

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
