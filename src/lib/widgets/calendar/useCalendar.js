import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  isConnected,
  connect as svcConnect,
  fetchEvents,
  fetchGoogleEvents,
  createEvent as svcCreate,
  updateEvent as svcUpdate,
  deleteEvent as svcDelete,
} from "./calendarService";

// Read-only Google Calendar scope for the MVP.
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

// One source of truth for the Calendar widget + its focus view.
// - Real mode: a Google token is present → read the user's real calendar.
// - Mock mode (no Supabase, local dev): the in-memory demo calendar.
export function useCalendar() {
  const { supabaseReady, googleToken, connectGoogle, clearGoogleToken } = useAuth();
  const realMode = Boolean(googleToken);

  const [mockConnected, setMockConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // With Supabase, the only path to "connected" is a real Google token.
  const connected = supabaseReady ? realMode : mockConnected;

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      setEvents(realMode ? await fetchGoogleEvents(googleToken) : await fetchEvents());
      setStatus("ready");
    } catch (e) {
      if (e?.code === 401 || e?.code === 403) clearGoogleToken();
      setStatus("error");
    }
  }, [realMode, googleToken, clearGoogleToken]);

  useEffect(() => {
    if (connected) refresh();
  }, [connected, refresh]);

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
    realMode, // true → reading the real Google calendar (read-only)
    status,
    events,
    upcoming,
    connect,
    refresh,
    create,
    update,
    remove,
  };
}
