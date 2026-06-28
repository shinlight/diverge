import { next } from "@vercel/edge";

export const config = { matcher: "/:path*" };

/*
  TEMPORARY access gate (Vercel Edge Middleware).

  Runs at the edge BEFORE the app is served. Credentials come from Vercel
  Environment Variables — NEVER hardcode them here (this repo is public).

  Set on Vercel (Project → Settings → Environment Variables), then redeploy:
    GATE_USER  = <a username>
    GATE_PASS  = <a strong password — rotate; the old one was public>
    GATE_TOKEN = <a long random string, the opaque cookie value>

  Fail-closed: if these are unset the gate denies everyone (no open window).

  Early access plan: once the Supabase allowlist auth hook is live, this curtain
  can be deleted entirely (delete this file + optionally `@vercel/edge`).
  See docs/superpowers/specs/2026-06-28-early-access.md.
*/
const USER = process.env.GATE_USER;
const PASS = process.env.GATE_PASS;
const COOKIE = "dvg_gate";
const TOKEN = process.env.GATE_TOKEN;

// Fail closed: without configured credentials, nobody can pass.
const CONFIGURED = Boolean(USER && PASS && TOKEN);

const PAGE = (error) => `<!doctype html><html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title> </title>
<style>
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body { background:#000; display:flex; align-items:center; justify-content:center;
         font-family: system-ui, -apple-system, sans-serif; }
  form { display:flex; flex-direction:column; gap:12px; width:260px; }
  input { background:#0d0d0d; border:1px solid ${error ? "#5a2020" : "#222"};
          color:#eaeaea; border-radius:10px; padding:12px 14px; font-size:14px; outline:none; }
  input:focus { border-color:#444; }
  button { background:#161616; border:1px solid #2a2a2a; color:#eaeaea;
           border-radius:10px; padding:12px; font-size:15px; cursor:pointer; }
  button:hover { background:#1f1f1f; }
</style></head>
<body>
  <form method="POST" action="/__auth">
    <input name="u" type="text" autocomplete="username" autofocus />
    <input name="p" type="password" autocomplete="current-password" />
    <button type="submit">&rarr;</button>
  </form>
</body></html>`;

function gatePage(error, status = 200) {
  return new Response(PAGE(error), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Public assets the browser must read ungated to offer PWA install.
const OPEN_PATHS = [
  "/manifest.webmanifest",
  "/sw.js",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.svg",
];

export default async function middleware(request) {
  const url = new URL(request.url);

  // Let manifest / icons / service worker through, so Chrome can evaluate
  // installability even before the gate is passed.
  if (OPEN_PATHS.includes(url.pathname)) return next();

  // Handle the login form submission.
  if (request.method === "POST" && url.pathname === "/__auth") {
    const form = await request.formData();
    if (CONFIGURED && form.get("u") === USER && form.get("p") === PASS) {
      return new Response(null, {
        status: 303,
        headers: {
          location: "/",
          "set-cookie": `${COOKIE}=${TOKEN}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
        },
      });
    }
    return gatePage(true, 401);
  }

  // Already authenticated → let the request through to the app.
  const cookies = request.headers.get("cookie") || "";
  const authed = cookies
    .split(";")
    .some((c) => c.trim() === `${COOKIE}=${TOKEN}`);
  if (authed) return next();

  // Otherwise, show the bare gate.
  return gatePage(false);
}
