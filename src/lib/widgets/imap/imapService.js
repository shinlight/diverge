/*
  Divergify — IMAP/SMTP email service.

  IMAP/SMTP are TCP protocols the browser can't speak directly. This file is
  the SWAP POINT: today it stores the account config locally and serves a mock
  inbox so the widget UX is fully testable. To go live, replace each body with
  a call to a serverless proxy (`/api/imap`) that connects to the user's IMAP
  (e.g. `imapflow`) / SMTP (`nodemailer`) server-side, using the stored config:

    fetchMessages()  -> POST /api/imap { action: "list" }
    getMessage(id)   -> POST /api/imap { action: "get", id }
    markRead/star    -> POST /api/imap { action: "flag", id, ... }
    deleteMessage()  -> POST /api/imap { action: "delete", id }
    sendMessage()    -> POST /api/imap { action: "send", to, subject, body }

  The config (incl. an app-specific password) must be stored ENCRYPTED
  server-side, not in localStorage — this mock keeps it local only for the demo.
*/

import { relativeTime, fullDate } from "../gmail/gmailService";

export { relativeTime, fullDate };

const CONFIG_KEY = "diverge.imap.config";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// --- account config ------------------------------------------------------

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveConfig(cfg) {
  // PHASE: POST to /api/imap { action: "save-config" } so the password is
  // encrypted server-side instead of living in localStorage.
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

export function clearConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

export function isConfigured() {
  return Boolean(loadConfig());
}

// Sensible defaults for the setup form.
export const DEFAULT_CONFIG = {
  name: "",
  email: "",
  password: "",
  imapHost: "",
  imapPort: 993,
  imapSecure: true,
  smtpHost: "",
  smtpPort: 465,
};

// --- mock inbox (seeded) -------------------------------------------------

let inbox = seedInbox();
let nextId = 50;

function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString();
}
function hoursAgo(n) {
  return minutesAgo(n * 60);
}

function seedInbox() {
  return [
    {
      id: "i1",
      from: "Fatturazione Aruba",
      email: "noreply@aruba.it",
      subject: "La tua fattura di giugno è disponibile",
      snippet: "Gentile cliente, la fattura del mese è pronta nell'area clienti…",
      body: `Gentile cliente,

la fattura relativa al mese di giugno è disponibile nella tua area clienti.

Importo: € 4,99
Scadenza: 30/06

Grazie per averci scelto.
— Servizio Clienti`,
      date: minutesAgo(12),
      unread: true,
      starred: false,
    },
    {
      id: "i2",
      from: "Marco Bianchi",
      email: "marco.bianchi@studio.it",
      subject: "Re: preventivo sito web",
      snippet: "Ciao, ho dato un'occhiata al preventivo. Possiamo sentirci domani…",
      body: `Ciao,

ho dato un'occhiata al preventivo che mi hai inviato: mi sembra in linea.

Possiamo sentirci domani in mattinata per definire i dettagli?

A presto,
Marco`,
      date: hoursAgo(2),
      unread: true,
      starred: true,
    },
    {
      id: "i3",
      from: "Newsletter ProDev",
      email: "news@prodev.dev",
      subject: "Le novità della settimana",
      snippet: "Questa settimana: nuove API, strumenti e best practice per il tuo flusso…",
      body: `ProDev Weekly

In questo numero:
• Nuove API in arrivo
• 3 strumenti che velocizzano il lavoro
• Best practice per la posta IMAP

Buona lettura!`,
      date: hoursAgo(8),
      unread: false,
      starred: false,
    },
    {
      id: "i4",
      from: "Banca Online",
      email: "alert@bancaonline.it",
      subject: "Accesso effettuato dal tuo dispositivo",
      snippet: "Abbiamo registrato un accesso al tuo conto. Se non sei stato tu…",
      body: `Abbiamo registrato un accesso al tuo conto online.

Dispositivo: Windows · Browser
Ora: poco fa

Se non sei stato tu, contatta subito l'assistenza.`,
      date: hoursAgo(26),
      unread: false,
      starred: false,
    },
  ];
}

// --- public API (mock; swap with /api/imap) ------------------------------

export async function fetchMessages() {
  await delay(650);
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
  await delay(800);
  // eslint-disable-next-line no-console
  console.info("[Divergify] IMAP/SMTP send (demo):", { to, subject, body });
  // Echo it into the inbox as a "sent" marker would, but keep mock simple.
  nextId += 1;
  return { ok: true };
}
