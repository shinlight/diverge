import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Trash2 } from "lucide-react";
import {
  useNotifications,
  notifTime,
} from "../../lib/notifications/NotificationContext";
import { useI18n } from "../../lib/i18n/LanguageContext";

export default function NotificationsBell() {
  const { items, unreadCount, remove, markAllRead, clearAll } =
    useNotifications();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        aria-label={t("notifications.title")}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-muted
          transition-colors hover:bg-surface-2/60 hover:text-content"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center
              rounded-full bg-accent px-1 text-[10px] font-bold text-accent-contrast"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl
                border border-line bg-surface shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="text-sm font-semibold">{t("notifications.title")}</h3>
                {items.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs text-muted hover:text-content"
                  >
                    <Trash2 size={13} /> {t("notifications.clearAll")}
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">
                  {t("notifications.empty")}
                </p>
              ) : (
                <ul className="max-h-96 overflow-y-auto">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className="group flex items-start gap-3 border-b border-line/60 px-4 py-3
                        last:border-0 hover:bg-surface-2/40"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: n.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {n.title}
                          </span>
                          <span className="shrink-0 text-xs text-muted">
                            {notifTime(n.time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted">{n.message}</p>
                      </div>
                      <button
                        onClick={() => remove(n.id)}
                        aria-label={t("common.delete")}
                        className="shrink-0 text-muted opacity-0 transition-opacity
                          hover:text-content group-hover:opacity-100"
                      >
                        <X size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
