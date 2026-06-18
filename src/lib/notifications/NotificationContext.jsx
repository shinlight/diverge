import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/*
  DiVerge — Notification system.

  Notifications live here. They show up in two places:
    - floating toasts (dismissible with X, auto-hide after a few seconds)
    - the bell panel next to the avatar (the full, grouped list)

  addNotification() is what widgets call to raise something
  (e.g. a completed Pomodoro). Seeded with a few items so the bell isn't empty.
*/

const NotificationContext = createContext(null);
const TOAST_MS = 6000;

let counter = 0;
const uid = () => `n${++counter}`;

function seed() {
  const now = Date.now();
  const mk = (minsAgo, n) => ({
    id: uid(),
    time: now - minsAgo * 60_000,
    read: false,
    toast: false, // seeded items go straight to the bell, no toast spam
    color: "#7c5cff",
    ...n,
  });
  return [
    mk(1, {
      title: "Gmail",
      message: "Hai 3 email non lette in arrivo.",
      color: "#ea4335",
    }),
    mk(8, {
      title: "Calendario",
      message: "Promemoria: Stand-up del team alle 10:00.",
      color: "#4285f4",
    }),
    mk(30, {
      title: "Benvenuto in DiVerge",
      message: "Rinomina i widget e scegli il tuo tema dal pannello 🎨.",
      color: "#7c5cff",
    }),
  ];
}

export function NotificationProvider({ children }) {
  const [items, setItems] = useState(seed);
  const timers = useRef({});

  const addNotification = useCallback((n) => {
    const id = uid();
    const item = {
      id,
      time: Date.now(),
      read: false,
      toast: true,
      color: "#7c5cff",
      ...n,
    };
    setItems((list) => [item, ...list]);
    timers.current[id] = setTimeout(() => {
      setItems((list) =>
        list.map((x) => (x.id === id ? { ...x, toast: false } : x))
      );
    }, TOAST_MS);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setItems((list) =>
      list.map((x) => (x.id === id ? { ...x, toast: false } : x))
    );
  }, []);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((x) => x.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((list) => list.map((x) => ({ ...x, read: true })));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const unreadCount = items.filter((x) => !x.read).length;
    const toasts = items.filter((x) => x.toast);
    return {
      items,
      toasts,
      unreadCount,
      addNotification,
      dismissToast,
      remove,
      markAllRead,
      clearAll,
    };
  }, [items, addNotification, dismissToast, remove, markAllRead, clearAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within <NotificationProvider>");
  return ctx;
}

// Compact relative time for the notification list.
export function notifTime(ts) {
  const min = Math.round((Date.now() - ts) / 60_000);
  if (min < 1) return "ora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} g`;
}
