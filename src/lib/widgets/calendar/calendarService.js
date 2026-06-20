/*
  DiVerge — Google Calendar service (interactive).

  In-memory agenda seeded with realistic events so the widget is fully
  operative (view / create / edit / reschedule / delete) without Google setup.

  PHASE 3 (real Calendar) — replace each body with a Calendar API call:
    connect()       -> Google OAuth token, scope:
                       "https://www.googleapis.com/auth/calendar.events"
    fetchEvents()   -> GET /calendar/v3/calendars/primary/events?timeMin=...&singleEvents=true&orderBy=startTime
    createEvent()   -> POST /calendars/primary/events
    updateEvent()   -> PATCH /calendars/primary/events/{id}   (also handles "move"/reschedule)
    deleteEvent()   -> DELETE /calendars/primary/events/{id}

  The widget UI never changes — only this file does.
*/

import { translate } from "../../i18n/translations";

const CONNECT_KEY = "diverge.calendar.connected";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const COLORS = ["#4285f4", "#2fb380", "#f0a132", "#e864c4", "#7c5cff", "#ff6b6b"];

let events = seedEvents();
let nextId = 100;

function at(dayOffset, hour, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function seedEvents() {
  return [
    {
      id: "e1",
      title: "Stand-up del team",
      start: at(0, 10, 0),
      end: at(0, 10, 15),
      location: "Google Meet",
      notes: "Avanzamenti, obiettivi, blocchi.",
      color: COLORS[0],
    },
    {
      id: "e2",
      title: "Pranzo con Luca",
      start: at(0, 13, 0),
      end: at(0, 14, 0),
      location: "Trattoria da Mario",
      notes: "",
      color: COLORS[1],
    },
    {
      id: "e3",
      title: "Sessione focus: DiVerge",
      start: at(0, 16, 0),
      end: at(0, 17, 30),
      location: "",
      notes: "Widget Calendar.",
      color: COLORS[4],
    },
    {
      id: "e4",
      title: "Dentista",
      start: at(1, 9, 30),
      end: at(1, 10, 30),
      location: "Studio Bianchi",
      notes: "Controllo annuale.",
      color: COLORS[2],
    },
    {
      id: "e5",
      title: "Review design",
      start: at(1, 15, 0),
      end: at(1, 16, 0),
      location: "Figma + Meet",
      notes: "Revisione modalità focus.",
      color: COLORS[3],
    },
    {
      id: "e6",
      title: "Palestra",
      start: at(2, 18, 0),
      end: at(2, 19, 0),
      location: "",
      notes: "",
      color: COLORS[1],
    },
    {
      id: "e7",
      title: "Call con cliente",
      start: at(3, 11, 0),
      end: at(3, 11, 45),
      location: "Zoom",
      notes: "Presentazione roadmap.",
      color: COLORS[0],
    },
  ];
}

// --- public API ----------------------------------------------------------

export function isConnected() {
  return localStorage.getItem(CONNECT_KEY) === "true";
}

export async function connect() {
  await delay(900); // Phase 3: real Google OAuth token request.
  localStorage.setItem(CONNECT_KEY, "true");
  return true;
}

export function disconnect() {
  localStorage.removeItem(CONNECT_KEY);
}

export async function fetchEvents() {
  await delay(600);
  return events
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .map((e) => ({ ...e }));
}

export async function createEvent(data) {
  await delay(400);
  const event = {
    id: `e${nextId++}`,
    title: data.title?.trim() || "(Senza titolo)",
    start: data.start,
    end: data.end,
    location: data.location ?? "",
    notes: data.notes ?? "",
    color: data.color ?? COLORS[(nextId + 2) % COLORS.length],
  };
  events.push(event);
  return { ...event };
}

// Handles both edit and reschedule (just pass new start/end).
export async function updateEvent(id, patch) {
  await delay(300);
  const e = events.find((x) => x.id === id);
  if (e) Object.assign(e, patch);
  return e ? { ...e } : null;
}

export async function deleteEvent(id) {
  await delay(300);
  events = events.filter((x) => x.id !== id);
}

// --- date helpers --------------------------------------------------------

export const EVENT_COLORS = COLORS;

// Real Google Calendar read (MVP, read-only). Maps to our event shape.
// `token` is the Google OAuth access token (from the Supabase session).
const GCAL = "https://www.googleapis.com/calendar/v3";
export async function fetchGoogleEvents(token) {
  // Window wide enough to browse a bit of past + a couple of months ahead,
  // so the day navigation can step backward/forward without re-fetching.
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 90);
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: "250",
  });
  const res = await fetch(`${GCAL}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) {
    const err = new Error("auth");
    err.code = res.status;
    throw err;
  }
  if (!res.ok) throw new Error("google calendar request failed");
  const j = await res.json();
  // Skip the noise Google injects into the primary feed: contact birthdays
  // and "working location" all-day markers. Keep real events, focus time, OOO.
  const SKIP_TYPES = new Set(["birthday", "workingLocation"]);
  return (j.items || [])
    .filter((e) => e.start && (e.start.dateTime || e.start.date))
    .filter((e) => !SKIP_TYPES.has(e.eventType))
    .map((e, i) => {
      const start = e.start.dateTime || e.start.date;
      const end = e.end?.dateTime || e.end?.date || start;
      return {
        id: e.id,
        title: e.summary || "(no title)",
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        location: e.location || "",
        notes: e.description || "",
        color: COLORS[i % COLORS.length],
        link: e.htmlLink || null, // deep link to the event in Google Calendar
      };
    });
}

const locale = (lang) => (lang === "it" ? "it-IT" : "en-US");

// "10:00 – 10:15"
export function timeRange(startIso, endIso, lang = "en") {
  const opts = { hour: "2-digit", minute: "2-digit" };
  const s = new Date(startIso).toLocaleTimeString(locale(lang), opts);
  const e = new Date(endIso).toLocaleTimeString(locale(lang), opts);
  return `${s} – ${e}`;
}

// "Today", "Tomorrow", else "Thu 19 Jun"
export function dayLabel(iso, lang = "en") {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((startOf(d) - startOf(today)) / 86_400_000);
  if (diffDays === 0) return translate(lang, "calendar.today");
  if (diffDays === 1) return translate(lang, "calendar.tomorrow");
  if (diffDays === -1) return translate(lang, "calendar.yesterday");
  return d.toLocaleDateString(locale(lang), {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// True if an ISO timestamp falls on the same calendar day as `date`.
export function isSameDay(iso, date) {
  const d = new Date(iso);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

// A new Date shifted by `n` days (n can be negative), at the same time.
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// "Today" / "Tomorrow" / "Yesterday" / "Wed 18 Jun" for a Date (not ISO).
export function fullDayLabel(date, lang = "en") {
  return dayLabel(date.toISOString(), lang);
}

// Group a sorted event list into [{ key, label, events }] by calendar day.
export function groupByDay(list, lang = "en") {
  const groups = new Map();
  for (const ev of list) {
    const d = new Date(ev.start);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!groups.has(key))
      groups.set(key, { key, label: dayLabel(ev.start, lang), events: [] });
    groups.get(key).events.push(ev);
  }
  return [...groups.values()];
}

// ISO -> value for <input type="datetime-local"> (local time)
export function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// datetime-local value -> ISO
export function fromLocalInput(value) {
  return new Date(value).toISOString();
}

// A sensible default new event: next round hour, 1h long.
export function defaultNewEvent() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    title: "",
    start: start.toISOString(),
    end: end.toISOString(),
    location: "",
    notes: "",
    color: COLORS[0],
  };
}
