/*
  DiVerge — Brain Dump service.

  A frictionless capture buffer: get the thought out of your head NOW, triage
  later (→ task or delete). Local-only. Item: { id, text, createdAt }.
*/

const KEY = "diverge.braindump";

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export function loadDump() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveDump(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("diverge:braindump"));
  } catch {
    // ignore
  }
}
