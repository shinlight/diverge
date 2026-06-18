// DiVerge — Quick Notes (local, persisted).
const KEY = "diverge.notes";

export const NOTE_COLORS = ["#f0a132", "#7c5cff", "#2fb380", "#22b8cf", "#ff6b6b"];

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    {
      id: "welcome",
      text: "Benvenuto nelle Note rapide! Scrivi un pensiero e premi Aggiungi. ✍️",
      color: NOTE_COLORS[0],
      updatedAt: Date.now(),
    },
  ];
}

export function saveNotes(notes) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}
