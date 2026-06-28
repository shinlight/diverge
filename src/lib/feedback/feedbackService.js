/*
  DiVerge — Feedback service (bug reports & improvement ideas).

  SWAP POINT: today feedback is stored locally so the flow is testable without a
  backend. To go live, replace submit/load with a Supabase `feedback` table
  (insert from the client with RLS; read it from the admin dashboard).

  Suggested table:
    create table feedback (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users,
      type text check (type in ('bug','improvement')) not null,
      message text not null,
      email text,
      widget text,          -- which widget it was reported from (or null = general)
      page text,            -- route
      url text,
      user_agent text,
      viewport text,
      status text default 'new',  -- new | triaged | done | wontfix
      created_at timestamptz default now()
    );
    -- RLS: a user can INSERT their own rows; only admins can SELECT all.

  Then:
    submitFeedback(x) -> supabase.from('feedback').insert({...})
    loadFeedback()    -> supabase.from('feedback').select() (admin only)
*/

const KEY = "diverge.feedback";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

// Auto-captured context so a report is actionable without the user typing it.
export function captureContext({ widgetId = null, widgetName = null } = {}) {
  return {
    widget: widgetName || widgetId || null,
    page: typeof location !== "undefined" ? location.pathname : null,
    url: typeof location !== "undefined" ? location.href : null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    viewport:
      typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : null,
  };
}

export async function submitFeedback(entry) {
  await delay(500);
  const record = {
    id: uid(),
    status: "new",
    created_at: new Date().toISOString(),
    ...entry,
  };
  // PHASE: swap for supabase.from('feedback').insert(record).
  const list = loadFeedback();
  list.unshift(record);
  localStorage.setItem(KEY, JSON.stringify(list));
  // Mirror to console so it's visible during local/early testing.
  // eslint-disable-next-line no-console
  console.info("[DiVerge] feedback:", record);
  return { ok: true, record };
}

export function loadFeedback() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

// Admin: change a report's status (PHASE: supabase update with admin RLS).
export function updateFeedbackStatus(id, status) {
  const list = loadFeedback().map((f) => (f.id === id ? { ...f, status } : f));
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
