import { useCallback, useEffect, useState } from "react";
import { loadHistory, saveHistory, MAX_ITEMS, uid } from "./clipboardService";

export function useClipboard() {
  const [items, setItems] = useState(loadHistory);

  useEffect(() => {
    saveHistory(items);
  }, [items]);

  const add = useCallback((text) => {
    const value = (text ?? "").trim();
    if (!value) return false;
    let ok = false;
    setItems((list) => {
      if (list[0]?.text === value) return list; // skip consecutive duplicate
      ok = true;
      return [{ id: uid(), text: value, time: Date.now() }, ...list].slice(
        0,
        MAX_ITEMS
      );
    });
    return ok;
  }, []);

  // Read the system clipboard and store it.
  const grab = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      return add(text) ? "ok" : "empty";
    } catch {
      return "error";
    }
  }, [add]);

  // Copy a stored snippet back to the system clipboard.
  const copyTo = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, max: MAX_ITEMS, add, grab, copyTo, remove, clear };
}
