# Divergify — project guide for Claude

ADHD-friendly **widget dashboard** web app. A grid of widgets (Gmail, Calendar,
To-Do, Brain Dump, AI, Weather, Messaging, IMAP email, …) over a pinned
**Cockpit** recap band. Deployed on Vercel (auto-deploy from `main`,
GitHub `shinlight/diverge`).

## Stack
React 19 + Vite · Tailwind CSS v4 (`@theme` CSS-var tokens in `src/index.css`) ·
Framer Motion · dnd-kit (sortable grid) · React Router v7 · lucide-react ·
Supabase (auth + Postgres + realtime + storage) · Vercel serverless (`/api/*`).

## Run & verify (do this for every UI change)
- Dev server: use the **preview MCP** (`preview_start` name `dev`), never `npm run dev` in Bash.
- The app runs in **mock mode** when Supabase env is absent, and **real mode** when present.
  To test the mock UI locally, temporarily move the env file:
  `Rename-Item .env.local .env.local.bak` → start preview → seed a fake user in
  `localStorage` (`diverge.user`) → reload. **Always restore it after:** `Rename-Item .env.local.bak .env.local`.
- Serverless functions (`/api/*`) do **not** run under `vite dev` — verify those on Vercel.
- **Before committing:** `npm run build` must pass. Check `preview_console_logs` (level error) = clean.
- The user's flow: implement → build green → verify in mock (preview) → **commit + push** each feature.
  End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Widget pattern (the template — follow it for every widget)
`service + hook + Widget(card) + Focus(overlay)`:
- `src/lib/widgets/<name>/<name>Service.js` — data + the **swap point** (mock now / real API later).
- `src/lib/widgets/<name>/use<Name>.js` — the shared state hook.
- `src/components/widgets/live/<Name>Widget.jsx` — the square card.
- `src/components/widgets/live/<Name>Focus.jsx` — the expanded overlay (`fixed inset-0 z-50`).
- Register in `src/lib/widgets/registry.jsx` (`status: "live"`, `accent`, optional `wide: true`,
  `multiInstance: true`) **and** map it in `src/components/widgets/live/index.js`.
- Add i18n keys (EN + IT) in `src/lib/i18n/translations.js` (`widgets.<name>.name/desc` + a `<name>` block).

## Dashboard layout state (localStorage, in `DashboardPage`)
- `diverge.layout` — ordered widget instance ids (drag reorders).
- `diverge.pinned` — pinned ids (max 6, shown first, accent ring + badge).
- `diverge.wide` — ids dilated to 2 blocks (`sm:col-span-2 sm:aspect-[2/1]`; only `wide:true` widgets).
- `diverge.titles` — per-widget custom titles.
Multi-instance ids are `"<type>::<uuid>"`; helpers `instanceType`/`isMultiInstance`/`newInstanceId` in `registry.jsx`.

## Cross-widget sync (CustomEvents on `window`)
- `diverge:tasks` — the canonical task store (`tasksService`) changed; To-Do, Focus, Cockpit re-read.
- `diverge:braindump` — brain-dump items changed.
- `diverge:focus-start` (`detail.taskId`) — start a Pomodoro on a task (`useFocus` listens).

## Gotchas (hard-won — don't repeat)
- **StrictMode duplication:** never put a side-effect (`saveX`, `dispatchEvent`, `pushTask`) **inside a
  `setState` updater** — StrictMode double-invokes it and you get duplicates. Persist via a `useEffect`
  on the state, with a "skip first render / skip external-sync" ref guard. (See `useTasks`, `useBrainDump`.)
- **Theme token:** the page-bg token is `--color-bg`, NOT `--color-base` (`base` collides with the
  `text-base` font-size utility → invisible text). Never name a `@theme` colour after a font-size scale.
- **i18n:** sub-components defined outside a `useI18n()` caller need their **own** `useI18n()`; never close
  over `t` from an outer scope, and don't shadow `t` with `.map((t)=>…)`.
