import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchNextEvent } from "../widgets/calendar/calendarService";
import { fetchUnreadCount } from "../widgets/gmail/gmailService";
import { loadCache } from "../widgets/weather/weatherService";
import { loadTasks, loadTags, todayStr } from "../widgets/tasks/tasksService";
import { loadHabits, isDoneToday, computeStreak } from "../widgets/habits/habitsService";
import { loadSessions, todayStats } from "../widgets/focus/focusService";

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

// Today's habits recap: how many are checked off / total, plus the best
// running streak across them (the dopamine number worth surfacing).
function habitsSummary() {
  const list = loadHabits();
  return {
    done: list.filter(isDoneToday).length,
    total: list.length,
    streak: list.reduce((max, h) => Math.max(max, computeStreak(h.history)), 0),
  };
}

// Today's focus recap: completed pomodoros + total focused minutes.
function focusSummary() {
  const { count, minutes } = todayStats(loadSessions(), []);
  return { count, minutes };
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
  const [habits, setHabits] = useState(() => habitsSummary());
  const [focus, setFocus] = useState(() => focusSummary());

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
    const syncHabits = () => setHabits(habitsSummary());
    const syncFocus = () => setFocus(focusSummary());
    // "storage" fires cross-tab only; the custom events keep us fresh same-tab.
    window.addEventListener("diverge:tasks", syncTasks);
    window.addEventListener("diverge:habits", syncHabits);
    window.addEventListener("diverge:focus", syncFocus);
    window.addEventListener("storage", syncTasks);
    window.addEventListener("storage", syncWeather);
    window.addEventListener("storage", syncHabits);
    window.addEventListener("storage", syncFocus);
    return () => {
      window.removeEventListener("diverge:tasks", syncTasks);
      window.removeEventListener("diverge:habits", syncHabits);
      window.removeEventListener("diverge:focus", syncFocus);
      window.removeEventListener("storage", syncTasks);
      window.removeEventListener("storage", syncWeather);
      window.removeEventListener("storage", syncHabits);
      window.removeEventListener("storage", syncFocus);
    };
  }, []);

  return { now, nextEvent, unread, google, weather, tasks, habits, focus };
}
