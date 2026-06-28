import { useCallback, useEffect, useRef, useState } from "react";
import { loadEntries, saveEntries, uid } from "./moodService";

// One source of truth for the Mood & Energy widget + its expanded view.
export function useMood() {
  const [entries, setEntries] = useState(loadEntries);

  // Persist in an effect (never inside an updater) + skip the first run.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveEntries(entries);
  }, [entries]);

  // Newest first.
  const sorted = [...entries].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const latest = sorted[0] ?? null;

  const addEntry = useCallback(({ mood, energy = null, note = "" }) => {
    if (!mood) return;
    setEntries((list) => [
      { id: uid(), mood, energy, note: note.trim(), ts: new Date().toISOString() },
      ...list,
    ]);
  }, []);

  const remove = useCallback((id) => setEntries((list) => list.filter((e) => e.id !== id)), []);

  // Oldest → newest, last 7 entries, for a tiny trend.
  const trend = sorted.slice(0, 7).reverse();

  return { entries: sorted, latest, trend, addEntry, remove };
}
