/*
  Divergify — Mood & Energy service.

  Fully local mock (no backend, no keys): quick mood + energy check-ins, persisted
  in localStorage. ADHD-friendly: externalizes interoception (naming how you feel)
  and surfaces patterns over time. To sync later, swap load/save with a Supabase
  table keyed by user id.
*/

import { relativeTime, fullDate } from "../gmail/gmailService";

export { relativeTime, fullDate };

const KEY = "diverge.mood";

export function uid() {
  return crypto.randomUUID().slice(0, 8);
}

// mood scale 1..5
export const MOODS = [
  { v: 1, emoji: "😞", key: "awful" },
  { v: 2, emoji: "😕", key: "low" },
  { v: 3, emoji: "😐", key: "meh" },
  { v: 4, emoji: "🙂", key: "good" },
  { v: 5, emoji: "😄", key: "great" },
];

export function moodEmoji(v) {
  return MOODS.find((m) => m.v === v)?.emoji ?? "❓";
}

const hoursAgoISO = (h) => new Date(Date.now() - h * 3600_000).toISOString();

// --- persistence ---------------------------------------------------------

export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return seed();
}

export function saveEntries(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function seed() {
  return [
    { id: "m1", mood: 4, energy: 3, note: "", ts: hoursAgoISO(2) },
    { id: "m2", mood: 3, energy: 2, note: "Pomeriggio fiacco", ts: hoursAgoISO(20) },
    { id: "m3", mood: 5, energy: 4, note: "", ts: hoursAgoISO(28) },
  ];
}
