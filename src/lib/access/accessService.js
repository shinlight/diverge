/*
  Divergify — Early-access allowlist.

  Controls who can join during early access: only allowlisted emails can sign up
  / sign in. A waitlist collects requests from everyone else.

  MOCK now (localStorage) so the flow is testable. The REAL enforcement must be
  SERVER-SIDE (the client list here is only the admin UI + the mock gate):
    - table `early_access_allowlist (email text primary key, added_at timestamptz)`
    - a Supabase Auth Hook (before-user-created) that rejects emails not in the
      table — that is the actual lock (a client check is bypassable).
    - table `waitlist (email text primary key, requested_at timestamptz)`.
  Then swap loadAllowlist/isAllowed (admin reads) and addToWaitlist (insert).
  See docs/superpowers/specs/2026-06-28-early-access.md.
*/

const ALLOW_KEY = "diverge.allowlist";
const WAIT_KEY = "diverge.waitlist";

// Seeded so the mock + admin are testable out of the box.
const SEED = ["igor.bragato@gmail.com", "igor@example.com", "ospite@diverge.app"];

const norm = (e) => (e || "").trim().toLowerCase();

// --- allowlist -----------------------------------------------------------

export function loadAllowlist() {
  try {
    const raw = localStorage.getItem(ALLOW_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [...SEED];
}

function saveAllowlist(list) {
  localStorage.setItem(ALLOW_KEY, JSON.stringify(list));
}

export function isAllowed(email) {
  return loadAllowlist().includes(norm(email));
}

export function addAllowed(email) {
  const e = norm(email);
  if (!e) return loadAllowlist();
  const list = loadAllowlist();
  if (!list.includes(e)) list.push(e);
  saveAllowlist(list);
  return list;
}

export function removeAllowed(email) {
  const list = loadAllowlist().filter((x) => x !== norm(email));
  saveAllowlist(list);
  return list;
}

// --- waitlist ------------------------------------------------------------

export function loadWaitlist() {
  try {
    const raw = localStorage.getItem(WAIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function addToWaitlist(email) {
  const e = norm(email);
  if (!e) return loadWaitlist();
  const list = loadWaitlist();
  if (!list.some((w) => w.email === e)) {
    list.unshift({ email: e, requestedAt: new Date().toISOString() });
    localStorage.setItem(WAIT_KEY, JSON.stringify(list));
  }
  return list;
}

export function removeFromWaitlist(email) {
  const list = loadWaitlist().filter((w) => w.email !== norm(email));
  localStorage.setItem(WAIT_KEY, JSON.stringify(list));
  return list;
}
