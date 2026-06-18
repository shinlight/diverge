import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { WIDGET_LIST } from "../../lib/widgets/registry";

export default function AddWidgetSheet({ open, onClose, layout, onAdd }) {
  // Multi-instance widgets (AI) stay available so you can add several.
  const available = WIDGET_LIST.filter(
    (w) => w.multiInstance || !layout.includes(w.id)
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-lg rounded-t-3xl border border-line
              bg-surface p-6 sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Aggiungi un widget</h2>
                <p className="text-sm text-muted">
                  Scegli cosa tenere sotto controllo.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted
                  hover:bg-surface-2 hover:text-content"
              >
                <X size={18} />
              </button>
            </div>

            {available.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Hai già aggiunto tutti i widget disponibili. 🎉
              </p>
            ) : (
              <div className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {available.map((w) => {
                  const Icon = w.icon;
                  return (
                    <button
                      key={w.id}
                      onClick={() => onAdd(w.id)}
                      className="flex items-center gap-3 rounded-2xl border border-line
                        bg-surface-2/40 p-3 text-left transition-colors
                        hover:border-accent hover:bg-surface-2"
                    >
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                        style={{
                          backgroundColor: `${w.accent}1a`,
                          color: w.accent,
                        }}
                      >
                        <Icon size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {w.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {w.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
