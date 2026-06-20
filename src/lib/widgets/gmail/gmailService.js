/*
  DiVerge — Gmail service (interactive).

  This is the ONLY file the Gmail widget talks to. Today it runs a small
  in-memory inbox seeded with realistic sample data, so the widget is fully
  interactive (open / read / mark read / delete / send) without any Google setup.

  PHASE 3 (real Gmail) — replace each function body with a Gmail REST call:
    connect()        -> Google Identity Services token, scope:
                        "https://www.googleapis.com/auth/gmail.modify"
    fetchMessages()  -> GET /gmail/v1/users/me/messages?labelIds=INBOX ... + metadata
    getMessage(id)   -> GET /gmail/v1/users/me/messages/{id}?format=full
    markRead(id)     -> POST /messages/{id}/modify {removeLabelIds:["UNREAD"]}
    deleteMessage()  -> POST /messages/{id}/trash
    sendMessage()    -> POST /messages/send  (base64url RFC-822 body)

  The widget UI never changes — only this file does.
*/

const CONNECT_KEY = "diverge.gmail.connected";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// --- in-memory inbox (seeded once) --------------------------------------

let inbox = seedInbox();

function seedInbox() {
  return [
    {
      id: "m1",
      from: "Google Calendar",
      email: "calendar-noreply@google.com",
      subject: "Promemoria: Stand-up del team alle 10:00",
      snippet:
        "Hai un evento tra 30 minuti. Riunione giornaliera con il team di prodotto…",
      body: `Ciao,

questo è un promemoria per il tuo prossimo evento.

📅 Stand-up del team di prodotto
🕙 Oggi, 10:00 – 10:15
📍 Google Meet

Ordine del giorno:
• Avanzamenti di ieri
• Obiettivi di oggi
• Eventuali blocchi

A presto,
Google Calendar`,
      date: minutesAgo(8),
      unread: true,
      starred: false,
    },
    {
      id: "m2",
      from: "GitHub",
      email: "notifications@github.com",
      subject: "[DiVerge] La build è passata ✓",
      snippet:
        "Il workflow CI per il commit 208cd80 è stato completato con successo.",
      body: `Buone notizie!

Il workflow di Continuous Integration per il repository DiVerge è stato completato con successo.

Commit: 208cd80 — "Initial commit: setup app React + Vite"
Durata: 1m 12s
Stato: ✓ Passato

Puoi vedere i dettagli completi su GitHub.

— Il team di GitHub`,
      date: minutesAgo(42),
      unread: true,
      starred: false,
    },
    {
      id: "m3",
      from: "Martina Rossi",
      email: "martina.rossi@example.com",
      subject: "Re: feedback sulla dashboard",
      snippet:
        "Ciao! Ho provato la nuova griglia di widget, è davvero fluida. Una sola cosa…",
      body: `Ciao!

Ho provato la nuova griglia di widget di DiVerge ed è davvero fluida, complimenti. Il drag & drop è soddisfacente e i colori personalizzabili sono un tocco di classe.

Una sola cosa: sul widget Gmail mi piacerebbe poter aprire le email senza uscire dalla dashboard. Sarebbe possibile?

Fammi sapere cosa ne pensi.

Un abbraccio,
Martina`,
      date: hoursAgo(3),
      unread: true,
      starred: true,
    },
    {
      id: "m4",
      from: "Vercel",
      email: "no-reply@vercel.com",
      subject: "Il tuo deploy è online",
      snippet: "diverge.vercel.app è stato aggiornato. Tempo di build: 24s.",
      body: `Il tuo progetto è stato distribuito con successo.

🌐 diverge.vercel.app
⚡ Tempo di build: 24s
🧩 Framework: Vite

Ogni push sul branch main attiverà un nuovo deploy automatico.

— Vercel`,
      date: hoursAgo(6),
      unread: false,
      starred: false,
    },
    {
      id: "m5",
      from: "Newsletter Frontend",
      email: "hello@frontendweekly.dev",
      subject: "5 pattern di animazione che amerai",
      snippet:
        "Questa settimana: micro-interazioni, spring physics e transizioni fluide…",
      body: `Frontend Weekly — Edizione #142

Questa settimana parliamo di movimento:

1. Micro-interazioni che guidano l'utente
2. Spring physics vs easing curves
3. Transizioni di layout condivise
4. Gestire prefers-reduced-motion
5. Performance: animare solo transform e opacity

Buona lettura!`,
      date: hoursAgo(20),
      unread: false,
      starred: false,
    },
    {
      id: "m6",
      from: "Stripe",
      email: "receipts@stripe.com",
      subject: "Ricevuta del tuo abbonamento",
      snippet: "Grazie! Ecco la ricevuta del pagamento del piano Pro.",
      body: `Grazie per il tuo pagamento.

Piano: DiVerge Pro
Importo: € 6,00
Periodo: mensile

Questa è una ricevuta di esempio. Conservala per i tuoi archivi.

— Stripe`,
      date: daysAgo(1),
      unread: false,
      starred: false,
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

export async function fetchMessages() {
  await delay(600);
  // Return clones, newest first, so callers can't mutate our store.
  return inbox
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((m) => ({ ...m }));
}

export async function getMessage(id) {
  await delay(150);
  const m = inbox.find((x) => x.id === id);
  return m ? { ...m } : null;
}

export async function markRead(id, read = true) {
  await delay(120);
  const m = inbox.find((x) => x.id === id);
  if (m) m.unread = !read;
}

export async function toggleStar(id) {
  await delay(120);
  const m = inbox.find((x) => x.id === id);
  if (m) m.starred = !m.starred;
}

export async function deleteMessage(id) {
  await delay(150);
  inbox = inbox.filter((x) => x.id !== id);
}

export async function sendMessage({ to, subject, body }) {
  await delay(800); // Phase 3: real Gmail "send" call.
  // eslint-disable-next-line no-console
  console.info("[DiVerge] Email inviata (demo):", { to, subject, body });
  return { ok: true };
}

// --- real Gmail (read-only) ----------------------------------------------
//
// Uses the shared Google access token (same one as Calendar). Needs the
// gmail.readonly scope; a 403 means the user hasn't granted it yet.

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export { GMAIL_READONLY_SCOPE };

function gmailAuthError(status) {
  const err = new Error("auth");
  err.code = status;
  return err;
}

async function gmailGet(token, path) {
  const res = await fetch(`${GMAIL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw gmailAuthError(res.status);
  if (!res.ok) throw new Error("gmail request failed");
  return res.json();
}

// INBOX list with light metadata (sender, subject, date, snippet, flags).
// Bodies are loaded lazily (getGmailBody) when a message is opened.
export async function fetchGmailMessages(token, max = 15) {
  const list = await gmailGet(
    token,
    `/messages?labelIds=INBOX&maxResults=${max}`
  );
  const ids = (list.messages || []).map((m) => m.id);
  const metaPath =
    "?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date";
  const results = await Promise.allSettled(
    ids.map((id) => gmailGet(token, `/messages/${id}${metaPath}`))
  );
  // If the very first call failed with an auth error, surface it.
  const authErr = results.find(
    (r) => r.status === "rejected" && (r.reason?.code === 401 || r.reason?.code === 403)
  );
  if (authErr) throw authErr.reason;
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => mapGmailMeta(r.value));
}

// Full plain-text body for one message (lazy).
export async function getGmailBody(token, id) {
  const msg = await gmailGet(token, `/messages/${id}?format=full`);
  return extractPlainText(msg.payload) || msg.snippet || "";
}

function mapGmailMeta(msg) {
  const headers = Object.fromEntries(
    (msg.payload?.headers || []).map((h) => [h.name.toLowerCase(), h.value])
  );
  const { name, email } = parseFrom(headers.from || "");
  const labels = msg.labelIds || [];
  return {
    id: msg.id,
    from: name,
    email,
    subject: headers.subject || "(nessun oggetto)",
    snippet: decodeEntities(msg.snippet || ""),
    body: null, // loaded on open
    date: msg.internalDate
      ? new Date(Number(msg.internalDate)).toISOString()
      : new Date().toISOString(),
    unread: labels.includes("UNREAD"),
    starred: labels.includes("STARRED"),
    link: `https://mail.google.com/mail/u/0/#all/${msg.id}`,
  };
}

// "Mario Rossi <mario@x.com>" → { name, email }
function parseFrom(value) {
  const m = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || m[2], email: m[2].trim() };
  return { name: value.trim(), email: value.trim() };
}

// Walk the MIME tree for a text/plain part; fall back to stripped text/html.
function extractPlainText(payload) {
  if (!payload) return "";
  const walk = (part, want) => {
    if (!part) return "";
    if (part.mimeType === want && part.body?.data) {
      return decodeB64Url(part.body.data);
    }
    for (const child of part.parts || []) {
      const found = walk(child, want);
      if (found) return found;
    }
    return "";
  };
  const plain = walk(payload, "text/plain");
  if (plain) return plain.trim();
  const html = walk(payload, "text/html");
  if (html) return stripHtml(html).trim();
  if (payload.body?.data) return decodeB64Url(payload.body.data).trim();
  return "";
}

function decodeB64Url(data) {
  try {
    const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    // Re-interpret the binary string as UTF-8.
    try {
      return decodeURIComponent(escape(bin));
    } catch {
      return bin;
    }
  } catch {
    return "";
  }
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|br|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// --- helpers -------------------------------------------------------------

function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString();
}
function hoursAgo(n) {
  return minutesAgo(n * 60);
}
function daysAgo(n) {
  return hoursAgo(n * 24);
}

// Compact relative time, e.g. "8 min", "3 h", "yesterday".
export function relativeTime(iso, lang = "en") {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return lang === "it" ? "ora" : "now";
  if (min < 60) return `${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return lang === "it" ? "ieri" : "yesterday";
  return lang === "it" ? `${days} g` : `${days} d`;
}

// Full date for the reading pane, e.g. "17 Jun 2026, 09:52".
export function fullDate(iso, lang = "en") {
  return new Date(iso).toLocaleString(lang === "it" ? "it-IT" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
