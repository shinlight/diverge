/*
  Divergify — chunk-it with real AI (Vercel serverless function).

  Breaks a task title into 3-6 tiny, concrete ADHD-friendly micro-steps using
  Claude. The first step is always a ~2-minute starter (the hardest part for
  ADHD is initiation). Falls back to the client-side heuristic if this fails.

  Auth: the caller sends their Supabase JWT (so only signed-in users spend
  tokens). Required env: ANTHROPIC_API_KEY. Reuses VITE_SUPABASE_URL /
  VITE_SUPABASE_ANON_KEY for auth.
*/

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "method_not_allowed" });
    }
    if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: "server_not_configured" });
    }

    // Authenticate the caller.
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

    const title = (req.body?.title || "").toString().slice(0, 300).trim();
    if (!title) return res.status(400).json({ error: "missing_title" });

    const prompt =
      `Spezza questo compito in 3-6 micro-step concreti e brevi, pensati per una persona con ADHD.\n` +
      `Regole:\n` +
      `- Il PRIMO step deve essere un avvio da ~2 minuti e iniziare con "Inizia:".\n` +
      `- Ogni step è una riga molto breve, azione concreta.\n` +
      `- Rispondi nella stessa lingua del compito.\n` +
      `- Rispondi SOLO con un array JSON di stringhe, niente altro testo.\n\n` +
      `Compito: "${title}"`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!aiRes.ok) return res.status(502).json({ error: "ai_failed" });
    const data = await aiRes.json();
    const text = (data.content || []).map((c) => c.text || "").join("");

    const steps = parseSteps(text);
    if (!steps.length) return res.status(502).json({ error: "ai_unparsable" });
    return res.status(200).json({ steps: steps.slice(0, 6) });
  } catch {
    return res.status(500).json({ error: "unexpected" });
  }
}

// Pull a JSON array of strings out of the model's reply (tolerant).
function parseSteps(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr)) {
        return arr.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      // fall through to line parsing
    }
  }
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*[-*\d.")\]]+\s*/, "").trim())
    .filter((l) => l.length > 1);
}
