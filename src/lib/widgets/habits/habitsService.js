/*
  Divergify — Habits service.

  Fully local mock (no backend, no keys): daily habits with streaks, persisted in
  localStorage. ADHD-friendly: externalizes routines and rewards consistency with
  a visible streak (dopamine). To sync across devices later, swap load/save with
  a Supabase table keyed by user id.
*/

const KEY = "diverge.habits";

export function uid() {
  return crypto.randomUUID().slice(0, 8);
}

// --- date helpers (local day, YYYY-MM-DD) --------------------------------

export function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey() {
  return dayKey(0);
}

// Streak = consecutive days done up to today. If today isn't done yet the streak
// still counts from yesterday (so an unchecked "today" doesn't look like a break).
export function computeStreak(history) {
  const set = new Set(history);
  let start = set.has(todayKey()) ? 0 : 1;
  let streak = 0;
  for (let off = start; ; off++) {
    if (set.has(dayKey(off))) streak++;
    else break;
  }
  return streak;
}

export function isDoneToday(habit) {
  return habit.history.includes(todayKey());
}

// --- persistence ---------------------------------------------------------

export function loadHabits() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return seed();
}

export function saveHabits(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // Let same-tab listeners (e.g. the Cockpit recap) re-read.
  window.dispatchEvent(new Event("diverge:habits"));
}

// Seeded so streaks are visible on first run.
function seed() {
  return [
    { id: "h1", name: "Bevi acqua", emoji: "💧", history: [dayKey(0), dayKey(1), dayKey(2), dayKey(3), dayKey(4)] },
    { id: "h2", name: "Medita 5 min", emoji: "🧘", history: [dayKey(1), dayKey(2)] },
    { id: "h3", name: "Leggi 10 pagine", emoji: "📖", history: [dayKey(0)] },
  ];
}
