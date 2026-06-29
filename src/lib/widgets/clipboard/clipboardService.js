// Divergify — Clipboard history (local, capped at 24 entries).
const KEY = "diverge.clipboard";
export const MAX_ITEMS = 24;

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveHistory(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}
