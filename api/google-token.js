/*
  DiVerge — Google token broker (Vercel serverless function).

  Keeps the user's Google access token alive without re-authorising every
  session. The long-lived Google *refresh* token is stored server-side and is
  never exposed to the browser.

  - POST { refresh_token }  → store/replace the caller's refresh token.
  - GET                     → exchange the stored refresh token for a fresh
                              access token and return it.

  Auth: the caller must send their Supabase JWT as `Authorization: Bearer …`.
  We validate it with the anon client; the refresh token lives in a table only
  the service role can touch (RLS denies all client access).

  Required env (Vercel): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  SUPABASE_SERVICE_ROLE_KEY. Reuses VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
*/

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export default async function handler(req, res) {
  try {
    if (
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET
    ) {
      return res.status(500).json({ error: "server_not_configured" });
    }

    // --- Authenticate the caller via their Supabase JWT --------------------
    const header = req.headers.authorization || "";
    const jwt = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!jwt) return res.status(401).json({ error: "missing_token" });

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: "invalid_token" });
    }
    const userId = userData.user.id;

    // Service-role client: bypasses RLS to reach the credentials table.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // --- Store the refresh token ------------------------------------------
    if (req.method === "POST") {
      const refreshToken = req.body?.refresh_token;
      if (!refreshToken) {
        return res.status(400).json({ error: "missing_refresh_token" });
      }
      const { error } = await admin.from("google_credentials").upsert({
        user_id: userId,
        refresh_token: refreshToken,
        updated_at: new Date().toISOString(),
      });
      if (error) return res.status(500).json({ error: "store_failed" });
      return res.status(204).end();
    }

    // --- Mint a fresh access token ----------------------------------------
    if (req.method === "GET") {
      const { data: row, error } = await admin
        .from("google_credentials")
        .select("refresh_token")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !row?.refresh_token) {
        return res.status(404).json({ error: "no_refresh_token" });
      }

      const body = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: row.refresh_token,
        grant_type: "refresh_token",
      });
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!tokenRes.ok) {
        // Refresh token revoked or expired → caller should re-connect Google.
        return res.status(401).json({ error: "refresh_failed" });
      }
      const tok = await tokenRes.json();
      return res
        .status(200)
        .json({ access_token: tok.access_token, expires_in: tok.expires_in });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  } catch {
    return res.status(500).json({ error: "unexpected" });
  }
}
