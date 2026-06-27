import { useCallback, useEffect, useRef, useState } from "react";
import {
  search as svcSearch,
  loadRecent,
  pushRecent,
  clearRecent as svcClearRecent,
} from "./placeService";

// One source of truth for the Find a Place widget + its expanded view.
// Debounced search over the mock service; the service is the swap point for the
// real Google Places API.
export function usePlace() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | empty
  const [selectedId, setSelectedId] = useState(null);
  const [recent, setRecent] = useState(loadRecent);
  const debounceRef = useRef(null);
  const seqRef = useRef(0);

  const runSearch = useCallback(async (q) => {
    const seq = ++seqRef.current;
    setStatus("loading");
    const list = await svcSearch(q);
    if (seq !== seqRef.current) return; // a newer search superseded this one
    setResults(list);
    setStatus(list.length ? "ready" : "empty");
    if (q.trim()) setRecent(pushRecent(q));
  }, []);

  // Debounce the live query; empty query clears back to idle.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      seqRef.current++; // cancel any in-flight search
      setResults([]);
      setStatus("idle");
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  const select = useCallback((id) => setSelectedId(id), []);

  const clearRecent = useCallback(() => setRecent(svcClearRecent()), []);

  const selected = results.find((p) => p.id === selectedId) ?? null;

  return {
    query,
    setQuery,
    results,
    status,
    selected,
    selectedId,
    select,
    recent,
    clearRecent,
  };
}
