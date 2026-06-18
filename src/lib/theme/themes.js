// DiVerge — theme presets.
// Each theme is a full palette mapped to the CSS variables declared in index.css.
// The user can additionally override just the accent colour on top of any theme.

export const THEMES = {
  totalBlack: {
    label: "Total Black",
    isDark: true,
    colors: {
      "--color-base": "#000000",
      "--color-surface": "#0a0a0a",
      "--color-surface-2": "#161616",
      "--color-line": "#242424",
      "--color-content": "#ffffff",
      "--color-muted": "#b3b3b3",
      "--color-accent-contrast": "#ffffff",
    },
  },
  midnight: {
    label: "Midnight",
    isDark: true,
    colors: {
      "--color-base": "#0e0f13",
      "--color-surface": "#16181f",
      "--color-surface-2": "#1e212a",
      "--color-line": "#282c38",
      "--color-content": "#e9eaee",
      "--color-muted": "#9aa0ad",
      "--color-accent-contrast": "#ffffff",
    },
  },
  slate: {
    label: "Slate",
    isDark: true,
    colors: {
      "--color-base": "#0c1116",
      "--color-surface": "#141b22",
      "--color-surface-2": "#1c2630",
      "--color-line": "#26323d",
      "--color-content": "#e6edf3",
      "--color-muted": "#8b98a5",
      "--color-accent-contrast": "#ffffff",
    },
  },
  forest: {
    label: "Forest",
    isDark: true,
    colors: {
      "--color-base": "#0c1310",
      "--color-surface": "#121d18",
      "--color-surface-2": "#1a2a22",
      "--color-line": "#24362c",
      "--color-content": "#e7efe9",
      "--color-muted": "#8da498",
      "--color-accent-contrast": "#ffffff",
    },
  },
  daylight: {
    label: "Daylight",
    isDark: false,
    colors: {
      "--color-base": "#f6f7f9",
      "--color-surface": "#ffffff",
      "--color-surface-2": "#eef0f4",
      "--color-line": "#e2e5eb",
      "--color-content": "#1a1c22",
      "--color-muted": "#6b7280",
      "--color-accent-contrast": "#ffffff",
    },
  },
  sand: {
    label: "Sand",
    isDark: false,
    colors: {
      "--color-base": "#f7f4ef",
      "--color-surface": "#fffdf9",
      "--color-surface-2": "#efe9df",
      "--color-line": "#e4ddd0",
      "--color-content": "#2a2520",
      "--color-muted": "#7a7165",
      "--color-accent-contrast": "#ffffff",
    },
  },
};

// Curated accent colours — calm, friendly, good contrast on both light & dark.
export const ACCENTS = [
  { name: "Viola", value: "#7c5cff" },
  { name: "Indaco", value: "#5c7cff" },
  { name: "Ciano", value: "#22b8cf" },
  { name: "Verde", value: "#2fb380" },
  { name: "Ambra", value: "#f0a132" },
  { name: "Corallo", value: "#ff6b6b" },
  { name: "Rosa", value: "#e864c4" },
];

export const DEFAULT_THEME = "midnight";
export const DEFAULT_ACCENT = ACCENTS[0].value;
