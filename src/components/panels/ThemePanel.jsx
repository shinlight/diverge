import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Volume2 } from "lucide-react";
import { useTheme } from "../../lib/theme/ThemeContext";
import { THEMES, ACCENTS } from "../../lib/theme/themes";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { useNotifications } from "../../lib/notifications/NotificationContext";
import { SOUNDS, playSound } from "../../lib/notifications/sound";

export default function ThemePanel({ open, onClose }) {
  const { theme, accent, reducedMotion, setTheme, setAccent, toggleReducedMotion } = useTheme();
  const { t, lang, setLang, languages } = useI18n();
  const { prefs, updatePrefs } = useNotifications();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col
              border-l border-line bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles size={18} className="text-accent" />
                {t("theme.title")}
              </h2>
              <button
                onClick={onClose}
                aria-label={t("common.close")}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted
                  hover:bg-surface-2 hover:text-content"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {/* Language */}
              <Section title={t("theme.language")}>
                <div className="flex gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border
                        py-2.5 text-sm font-medium transition-colors ${
                          lang === l.id
                            ? "border-accent bg-accent/10 text-content"
                            : "border-line text-muted hover:text-content"
                        }`}
                    >
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Themes */}
              <Section title={t("theme.theme")}>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(THEMES).map(([key, th]) => {
                    const active = key === theme;
                    return (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`relative overflow-hidden rounded-2xl border p-3 text-left
                          transition-all ${
                            active ? "border-accent ring-2 ring-accent/40" : "border-line hover:border-muted"
                          }`}
                      >
                        <div className="mb-2 flex gap-1.5">
                          {[th.colors["--color-bg"], th.colors["--color-surface-2"], th.colors["--color-content"]].map(
                            (c, i) => (
                              <span
                                key={i}
                                className="h-5 w-5 rounded-full ring-1 ring-black/10"
                                style={{ backgroundColor: c }}
                              />
                            )
                          )}
                        </div>
                        <span className="text-sm font-medium">{th.label}</span>
                        {active && <Check size={16} className="absolute right-3 top-3 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Accent colour */}
              <Section title={t("theme.accent")}>
                <div className="flex flex-wrap gap-3">
                  {ACCENTS.map((a) => {
                    const active = a.value.toLowerCase() === accent.toLowerCase();
                    return (
                      <button
                        key={a.value}
                        onClick={() => setAccent(a.value)}
                        aria-label={a.name}
                        title={a.name}
                        className={`grid h-9 w-9 place-items-center rounded-full transition-transform
                          hover:scale-110 ${active ? "ring-2 ring-offset-2 ring-offset-surface" : ""}`}
                        style={{ backgroundColor: a.value, "--tw-ring-color": a.value }}
                      >
                        {active && <Check size={16} color="#fff" />}
                      </button>
                    );
                  })}
                  <label
                    className="grid h-9 w-9 cursor-pointer place-items-center rounded-full
                      border border-dashed border-line text-xs text-muted hover:border-accent"
                    title={t("theme.customColor")}
                  >
                    <input
                      type="color"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      className="h-0 w-0 opacity-0"
                    />
                    +
                  </label>
                </div>
              </Section>

              {/* Notification sound */}
              <Section title={t("theme.sound")}>
                <p className="-mt-1 mb-2 text-xs text-muted">{t("theme.soundDesc")}</p>
                <div className="flex flex-wrap gap-2">
                  {SOUNDS.map((s) => {
                    const active = prefs.sound === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          updatePrefs({ sound: s.id });
                          playSound(s.id);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm
                          transition-colors ${
                            active ? "border-accent bg-accent/10 text-content" : "border-line text-muted hover:text-content"
                          }`}
                      >
                        {s.id !== "none" && <Volume2 size={13} />}
                        {t(s.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Comfort: reduce motion + haptics */}
              <Section title={t("theme.comfort")}>
                <div className="space-y-2">
                  <Toggle
                    on={reducedMotion}
                    onClick={toggleReducedMotion}
                    title={t("theme.reduceMotion")}
                    desc={t("theme.reduceMotionDesc")}
                  />
                  <Toggle
                    on={prefs.haptics}
                    onClick={() => updatePrefs({ haptics: !prefs.haptics })}
                    title={t("theme.haptics")}
                    desc={t("theme.hapticsDesc")}
                  />
                </div>
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-muted">{title}</h3>
      {children}
    </section>
  );
}

function Toggle({ on, onClick, title, desc }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-line
        bg-surface-2/40 px-4 py-3 text-left hover:bg-surface-2"
    >
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-accent" : "bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
