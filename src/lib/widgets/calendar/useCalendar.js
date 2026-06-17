import { useCallback, useEffect, useState } from "react";
import {
  isConnected,
  connect as svcConnect,
  fetchEvents,
  createEvent as svcCreate,
  updateEvent as svcUpdate,
  deleteEvent as svcDelete,
} from "./calendarService";

// One source of truth for the Calendar widget + its focus view.
export function useCalendar() {
  const [connected, setConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      setEvents(await fetchEvents());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (connected) refresh();
  }, [connected, refresh]);

  const connect = useCallback(async () => {
    setConnecting(true);
    await svcConnect();
    setConnecting(false);
    setConnected(true);
  }, []);

  const create = useCallback(async (data) => {
    const created = await svcCreate(data);
    setEvents((list) =>
      [...list, created].sort((a, b) => new Date(a.start) - new Date(b.start))
    );
    return created;
  }, []);

  const update = useCallback(async (id, patch) => {
    const updated = await svcUpdate(id, patch);
    setEvents((list) =>
      list
        .map((e) => (e.id === id ? { ...e, ...patch } : e))
        .sort((a, b) => new Date(a.start) - new Date(b.start))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await svcDelete(id);
    setEvents((list) => list.filter((e) => e.id !== id));
  }, []);

  // Events that haven't ended yet, soonest first.
  const upcoming = events.filter((e) => new Date(e.end) >= new Date());

  return {
    connected,
    connecting,
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
