import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNotifications } from "../../lib/notifications/NotificationContext";

// Floating, dismissible badges. Stack at the bottom-right above everything.
export default function NotificationToasts() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
      <AnimatePresence>
        {toasts.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3
              overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-black/40"
          >
            <span
              className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: n.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{n.title}</p>
              <p className="text-sm text-muted">{n.message}</p>
            </div>
            <button
              onClick={() => dismissToast(n.id)}
              aria-label="Chiudi notifica"
              className="shrink-0 text-muted hover:text-content"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
