import { useCallback, useEffect, useRef, useState } from "react";
import { loadHabits, saveHabits, todayKey, isDoneToday, uid } from "./habitsService";

// One source of truth for the Habits widget + its expanded view.
export function useHabits() {
  const [habits, setHabits] = useState(loadHabits);

  // Persist in an effect (never inside an updater) + skip the first run.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveHabits(habits);
  }, [habits]);

  const toggleToday = useCallback((id) => {
    const key = todayKey();
    setHabits((list) =>
      list.map((h) =>
        h.id === id
          ? {
              ...h,
              history: h.history.includes(key)
                ? h.history.filter((d) => d !== key)
                : [...h.history, key],
            }
          : h
      )
    );
  }, []);

  const add = useCallback((name, emoji = "✅") => {
    if (!name?.trim()) return;
    setHabits((list) => [...list, { id: uid(), name: name.trim(), emoji, history: [] }]);
  }, []);

  const remove = useCallback((id) => setHabits((list) => list.filter((h) => h.id !== id)), []);

  const doneToday = habits.filter(isDoneToday).length;

  return { habits, toggleToday, add, remove, doneToday, total: habits.length };
}
