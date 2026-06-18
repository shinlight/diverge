/*
  DiVerge — notification sounds & haptics.

  Sounds are synthesized with the Web Audio API (no audio files to bundle).
  Haptics use the Vibration API (mobile; a no-op on desktop).
*/

export const SOUNDS = [
  { id: "none", labelKey: "sounds.none" },
  { id: "chime", labelKey: "sounds.chime" },
  { id: "ping", labelKey: "sounds.ping" },
  { id: "pop", labelKey: "sounds.pop" },
  { id: "marimba", labelKey: "sounds.marimba" },
];

let audioCtx;
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

// Play a short note with a gentle attack/decay envelope.
function note(ac, freq, startAt, dur, type = "sine", peak = 0.16) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startAt;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const RECIPES = {
  chime: (ac) => {
    note(ac, 880, 0, 0.18);
    note(ac, 1320, 0.09, 0.28);
  },
  ping: (ac) => note(ac, 1180, 0, 0.14, "triangle", 0.18),
  pop: (ac) => note(ac, 420, 0, 0.08, "sine", 0.26),
  marimba: (ac) => {
    note(ac, 523, 0, 0.22);
    note(ac, 659, 0.1, 0.22);
    note(ac, 784, 0.2, 0.3);
  },
};

export function playSound(id) {
  if (!id || id === "none") return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") ac.resume();
    RECIPES[id]?.(ac);
  } catch {
    // audio not allowed yet (needs a user gesture) — ignore
  }
}

export function vibrate(pattern = 30) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // unsupported — ignore
  }
}
