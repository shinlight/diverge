import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchNextEvent } from "../widgets/calendar/calendarService";
import { fetchUnreadCount } from "../widgets/gmail/gmailService";
import { loadCache } from "../widgets/weather/weatherService";
import { loadTasks, loadTags, todayStr } from "../widgets/tasks/tasksService";

// The next few undone tasks (Big 3 of today first), joined with their tag colour.
function upcomingTasks(limit = 3) {
  const tags = loadTags();
  const today = todayStr();
  const rank = (t) => (t.big3 && t.big3Date === today ? 0 : 1);
  return loadTasks()
    .filter((t) => !t.done && t.status !== "someday")
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      title: t.title,
      color: tags.find((g) => g.id === t.tagId)?.color ?? "#9aa0ad",
    }));
}

// One light data source for the Cockpit. Uses *minimal* Google calls (a single
// next-event + the INBOX unread count) so it never duplicates the heavy widget
// fetches. Local cells (date, tasks, weather) read from storage.
export function useCockpit() {
  const { googleToken, refreshGoogleToken } = useAuth();

  const [now, setNow] = useState(() => new Date());
  const [nextEvent, setNextEvent] = useState(null);
  const [unread, setUnread] = useState(null);
  const [google, setGoogle] = useState("idle"); // idle | loading | ready | off
  const [weather, setWeather] = useState(() => loadCache()?.data ?? null);
  const [tasks, setTasks] = useState(() => upcomingTasks());

  // Clock tick (every 30s keeps the time + countdown fresh enough).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const loadGoogle = useCallback(
    async (token = googleToken) => {
      if (!token) {
        setGoogle("off");
        return;
      }
      setGoogle("loading");
      try {
        const [ev, un] = await Promise.all([
          fetchNextEvent(token),
          fetchUnreadCount(token),
        ]);
        setNextEvent(ev);
        setUnread(un);
        setGoogle("ready");
      } catch (e) {
        if (e?.code === 401) {
          const fresh = await refreshGoogleToken?.();
          if (fresh) return loadGoogle(fresh);
        }
        setGoogle("off"); // 403 (scope missing) or network error → stay quiet
      }
    },
    [googleToken, refreshGoogleToken]
  );

  // Fetch on mount / token change, then refresh every 5 minutes.
  useEffect(() => {
    loadGoogle();
    const id = setInterval(() => loadGoogle(), 5 * 60_000);
    return () => clearInterval(id);
  }, [loadGoogle]);

  // Keep local cells in sync with the widgets (same-tab + cross-tab).
  useEffect(() => {
    const syncTasks = () => setTasks(upcomingTasks());
    const syncWeather = () => setWeather(loadCache()?.data ?? null);
    window.addEventListener("diverge:tasks", syncTasks);
    window.addEventListener("storage", syncTasks);
    window.addEventListener("storage", syncWeather);
    return () => {
      window.removeEventListener("diverge:tasks", syncTasks);
      window.removeEventListener("storage", syncTasks);
      window.removeEventListener("storage", syncWeather);
    };
  }, []);

  return { now, nextEvent, unread, google, weather, tasks };
}
