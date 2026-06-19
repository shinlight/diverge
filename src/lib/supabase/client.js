import { createClient } from "@supabase/supabase-js";

/*
  DiVerge — Supabase client.

  Reads the project URL + anon (public) key from environment variables.
  The anon key is safe to ship to the browser by design — row-level security
  on the backend is what protects data.

  Set these in `.env.local` (git-ignored) for local dev and in the Vercel
  project's Environment Variables for production:
    VITE_SUPABASE_URL=...
    VITE_SUPABASE_ANON_KEY=...

  If they're missing, `supabase` is null and the app falls back to the mock
  auth — so nothing breaks before the keys are in place.
*/

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
