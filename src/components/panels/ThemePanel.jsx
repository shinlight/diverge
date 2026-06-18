import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import { useTheme } from "../../lib/theme/ThemeContext";
import { THEMES, ACCENTS } from "../../lib/theme/themes";

export default function ThemePanel({ open, onClose }) {
  const {
    theme,
    accent,
    reducedMotion,
    setTheme,
    setAccent,
    toggleReducedMotion,
  } = useTheme();

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
                Personalizza
              </h2>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted
                  hover:bg-surface-2 hover:text-content"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {/* Themes */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-muted">Tema</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(THEMES).map(([key, t]) => {
                    const active = key === theme;
                    return (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`relative overflow-hidden rounded-2xl border p-3 text-left
                          transition-all ${
                            active
                              ? "border-accent ring-2 ring-accent/40"
                              : "border-line hover:border-muted"
                          }`}
                      >
                        <div className="mb-2 flex gap-1.5">
                          {[
                            t.colors["--color-bg"],
                            t.colors["--color-surface-2"],
                            t.colors["--color-content"],
                          ].map((c, i) => (
                            <span
                              key={i}
                              className="h-5 w-5 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{t.label}</span>
                        {active && (
                          <Check
                            size={16}
                            className="absolute right-3 top-3 text-accent"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Accent colour */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-muted">
                  Colore d'accento
                </h3>
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

                  {/* Free custom colour picker */}
                  <label
                    className="grid h-9 w-9 cursor-pointer place-items-center rounded-full
                      border border-dashed border-line text-xs text-muted hover:border-accent"
                    title="Colore personalizzato"
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
              </section>

              {/* Reduced motion */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-muted">Comfort</h3>
                <button
                  onClick={toggleReducedMotion}
                  className="flex w-full items-center justify-between rounded-2xl border
                    border-line bg-surface-2/40 px-4 py-3 text-left hover:bg-surface-2"
                >
                  <span>
                    <span className="block text-sm font-medium">
                      Riduci animazioni
                    </span>
                    <span className="block text-xs text-muted">
                      Movimenti più calmi, meno stimoli.
                    </span>
                  </span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      reducedMotion ? "bg-accent" : "bg-surface-2"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        reducedMotion ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </button>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
