/*
  Divergify — minimal service worker.

  Its only job is to make the app installable as a PWA. It deliberately does
  NOT cache anything (the app needs the network for Supabase, and caching could
  serve stale auth/gate states). The empty fetch handler satisfies the install
  criterion while leaving network behaviour untouched.
*/
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
