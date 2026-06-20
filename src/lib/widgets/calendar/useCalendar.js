import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  isConnected,
  connect as svcConnect,
  fetchEvents,
  fetchGoogleEvents,
  fetchCalendarList,
  createEvent as svcCreate,
  updateEvent as svcUpdate,
  deleteEvent as svcDelete,
} from "./calendarService";

// Read-only Google Calendar scope for the MVP.
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

// One source of truth for the Calendar widget + its focus view.
// - Real mode: a Google token is present → read the user's real calendars.
// - Mock mode (no Supabase, local dev): the in-memory demo calendar.
export function useCalendar() {
  const { supabaseReady, googleToken, connectGoogle, clearGoogleToken, refreshGoogleToken, user } =
    useAuth();
  const realMode = Boolean(googleToken);

  const [mockConnected, setMockConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // Multi-calendar: the list the user can access + which ids are shown.
  // selectedIds === null means "not initialised yet" (calendar list loading).
  const [calendars, setCalendars] = useState([]);
  const [selectedIds, setSelectedIds] = useState(null);

  // Remember the selection per user (no backend yet).
  const storageKey = useMemo(
    () => `diverge.calendar.selected.${user?.id ?? "anon"}`,
    [user?.id]
  );

  // With Supabase, the only path to "connected" is a real Google token.
  const connected = supabaseReady ? realMode : mockConnected;

  // Load the calendar list once we have a real token, then seed the selection
  // from storage (or from what Google itself marks as shown).
  useEffect(() => {
    if (!realMode) {
      setCalendars([]);
      setSelectedIds(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCalendarList(googleToken);
        if (cancelled) return;
        setCalendars(list);
        const available = new Set(list.map((c) => c.id));
        const defaults = list.filter((c) => c.selected).map((c) => c.id);
        let stored = null;
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) stored = JSON.parse(raw);
        } catch {
          // ignore
        }
        const fromStore = Array.isArray(stored)
          ? stored.filter((id) => available.has(id))
          : null;
        setSelectedIds(fromStore && fromStore.length ? fromStore : defaults);
      } catch (e) {
        if (e?.code === 401 || e?.code === 403) {
          // Token expired → try a silent refresh; if that fails, disconnect.
          const fresh = await refreshGoogleToken?.();
          if (!fresh) clearGoogleToken();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [realMode, googleToken, storageKey, clearGoogleToken, refreshGoogleToken]);

  const refresh = useCallback(async () => {
    if (realMode && selectedIds == null) {
      setStatus("loading"); // still fetching the calendar list
      return;
    }
    setStatus("loading");
    try {
      if (realMode) {
        const selCals = calendars.filter((c) => selectedIds.includes(c.id));
        setEvents(
          selCals.length ? await fetchGoogleEvents(googleToken, selCals) : []
        );
      } else {
        setEvents(await fetchEvents());
      }
      setStatus("ready");
    } catch (e) {
      if (e?.code === 401 || e?.code === 403) {
        // Try a silent token refresh; success re-runs this via googleToken dep.
        const fresh = await refreshGoogleToken?.();
        if (fresh) return;
        clearGoogleToken();
      }
      setStatus("error");
    }
  }, [realMode, googleToken, selectedIds, calendars, clearGoogleToken, refreshGoogleToken]);

  useEffect(() => {
    if (connected) refresh();
  }, [connected, refresh]);

  // Toggle a calendar on/off, persist the choice, and re-fetch (via refresh dep).
  const toggleCalendar = useCallback(
    (id) => {
      setSelectedIds((prev) => {
        const base = prev ?? [];
        const next = base.includes(id)
          ? base.filter((x) => x !== id)
          : [...base, id];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  const connect = useCallback(async () => {
    if (supabaseReady) {
      setConnecting(true);
      await connectGoogle(CALENDAR_SCOPE); // redirects to Google
      setConnecting(false);
      return;
    }
    setConnecting(true);
    await svcConnect();
    setConnecting(false);
    setMockConnected(true);
  }, [supabaseReady, connectGoogle]);

  const create = useCallback(
    async (data) => {
      if (realMode) return null; // read-only in the Google MVP
      const created = await svcCreate(data);
      setEvents((list) =>
        [...list, created].sort((a, b) => new Date(a.start) - new Date(b.start))
      );
      return created;
    },
    [realMode]
  );

  const update = useCallback(
    async (id, patch) => {
      if (realMode) return null;
      const updated = await svcUpdate(id, patch);
      setEvents((list) =>
        list
          .map((e) => (e.id === id ? { ...e, ...patch } : e))
          .sort((a, b) => new Date(a.start) - new Date(b.start))
      );
      return updated;
    },
    [realMode]
  );

  const remove = useCallback(
    async (id) => {
      if (realMode) return;
      await svcDelete(id);
      setEvents((list) => list.filter((e) => e.id !== id));
    },
    [realMode]
  );

  // Events that haven't ended yet, soonest first.
  const upcoming = events.filter((e) => new Date(e.end) >= new Date());

  return {
    connected,
    connecting,
    realMode, // true → reading the real Google calendars (read-only)
    status,
    events,
    upcoming,
    calendars, // [{ id, name, color, primary, accessRole, selected }]
    selectedIds, // ids currently shown (null while loading)
    toggleCalendar,
    connect,
    refresh,
    create,
    update,
    remove,
  };
}
