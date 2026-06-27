# Find a Place widget (mock) — design

Date: 2026-06-28

A place-search widget for the dashboard ("Find a Place"). Type a query → get a
list of matching places (name, category, rating, address, distance); open one to
see details + a map preview. **Mock now**, with a clean swap point to the Google
Maps Platform (Places API + Maps Embed API) later.

## Scope
- Mock search + mock data now. Real mode is a future swap in `placeService.js`
  (+ optionally a serverless `api/places.js` to keep the key off the client).
- The **"Open in Google Maps" deep link is real already** — it just opens
  `https://www.google.com/maps/search/?api=1&query=…` in the browser, no key needed.

## Architecture (follows the project widget template)
`service + hook + Widget(card) + Focus(overlay)`:
- `src/lib/widgets/place/placeService.js` — mock search/details + recent-search
  persistence + the **swap point** (commented Google Places / Maps Embed mapping).
- `src/lib/widgets/place/usePlace.js` — shared state hook.
- `src/components/widgets/live/PlaceWidget.jsx` — square card.
- `src/components/widgets/live/PlaceFocus.jsx` — expanded overlay (`fixed inset-0 z-50`).
- Register in `registry.jsx` and map in `live/index.js`.
- i18n keys EN + IT (`widgets.place.name/desc` + a `place` block).

## Registry entry
`id: "place"`, `icon: MapPin` (lucide), `accent: "#34a853"` (Maps green),
`status: "live"`, `size: "md"`, `wide: true`, **not** multiInstance.

## Card
- Top: **search input** (debounced, ~300ms).
- Typing → up to 3 result rows: name, category · rating, short address, distance.
- Empty (no query): **recent searches** as chips (from localStorage) + a hint.
- Click a result or expand → open the Focus (result selected).

## Focus (overlay)
- **Left pane**: search input + full results list (scrollable).
- **Right pane**: selected place detail —
  - **Map preview placeholder** (styled box with a pin + "Map preview · connect
    Google Maps"). Real mode swaps in a Maps Embed iframe.
  - Name, category, star rating + review count, address, hours (open/closed now),
    phone.
  - **"Open in Google Maps"** button → real deep link (works now).
- Empty selection → "Search and pick a place" hint.

## Data shape (mock)
```
place = {
  id, name, category, address, rating, reviews, openNow, distance, // metres
  lat, lng, phone
}
```
- ~8 seeded places (restaurant, café, pharmacy, gym, park, museum, supermarket,
  bookstore). `search(q)` filters by case-insensitive substring over name +
  category; empty query returns a default "nearby" set.
- Recent searches: last ~6 queries in `localStorage` (`diverge.place.recent`).

## Hook surface (`usePlace`)
`query, setQuery, results, status (idle|loading|ready|empty), selected,
select(id), recent, clearRecent(), search(q)`.

## Swap point (future, Google Maps Platform — needs an API key with billing)
- `search(q)`      → Places Text Search / Autocomplete.
- `getDetails(id)` → Places Details (hours, phone, photos).
- Map preview      → Maps **Embed API** iframe (place mode) with the key, or the
  Maps JavaScript SDK for an interactive map.
- Keep the key server-side via `api/places.js` if Places (billed) is used; the
  Embed iframe can use a referer-restricted browser key.

## Out of scope (YAGNI)
- Turn-by-turn directions, live geolocation (a fixed mock "current location" is
  used for distances), saved favorites, multi-instance.

## Verify
- `npm run build` green; `preview_console_logs` (error) clean.
- Mock flow in preview: add widget → type a query → results → open one → details
  + map placeholder → "Open in Google Maps" deep link present.
