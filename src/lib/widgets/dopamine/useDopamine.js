import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadActivities,
  saveActivities,
  loadDone,
  saveDone,
  pickRandom,
  uid,
} from "./dopamineService";

// One source of truth for the Dopamine Menu widget + its expanded view.
export function useDopamine() {
  const [activities, setActivities] = useState(loadActivities);
  const [doneToday, setDoneToday] = useState(loadDone);
  const [filter, setFilter] = useState("all"); // all | low | med | high
  const [suggestion, setSuggestion] = useState(() => pickRandom(loadActivities(), "all"));

  // Persist list (effect, not in updater) + skip first run.
  const firstList = useRef(true);
  useEffect(() => {
    if (firstList.current) {
      firstList.current = false;
      return;
    }
    saveActivities(activities);
  }, [activities]);

  const firstDone = useRef(true);
  useEffect(() => {
    if (firstDone.current) {
      firstDone.current = false;
      return;
    }
    saveDone(doneToday);
  }, [doneToday]);

  const shuffle = useCallback(
    (energy = filter) => {
      setFilter(energy);
      setSuggestion(pickRandom(activities, energy));
    },
    [activities, filter]
  );

  const choose = useCallback((activity) => setSuggestion(activity), []);

  const markDone = useCallback(() => {
    setDoneToday((n) => n + 1);
    setSuggestion(pickRandom(activities, filter));
  }, [activities, filter]);

  const add = useCallback((label, emoji = "✨", energy = "med", minutes = 3) => {
    if (!label?.trim()) return;
    setActivities((list) => [...list, { id: uid(), label: label.trim(), emoji, energy, minutes }]);
  }, []);

  const remove = useCallback(
    (id) => {
      const next = activities.filter((a) => a.id !== id);
      setActivities(next);
      setSuggestion((s) => (s?.id === id ? pickRandom(next, "all") : s));
    },
    [activities]
  );

  return { activities, suggestion, filter, doneToday, setFilter, shuffle, choose, markDone, add, remove };
}
