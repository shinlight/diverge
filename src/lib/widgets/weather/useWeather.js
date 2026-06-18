import { useCallback, useState } from "react";
import {
  getPosition,
  fetchWeather,
  loadCache,
  saveCache,
} from "./weatherService";

// status: idle | locating | loading | ready | error | denied
export function useWeather() {
  const [state, setState] = useState(() => {
    const cached = loadCache();
    if (cached?.data && cached?.coords) {
      return { status: "ready", coords: cached.coords, data: cached.data };
    }
    return { status: "idle", coords: null, data: null };
  });

  const loadFor = useCallback(async (coords) => {
    setState((s) => ({ ...s, status: "loading", coords }));
    try {
      const data = await fetchWeather(coords.lat, coords.lon);
      const next = { status: "ready", coords, data };
      setState(next);
      saveCache({ coords, data });
    } catch {
      setState((s) => ({ ...s, status: "error" }));
    }
  }, []);

  const locate = useCallback(async () => {
    setState((s) => ({ ...s, status: "locating" }));
    try {
      const coords = await getPosition();
      await loadFor(coords);
    } catch (err) {
      setState((s) => ({
        ...s,
        status: err && err.code === 1 ? "denied" : "error",
      }));
    }
  }, [loadFor]);

  const refresh = useCallback(() => {
    if (state.coords) loadFor(state.coords);
    else locate();
  }, [state.coords, loadFor, locate]);

  return { ...state, locate, refresh };
}
