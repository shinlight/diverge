import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  THEMES,
  DEFAULT_THEME,
  DEFAULT_ACCENT,
} from "./themes";

const STORAGE_KEY = "diverge.theme";

const ThemeContext = createContext(null);

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return { theme: DEFAULT_THEME, accent: DEFAULT_ACCENT, reducedMotion: false };
}

// Apply a palette + accent onto the document root as CSS variables.
function applyToDocument(themeKey, accent) {
  const theme = THEMES[themeKey] ?? THEMES[DEFAULT_THEME];
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([varName, value]) => {
    root.style.setProperty(varName, value);
  });
  root.style.setProperty("--color-accent", accent);
  root.style.colorScheme = theme.isDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [{ theme, accent, reducedMotion }, setState] = useState(loadStored);

  // Re-apply whenever theme or accent changes, and persist the choice.
  useEffect(() => {
    applyToDocument(theme, accent);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme, accent, reducedMotion })
    );
  }, [theme, accent, reducedMotion]);

  // Let the user force "reduce motion" regardless of OS setting.
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion
      ? "true"
      : "false";
  }, [reducedMotion]);

  const value = useMemo(
    () => ({
      theme,
      accent,
      reducedMotion,
      mono: THEMES[theme]?.mono ?? false,
      setTheme: (t) => setState((s) => ({ ...s, theme: t })),
      setAccent: (a) => setState((s) => ({ ...s, accent: a })),
      toggleReducedMotion: () =>
        setState((s) => ({ ...s, reducedMotion: !s.reducedMotion })),
    }),
    [theme, accent, reducedMotion]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
