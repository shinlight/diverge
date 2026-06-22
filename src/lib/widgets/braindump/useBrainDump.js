import { useCallback, useEffect, useRef, useState } from "react";
import { loadDump, saveDump, uid } from "./braindumpService";
import { pushTask } from "../tasks/tasksService";

// One source of truth for the Brain Dump widget + its expanded view.
export function useBrainDump() {
  const [items, setItems] = useState(loadDump);

  // Persist in an effect (never a side-effect inside an updater) + skip first
  // run and external syncs.
  const first = useRef(true);
  const ext = useRef(false);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (ext.current) {
      ext.current = false;
      return;
    }
    saveDump(items);
  }, [items]);

  useEffect(() => {
    const sync = () => {
      ext.current = true;
      setItems(loadDump());
    };
    window.addEventListener("diverge:braindump", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("diverge:braindump", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((text) => {
    if (!text?.trim()) return;
    setItems((list) => [
      { id: uid(), text: text.trim(), createdAt: new Date().toISOString() },
      ...list,
    ]);
  }, []);

  const remove = useCallback(
    (id) => setItems((list) => list.filter((x) => x.id !== id)),
    []
  );

  const clear = useCallback(() => setItems([]), []);

  // Move a thought into the To-Do (Inbox), removing it from the dump.
  const toTask = useCallback(
    (id) => {
      const item = items.find((x) => x.id === id);
      if (!item) return;
      pushTask({ title: item.text }); // side-effect OUTSIDE the updater
      setItems((list) => list.filter((x) => x.id !== id));
    },
    [items]
  );

  return { items, add, remove, clear, toTask };
}
