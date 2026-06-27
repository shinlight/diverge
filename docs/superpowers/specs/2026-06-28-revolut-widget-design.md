# Revolut widget (mock) — design

Date: 2026-06-28

ADHD-friendly dashboard widget that shows a Revolut **retail** account: main
balance + recent transactions on the card, multi-currency pockets + full
transaction list in the Focus overlay. **Mock now**, with a clean swap point to
**GoCardless Bank Account Data** (Open Banking / PSD2 AIS) later, since Revolut
retail has no direct public API.

## Scope
- **Read-only.** No payments/transfers — by design.
- Mock only. Real mode is a future swap in `revolutService.js` + a serverless
  `api/revolut.js` that holds the GoCardless `secret_id`/`secret_key`
  server-side and proxies the AIS calls.

## Architecture (follows the project widget template)
`service + hook + Widget(card) + Focus(overlay)`:
- `src/lib/widgets/revolut/revolutService.js` — mock data + the **swap point**
  (commented mapping to GoCardless endpoints).
- `src/lib/widgets/revolut/useRevolut.js` — shared state hook.
- `src/components/widgets/live/RevolutWidget.jsx` — square card.
- `src/components/widgets/live/RevolutFocus.jsx` — expanded overlay
  (`fixed inset-0 z-50`).
- Register in `src/lib/widgets/registry.jsx` and map in
  `src/components/widgets/live/index.js`.
- i18n keys EN + IT in `translations.js` (`widgets.revolut.name/desc` +
  a `revolut` block).

## Registry entry
`id: "revolut"`, `icon: Wallet` (lucide), `accent: "#0666eb"` (Revolut blue),
`status: "live"`, `size: "md"`, `wide: true`, **not** multiInstance.

## Connection gate (mock-realistic)
A `connected` flag in `localStorage` (`diverge.revolut.connected`).
- **Not connected** → prompt with a "Connect Revolut" button that simulates the
  Open Banking consent (fake delay → `connected = true`). Real mode: this is the
  redirect to the GoCardless requisition link.
- **Connected** → balance + transactions.
- Focus has a "Disconnect" action that clears the flag.

## Data shape (mock)
```
accounts: [
  { id, currency, balance, primary }   // 1 primary EUR + 2 pockets (USD, GBP)
]
transactions: [
  { id, merchant, category, amount, currency, date }  // amount signed: -spent / +received
]
```
- ~10 seeded transactions on the primary account, realistic merchants
  (Spotify, Esselunga, salary, …), dates spread over recent days.
- Pockets are **balance-only** in the mock.

## Card (chosen: balance + recent movements)
- Top: **primary balance** prominent (e.g. `€ 2.847,63`) + account name.
- Below: compact list of the **last 3–4 transactions** (merchant, relative time,
  signed amount; green for incoming).
- Header: `Wallet` icon, refresh + expand actions.

## Focus (overlay)
- Large primary balance + refresh + **Disconnect**.
- **Pockets row**: a chip per non-primary currency with its balance (read-only).
- **Full transaction list**, scrollable: merchant, category, date, colored amount.

## Hook surface (`useRevolut`)
`connected, connecting, status (idle|loading|ready|error), accounts, primary,
balance, currency, pockets, transactions, connect(), disconnect(), refresh()`.

## Swap point (future, GoCardless Bank Account Data)
All via serverless `api/revolut.js` (secrets server-only, never `VITE_`):
- `connect()`     → create requisition → redirect to consent → store account id.
- `fetchAccounts()` → `GET /accounts/{id}/balances/` per linked account.
- `fetchTransactions()` → `GET /accounts/{id}/transactions/`.
- PSD2 consent expires ~90 days → re-consent flow on `error`.

## Out of scope (YAGNI)
- Per-pocket transaction history (pockets are balance-only for now).
- Cockpit integration.
- Any payment/transfer action.

## Verify
- `npm run build` green; `preview_console_logs` (error) clean.
- Mock flow in preview: add widget → Connect → balance + list → expand →
  pockets + full list → Disconnect.
