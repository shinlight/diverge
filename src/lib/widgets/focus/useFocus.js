import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "../../notifications/NotificationContext";
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
} from "./focusService";

// Phases of the Pomodoro cycle.
const PHASES = {
  focus: { label: "Concentrazione", key: "focus" },
  short: { label: "Pausa breve", key: "short" },
  long: { label: "Pausa lunga", key: "long" },
};

export function useFocus() {
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState(loadSettings);
  const [tags, setTags] = useState(loadTags);
  const [tasks, setTasks] = useState(loadTasks);
  const [sessions, setSessions] = useState(loadSessions);

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
        title: "Pomodoro completato 🍅",
        message: task ? `+1 su "${task.title}"` : "Ottimo lavoro, fai una pausa!",
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
  }, [phaseSeconds, addNotification]);

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
      const next = [
        ...list,
        { id: uid(), title: title.trim(), tagId, done: false, pomodoros: 0 },
      ];
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
    phaseLabel: PHASES[phase].label,
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
