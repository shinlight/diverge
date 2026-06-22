import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../supabase/client";
import {
  loadTasks,
  saveTasks,
  loadTags,
  saveTags,
  makeTask,
  chunkIt,
  chunkItAI,
  todayStr,
  uid,
} from "./tasksService";

// One source of truth for the To-Do widget + its expanded view.
export function useTasks() {
  const [tasks, setTasks] = useState(loadTasks);
  const [tags, setTags] = useState(loadTags);

  // Persistence runs in effects (never inside a setState updater — that would
  // be an impure update and double-fire under StrictMode). Guards skip the
  // first run and any change that came from an external sync.
  const firstTasks = useRef(true);
  const firstTags = useRef(true);
  const extTasks = useRef(false);
  const extTags = useRef(false);

  useEffect(() => {
    if (firstTasks.current) {
      firstTasks.current = false;
      return;
    }
    if (extTasks.current) {
      extTasks.current = false;
      return;
    }
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (firstTags.current) {
      firstTags.current = false;
      return;
    }
    if (extTags.current) {
      extTags.current = false;
      return;
    }
    saveTags(tags);
  }, [tags]);

  // Pick up changes made by other widgets (Focus, Cockpit) or other tabs.
  useEffect(() => {
    const sync = () => {
      extTasks.current = true;
      extTags.current = true;
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

  const commit = useCallback((updater) => setTasks(updater), []);
  const commitTags = useCallback((updater) => setTags(updater), []);

  // --- task CRUD ---------------------------------------------------------

  const addTask = useCallback(
    (data) => {
      if (!data?.title?.trim()) return null;
      const task = makeTask({ ...data, title: data.title.trim() });
      commit((list) => [task, ...list]);
      return task;
    },
    [commit]
  );

  const updateTask = useCallback(
    (id, patch) => commit((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [commit]
  );

  const removeTask = useCallback(
    (id) => commit((list) => list.filter((t) => t.id !== id)),
    [commit]
  );

  const toggleDone = useCallback(
    (id) =>
      commit((list) =>
        list.map((t) =>
          t.id === id
            ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null }
            : t
        )
      ),
    [commit]
  );

  // Big 3: max 3 tasks starred for *today* (resets daily via big3Date).
  const toggleBig3 = useCallback(
    (id) =>
      commit((list) => {
        const today = todayStr();
        const active = list.filter((t) => t.big3 && t.big3Date === today && !t.done);
        return list.map((t) => {
          if (t.id !== id) return t;
          const on = t.big3 && t.big3Date === today;
          if (!on && active.length >= 3) return t; // cap at 3
          return { ...t, big3: !on, big3Date: !on ? today : null };
        });
      }),
    [commit]
  );

  const setStatus = useCallback(
    (id, status) => updateTask(id, { status }),
    [updateTask]
  );

  // --- subtasks ----------------------------------------------------------

  const [chunkingIds, setChunkingIds] = useState(() => new Set());

  const chunkTask = useCallback(
    async (id) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      setChunkingIds((s) => new Set(s).add(id));
      try {
        let steps = null;
        if (isSupabaseConfigured && supabase) {
          try {
            const { data } = await supabase.auth.getSession();
            const jwt = data?.session?.access_token;
            if (jwt) steps = await chunkItAI(task.title, jwt);
          } catch {
            // fall back to heuristic
          }
        }
        if (!steps || !steps.length) steps = chunkIt(task.title);
        commit((list) =>
          list.map((t) =>
            t.id === id
              ? { ...t, subtasks: steps.map((title) => ({ id: uid(), title, done: false })) }
              : t
          )
        );
      } finally {
        setChunkingIds((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }
    },
    [tasks, commit]
  );

  const toggleSubtask = useCallback(
    (id, subId) =>
      commit((list) =>
        list.map((t) =>
          t.id === id
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subId ? { ...s, done: !s.done } : s
                ),
              }
            : t
        )
      ),
    [commit]
  );

  const addSubtask = useCallback(
    (id, title) => {
      if (!title?.trim()) return;
      commit((list) =>
        list.map((t) =>
          t.id === id
            ? { ...t, subtasks: [...t.subtasks, { id: uid(), title: title.trim(), done: false }] }
            : t
        )
      );
    },
    [commit]
  );

  const removeSubtask = useCallback(
    (id, subId) =>
      commit((list) =>
        list.map((t) =>
          t.id === id ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subId) } : t
        )
      ),
    [commit]
  );

  // --- tags (projects) ---------------------------------------------------

  const addTag = useCallback(
    (name, color) => {
      if (!name?.trim()) return null;
      const tag = { id: uid(), name: name.trim(), color };
      commitTags((list) => [...list, tag]);
      return tag;
    },
    [commitTags]
  );

  const removeTag = useCallback(
    (id) => {
      commitTags((list) => list.filter((t) => t.id !== id));
      commit((list) => list.map((t) => (t.tagId === id ? { ...t, tagId: null } : t)));
    },
    [commit, commitTags]
  );

  // Start a Pomodoro on a task — the Focus widget listens for this.
  const startPomodoro = useCallback((id) => {
    window.dispatchEvent(new CustomEvent("diverge:focus-start", { detail: { taskId: id } }));
  }, []);

  // --- spin: pick one actionable task, optionally matching an energy -----

  const spin = useCallback(
    (energy = null) => {
      const pool = tasks.filter(
        (t) => !t.done && t.status === "active" && (!energy || t.energy === energy)
      );
      if (pool.length === 0) return null;
      return pool[Math.floor(Math.random() * pool.length)].id;
    },
    [tasks]
  );

  // --- derived -----------------------------------------------------------

  const today = todayStr();
  const big3 = useMemo(
    () => tasks.filter((t) => t.big3 && t.big3Date === today && !t.done),
    [tasks, today]
  );
  const doneToday = useMemo(
    () => tasks.filter((t) => t.done && t.doneAt?.slice(0, 10) === today).length,
    [tasks, today]
  );
  const activeCount = useMemo(
    () => tasks.filter((t) => !t.done && t.status === "active").length,
    [tasks]
  );

  return {
    tasks,
    tags,
    big3,
    doneToday,
    activeCount,
    chunkingIds,
    addTask,
    updateTask,
    removeTask,
    toggleDone,
    toggleBig3,
    setStatus,
    chunkTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    addTag,
    removeTag,
    spin,
    startPomodoro,
  };
}
