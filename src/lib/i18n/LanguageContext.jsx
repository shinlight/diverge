import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translate, DEFAULT_LANG, LANGUAGES } from "./translations";

const STORAGE_KEY = "diverge.lang";
const LanguageContext = createContext(null);

function loadLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.id === saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(loadLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, vars) => translate(lang, key, vars);
    return { lang, setLang: setLangState, t, languages: LANGUAGES };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within <LanguageProvider>");
  return ctx;
}
