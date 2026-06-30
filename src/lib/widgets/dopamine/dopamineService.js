/*
  Divergify — Dopamine Menu service.

  Fully local mock (no backend, no keys): a curated menu of small, doable actions
  to reach for when stuck, bored, or dysregulated — picked by energy level. ADHD-
  friendly: lowers the activation barrier and offers a dopamine alternative to
  doomscrolling. The activity list (incl. user additions) and a per-day "done"
  count are persisted in localStorage.
*/

const LIST_KEY = "diverge.dopamine.list";
const DONE_KEY = "diverge.dopamine.done";

export function uid() {
  return crypto.randomUUID().slice(0, 8);
}

export const ENERGY_LEVELS = ["low", "med", "high"];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// --- activities ----------------------------------------------------------

export function loadActivities() {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return seed();
}

export function saveActivities(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

export function pickRandom(activities, energy = "all") {
  const pool = energy === "all" ? activities : activities.filter((a) => a.energy === energy);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- "done today" counter ------------------------------------------------

export function loadDone() {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.date === todayKey()) return d.count;
    }
  } catch {
    // ignore
  }
  return 0;
}

export function saveDone(count) {
  localStorage.setItem(DONE_KEY, JSON.stringify({ date: todayKey(), count }));
}

// --- seed ----------------------------------------------------------------

function seed() {
  return [
    { id: "d1", emoji: "🫧", label: "Bevi un bicchiere d'acqua", energy: "low", minutes: 1 },
    { id: "d2", emoji: "🌬️", label: "Fai 3 respiri profondi", energy: "low", minutes: 1 },
    { id: "d3", emoji: "🧹", label: "Sistema un solo oggetto", energy: "low", minutes: 2 },
    { id: "d4", emoji: "🪟", label: "Affacciati alla finestra", energy: "low", minutes: 2 },
    { id: "d5", emoji: "🎧", label: "Ascolta una canzone", energy: "low", minutes: 3 },
    { id: "d6", emoji: "🚶", label: "Cammina 5 minuti", energy: "med", minutes: 5 },
    { id: "d7", emoji: "🧴", label: "Riordina la scrivania", energy: "med", minutes: 5 },
    { id: "d8", emoji: "✍️", label: "Scrivi 3 cose da fare", energy: "med", minutes: 3 },
    { id: "d9", emoji: "💬", label: "Scrivi a un amico", energy: "med", minutes: 3 },
    { id: "d10", emoji: "🧊", label: "Lavati il viso con acqua fredda", energy: "med", minutes: 2 },
    { id: "d11", emoji: "💃", label: "Balla una canzone", energy: "high", minutes: 4 },
    { id: "d12", emoji: "🤸", label: "10 jumping jack", energy: "high", minutes: 2 },
    { id: "d13", emoji: "🧽", label: "Pulisci una superficie", energy: "high", minutes: 6 },
    { id: "d14", emoji: "🎯", label: "Fai un micro-task da 2 minuti", energy: "high", minutes: 2 },
  ];
}