- **Truncation:** a flex title row needs `min-w-0` on the container AND the `<h3 className="min-w-0 truncate">`.
- **Supabase Realtime channel names:** give each `supabase.channel(...)` a **unique topic per
  subscription** (e.g. append a random suffix). A shared name across widget instances/re-subscribes
  reuses an already-subscribed channel → `cannot add postgres_changes callbacks ... after subscribe()`,
  which (real mode only) threw and white-screened the app. (See `messagingService.subscribeIncoming`.)
- **Error Boundary:** the app wraps each widget (and the root) in `components/ui/ErrorBoundary` — a single
  widget render error shows inline in its card instead of blanking the whole dashboard. Mock mode can't
  exercise real-data/realtime crashes, so verify realtime-touching changes against real Supabase.
- **Serverless functions** (`api/*.js`, Node ESM): authenticate the caller with their Supabase JWT
  (`supabase.auth.getUser(jwt)`); keep secrets server-only (never `VITE_`-prefixed if they must stay secret).
  `vercel.json` excludes `/api/` from the SPA rewrite.

## Real backends already wired
- **Google (Calendar read+write, Gmail read+write):** shared OAuth token; refresh persisted via
  `api/google-token.js` + `google_credentials` table. Restricted scopes work in the Testing consent screen.
- **Messaging (internal channel):** real via Supabase (`messages` table + realtime).
- **AI chunk-it:** `api/ai-chunk.js` → Claude (Anthropic).

## ⏳ Pending prerequisites (user-side; flag when relevant)
- **AI chunk-it:** set `ANTHROPIC_API_KEY` on Vercel (else the heuristic fallback runs).
- **Apple login:** the button exists; needs Apple Developer setup + the Apple provider enabled in Supabase.
- **Email (IMAP) widget:** UI is **mock-only**. Real use needs a serverless `api/imap.js`
  (`imapflow` + `nodemailer`), a Supabase table for the account config with the **password encrypted**
  (`IMAP_ENC_KEY` env), then swap the bodies in `imapService.js`.
- **Revolut widget:** UI is **mock-only** (read-only). Revolut retail has no direct API — real use
  goes via Open Banking (PSD2/AIS) through an aggregator. Plan: register on **GoCardless Bank Account
  Data** (ex Nordigen, free tier), add a serverless `api/revolut.js` holding `secret_id`/`secret_key`
  server-side (consent/requisition link → balances → transactions), then swap the bodies in
  `revolutService.js`. PSD2 consent expires ~90 days. See `docs/superpowers/specs/2026-06-28-revolut-widget-design.md`.
- **Feedback (in-widget):** the 📣 button on every widget collects bug/idea reports. Mock stores in
  `localStorage` (`diverge.feedback`); go live by swapping `feedbackService.js` for a Supabase
  `feedback` table (schema + RLS notes in that file).
- **Admin dashboard (`/admin`):** **mock-only** management console (Overview/Users/Subscriptions/
  Payments[Stripe+Crypto]/Feedback). Gated by an email allowlist in `adminService.js`; go live with a
  `profiles.is_admin` column + RLS, `subscriptions`/`payments` tables (Stripe webhooks + on-chain), and
  swap the `adminService` getters. See `docs/superpowers/specs` / `2026-06-28` work.
- **Find a Place widget:** UI is **mock-only** (search + results + map placeholder). Real use needs a
  **Google Maps Platform API key** (billing-enabled GCP project): Places API for search/details and the
  Maps Embed API (or Maps JS SDK) for the map, then swap the bodies in `placeService.js`. The "Open in
  Google Maps" deep link is already real (no key). Note: this is a Maps **Platform** key, separate from
  the Google OAuth already wired for Calendar/Gmail. See `docs/superpowers/specs/2026-06-28-find-a-place-widget-design.md`.

## Notes
- A temporary access gate (`middleware.js`, Vercel Edge) shows a black login before the app. Credentials
  come from env (`GATE_USER`/`GATE_PASS`/`GATE_TOKEN`), **fail-closed** if unset. Early access proper is
  an **email allowlist** (`lib/access`, admin "Early access" section) enforced server-side by a Supabase
  auth hook — see `docs/superpowers/specs/2026-06-28-early-access.md`; the curtain is removed once it's live.
- Mock fallbacks stay in place so the whole app is testable without any keys.
