// Shared look-up for the energy + time axes (colours follow the user's
// battery/effort metaphor: low energy = red → full = green; quick = green →
// deep = red). Icons are mapped in the components (lucide).

export const ENERGY_META = {
  low: { color: "#e2504a", labelKey: "tasks.energy.low", hintKey: "tasks.energy.lowHint" },
  med: { color: "#f0a132", labelKey: "tasks.energy.med", hintKey: "tasks.energy.medHint" },
  high: { color: "#2fb380", labelKey: "tasks.energy.high", hintKey: "tasks.energy.highHint" },
};

export const TIME_META = {
  tiny: { color: "#2fb380", labelKey: "tasks.time.tiny", hintKey: "tasks.time.tinyHint" },
  quick: { color: "#f0a132", labelKey: "tasks.time.quick", hintKey: "tasks.time.quickHint" },
  deep: { color: "#e2504a", labelKey: "tasks.time.deep", hintKey: "tasks.time.deepHint" },
};

// Soft tint of a hex colour for chip backgrounds (hex + alpha).
export function tint(hex, alpha = "22") {
  return `${hex}${alpha}`;
}
