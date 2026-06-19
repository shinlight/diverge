import { next } from "@vercel/edge";

export const config = { matcher: "/:path*" };

/*
  TEMPORARY access gate (Vercel Edge Middleware).

  Runs at the edge BEFORE the app is served. This file never reaches the
  browser, so the credentials here are not visible to visitors. Real lock,
  not a client-side curtain.

  To remove the gate later: delete this file (and optionally `@vercel/edge`).
  TODO: move USER/PASS to Vercel Environment Variables before going public.
*/
const USER = "admin";
const PASS = "$D1V3rg32026$";
const COOKIE = "dvg_gate";
const TOKEN = "k7Q2-9fLm-Xa31-Tz80-Vb56-Rn4Q8d"; // opaque, unguessable cookie value

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
    if (form.get("u") === USER && form.get("p") === PASS) {
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
