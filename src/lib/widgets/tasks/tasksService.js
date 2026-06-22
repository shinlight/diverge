/*
  DiVerge — Tasks service (the canonical task store).

  This is the single source of truth for tasks + projects (tags). The Focus
  (Pomodoro) widget and the Cockpit read/write through here too, so there's one
  task list everywhere. Local-only (localStorage); migrates the old
  `diverge.focus.*` data once.

  Task shape:
    { id, title, notes, tagId, energy:"low|med|high"|null,
      time:"tiny|quick|deep"|null, due:ISO|null, big3, big3Date,
      status:"active"|"someday", subtasks:[{id,title,done}],
      done, doneAt, pomodoros, createdAt }
  Tag (project): { id, name, color }
*/

const TASKS_KEY = "diverge.tasks";
const TAGS_KEY = "diverge.tasks.tags";
const OLD_TASKS_KEY = "diverge.focus.tasks";
const OLD_TAGS_KEY = "diverge.focus.tags";

export const TAG_COLORS = [
  "#7c5cff",
  "#22b8cf",
  "#2fb380",
  "#f0a132",
  "#ff6b6b",
  "#e864c4",
];

export const ENERGY_LEVELS = ["low", "med", "high"];
export const TIME_LEVELS = ["tiny", "quick", "deep"];

const DEFAULT_TAGS = [
  { id: "work", name: "Lavoro", color: TAG_COLORS[0] },
  { id: "study", name: "Studio", color: TAG_COLORS[1] },
  { id: "personal", name: "Personale", color: TAG_COLORS[2] },
];

const DEFAULT_TASKS = [
  { id: "t1", title: "Preparare la presentazione Q3", tagId: "work", energy: "high", time: "deep" },
  { id: "t2", title: "Rispondere a Martina", tagId: "work", energy: "med", time: "tiny" },
  { id: "t3", title: "Comprare il latte", tagId: "personal", energy: "low", time: "tiny" },
];

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export function todayStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Fill any missing fields so older/partial tasks (e.g. created by the Focus
// widget) always have the full shape.
export function normalizeTask(t) {
  return {
    id: t.id ?? uid(),
    title: t.title ?? "",
    notes: t.notes ?? "",
    tagId: t.tagId ?? null,
    energy: t.energy ?? null,
    time: t.time ?? null,
    due: t.due ?? null,
    big3: Boolean(t.big3),
    big3Date: t.big3Date ?? null,
    status: t.status === "someday" ? "someday" : "active",
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
    done: Boolean(t.done),
    doneAt: t.doneAt ?? null,
    pomodoros: t.pomodoros ?? 0,
    createdAt: t.createdAt ?? new Date().toISOString(),
  };
}

export function makeTask(partial = {}) {
  return normalizeTask({ id: uid(), createdAt: new Date().toISOString(), ...partial });
}

// Append a task to the shared store from outside a React hook (e.g. the
// Brain-dump widget "→ task"). Dispatches so widgets re-sync.
export function pushTask(partial) {
  const task = makeTask(partial);
  saveTasks([task, ...loadTasks()]);
  return task;
}

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

// One-time migration from the Focus widget's old keys.
function migrateIfNeeded() {
  if (read(TASKS_KEY)) return;
  const oldTasks = read(OLD_TASKS_KEY);
  const oldTags = read(OLD_TAGS_KEY);
  const tasks = (oldTasks ?? DEFAULT_TASKS).map(normalizeTask);
  const tags = oldTags ?? DEFAULT_TAGS;
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  } catch {
    // ignore
  }
}

export function loadTasks() {
  migrateIfNeeded();
  return (read(TASKS_KEY) ?? DEFAULT_TASKS.map(normalizeTask)).map(normalizeTask);
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    // Same-tab listeners (Cockpit, Focus widget) — `storage` only fires across tabs.
    window.dispatchEvent(new Event("diverge:tasks"));
  } catch {
    // ignore
  }
}

export function loadTags() {
  migrateIfNeeded();
  return read(TAGS_KEY) ?? DEFAULT_TAGS;
}

export function saveTags(tags) {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    window.dispatchEvent(new Event("diverge:tasks"));
  } catch {
    // ignore
  }
}

// --- chunk-it (heuristic; swap point for a real LLM later) ----------------

const shorten = (s, n = 40) => (s.length > n ? `${s.slice(0, n).trim()}…` : s);

// Split a task title into 2-6 actionable micro-steps. If the title already
// lists parts (commas / "e" / "poi" / "then"…), use those; otherwise fall back
// to a generic ADHD scaffold whose first step is always a 2-minute starter.
// Real-AI chunk-it via the serverless function (needs a Supabase JWT).
// Returns an array of step strings, or null on any failure (caller falls back
// to the heuristic chunkIt below).
export async function chunkItAI(title, jwt) {
  try {
    const res = await fetch("/api/ai-chunk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return Array.isArray(j.steps) && j.steps.length ? j.steps : null;
  } catch {
    return null;
  }
}

export function chunkIt(title) {
  const t = (title || "").trim();
  if (!t) return [];
  const parts = t
    .split(/\s*(?:,|;|\/|\+|&|\bpoi\b|\bthen\b|\be\b|\band\b)\s*/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 1);
  if (parts.length >= 2) {
    return parts.slice(0, 6).map((p, i) => (i === 0 ? `Inizia: ${p}` : p));
  }
  return [
    `Inizia: i primi 2 minuti di "${shorten(t)}"`,
    "Prepara ciò che ti serve",
    "Fai il blocco principale",
    "Rivedi e chiudi",
  ];
}
