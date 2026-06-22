import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "../../notifications/NotificationContext";
import { useI18n } from "../../i18n/LanguageContext";
import {
  loadSettings,
  saveSettings,
  loadTags,
  saveTags,
  loadTasks,
  saveTasks,
  loadSessions,
  saveSessions,
  todayStats,
  todayStr,
  uid,
  makeTask,
} from "./focusService";

// Phase -> translation key for its label.
const PHASE_KEY = {
  focus: "focus.phaseFocus",
  short: "focus.phaseShort",
  long: "focus.phaseLong",
};

export function useFocus() {
  const { addNotification } = useNotifications();
  const { t } = useI18n();
  const [settings, setSettings] = useState(loadSettings);
  const [tags, setTags] = useState(loadTags);
  const [tasks, setTasks] = useState(loadTasks);
  const [sessions, setSessions] = useState(loadSessions);

  // Tasks + tags are shared with the To-Do widget; re-sync on its changes.
  useEffect(() => {
    const sync = () => {
      setTasks(loadTasks());
      setTags(loadTags());
    };
    window.addEventListener("diverge:tasks", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("diverge:tasks", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // The To-Do widget can start a focus session on a specific task.
  useEffect(() => {
    const onStart = (e) => {
      const id = e.detail?.taskId ?? null;
      const task = loadTasks().find((t) => t.id === id) ?? null;
      setCurrentTaskId(id);
      setPhase("focus");
      setSecondsLeft(settings.focusMin * 60);
      setRunning(true);
      addNotification({
        title: t("focus.notifStartTitle"),
        message: task ? t("focus.notifStartTask", { task: task.title }) : t("focus.phaseFocus"),
        color: "#e864c4",
      });
    };
    window.addEventListener("diverge:focus-start", onStart);
    return () => window.removeEventListener("diverge:focus-start", onStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMin]);

  const [phase, setPhase] = useState("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMin * 60);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Pomodoros completed today (drives the long-break cadence).
  const [pomodoroCount, setPomodoroCount] = useState(
    () => loadSessions().filter((s) => s.date === todayStr()).length
  );

  const phaseSeconds = useCallback(
    (p) =>
      (p === "focus"
        ? settings.focusMin
        : p === "long"
          ? settings.longMin
          : settings.shortMin) * 60,
    [settings]
  );

  // Keep mutable refs for values the completion handler needs.
  const ref = useRef({});
  ref.current = { phase, currentTaskId, settings, tasks, sessions, pomodoroCount };

  const handleComplete = useCallback(() => {
    const { phase, currentTaskId, settings, tasks, sessions, pomodoroCount } =
      ref.current;

    if (phase === "focus") {
      const task = tasks.find((t) => t.id === currentTaskId) ?? null;
      const session = {
        id: uid(),
        taskId: task?.id ?? null,
        tagId: task?.tagId ?? null,
        date: todayStr(),
        minutes: settings.focusMin,
      };
      const newSessions = [...sessions, session];
      setSessions(newSessions);
      saveSessions(newSessions);

      if (task) {
        setTasks((list) => {
          const next = list.map((t) =>
            t.id === task.id ? { ...t, pomodoros: t.pomodoros + 1 } : t
          );
          saveTasks(next);
          return next;
        });
      }

      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      addNotification({
        title: t("focus.notifTitle"),
        message: task
          ? t("focus.notifTask", { task: task.title })
          : t("focus.notifGeneric"),
        color: "#e864c4",
      });
      const nextPhase = newCount % settings.longEvery === 0 ? "long" : "short";
      setPhase(nextPhase);
      setSecondsLeft(phaseSeconds(nextPhase));
      setRunning(settings.autoStart);
    } else {
      setPhase("focus");
      setSecondsLeft(settings.focusMin * 60);
      setRunning(settings.autoStart);
    }
  }, [phaseSeconds, addNotification, t]);

  // The 1-second tick.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Fire completion exactly once when the countdown reaches zero.
  const firedRef = useRef(false);
  useEffect(() => {
    if (secondsLeft > 0) {
      firedRef.current = false;
      return;
    }
    if (running && !firedRef.current) {
      firedRef.current = true;
      handleComplete();
    }
  }, [secondsLeft, running, handleComplete]);

  // --- timer controls ----------------------------------------------------

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(phaseSeconds(ref.current.phase));
  }, [phaseSeconds]);

  const skip = useCallback(() => {
    setRunning(false);
    setSecondsLeft(0);
    // Let the completion effect advance to the next phase.
    setTimeout(() => {
      firedRef.current = false;
      setRunning(true);
      setSecondsLeft(0);
    }, 0);
  }, []);

  const selectPhase = useCallback(
    (p) => {
      setRunning(false);
      setPhase(p);
      setSecondsLeft(phaseSeconds(p));
    },
    [phaseSeconds]
  );

  // --- settings ----------------------------------------------------------

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  // When idle on the focus phase, reflect a new focus duration immediately.
  useEffect(() => {
    if (!running && phase === "focus") {
      setSecondsLeft(settings.focusMin * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMin]);

  // --- tasks -------------------------------------------------------------

  const addTask = useCallback((title, tagId) => {
    if (!title.trim()) return;
    setTasks((list) => {
      const next = [...list, makeTask({ title: title.trim(), tagId })];
      saveTasks(next);
      return next;
    });
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((list) => {
      const next = list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      saveTasks(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback(
    (id) => {
      setTasks((list) => {
        const next = list.filter((t) => t.id !== id);
        saveTasks(next);
        return next;
      });
      if (currentTaskId === id) setCurrentTaskId(null);
    },
    [currentTaskId]
  );

  // --- tags --------------------------------------------------------------

  const addTag = useCallback((name, color) => {
    if (!name.trim()) return;
    setTags((list) => {
      const next = [...list, { id: uid(), name: name.trim(), color }];
      saveTags(next);
      return next;
    });
  }, []);

  const deleteTag = useCallback((id) => {
    setTags((list) => {
      const next = list.filter((t) => t.id !== id);
      saveTags(next);
      return next;
    });
    // Orphan tasks keep working (shown as "Senza tag").
    setTasks((list) => {
      const next = list.map((t) => (t.tagId === id ? { ...t, tagId: null } : t));
      saveTasks(next);
      return next;
    });
  }, []);

  const stats = useMemo(() => todayStats(sessions, tags), [sessions, tags]);
  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? null;

  return {
    // state
    settings,
    tags,
    tasks,
    phase,
    phaseLabel: t(PHASE_KEY[phase]),
    running,
    secondsLeft,
    pomodoroCount,
    currentTaskId,
    currentTask,
    stats,
    // timer
    start,
    pause,
    reset,
    skip,
    selectPhase,
    // data actions
    setCurrentTaskId,
    updateSettings,
    addTask,
    toggleTask,
    deleteTask,
    addTag,
    deleteTag,
  };
}
