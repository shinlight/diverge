/*
  DiVerge — Find a Place service.

  This file is the SWAP POINT: today it serves a mock set of places and a
  substring search so the widget UX is fully testable without any key. To go
  live, replace each body with a call to the Google Maps Platform (optionally
  proxied through a serverless `/api/places` so the billed key stays server-side):

    search(q)      -> Places Text Search / Autocomplete
    getDetails(id) -> Places Details (hours, phone, photos)
    map preview    -> Maps Embed API iframe (place mode), or the Maps JS SDK

  The "Open in Google Maps" deep link (`mapsUrl`) is ALREADY real — it just opens
  maps.google.com in the browser and needs no key.
*/

const RECENT_KEY = "diverge.place.recent";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// --- mock data -----------------------------------------------------------

// A fixed mock "current location" (Milan centre) so distances are stable.
const PLACES = [
  { id: "p1", name: "Trattoria da Gino", category: "Ristorante", address: "Via Roma 12, Milano", rating: 4.6, reviews: 1280, openNow: true, distance: 320, lat: 45.4655, lng: 9.1865, phone: "+39 02 1234567" },
  { id: "p2", name: "Caffè Centrale", category: "Bar · Caffetteria", address: "Corso Buenos Aires 8, Milano", rating: 4.3, reviews: 540, openNow: true, distance: 150, lat: 45.4781, lng: 9.2095, phone: "+39 02 7654321" },
  { id: "p3", name: "Farmacia San Marco", category: "Farmacia", address: "Via Torino 45, Milano", rating: 4.1, reviews: 96, openNow: false, distance: 680, lat: 45.4612, lng: 9.1812, phone: "+39 02 9988776" },
  { id: "p4", name: "PowerFit Palestra", category: "Palestra", address: "Viale Monza 102, Milano", rating: 4.4, reviews: 410, openNow: true, distance: 1450, lat: 45.5012, lng: 9.2231, phone: "+39 02 5566778" },
  { id: "p5", name: "Parco Sempione", category: "Parco", address: "Piazza Sempione, Milano", rating: 4.8, reviews: 32100, openNow: true, distance: 2100, lat: 45.4723, lng: 9.1741, phone: "" },
  { id: "p6", name: "Museo del Novecento", category: "Museo", address: "Piazza del Duomo 8, Milano", rating: 4.5, reviews: 8800, openNow: false, distance: 540, lat: 45.4636, lng: 9.1903, phone: "+39 02 88444061" },
  { id: "p7", name: "Esselunga Supermercato", category: "Supermercato", address: "Via Solari 21, Milano", rating: 4.2, reviews: 2150, openNow: true, distance: 890, lat: 45.4567, lng: 9.1689, phone: "+39 02 3344556" },
  { id: "p8", name: "Libreria Hoepli", category: "Libreria", address: "Via Ulrico Hoepli 5, Milano", rating: 4.7, reviews: 3400, openNow: true, distance: 600, lat: 45.4659, lng: 9.1934, phone: "+39 02 864871" },
];

// Real deep link into Google Maps web (no key required).
export function mapsUrl(place) {
  const q = encodeURIComponent(`${place.name} ${place.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${place.id}`;
}

export function formatDistance(metres) {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1).replace(".", ",")} km`;
}

// --- search (mock; swap with Places API) ---------------------------------

export async function search(query) {
  await delay(400);
  const q = query.trim().toLowerCase();
  const list = q
    ? PLACES.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q))
    : PLACES.slice();
  return list.sort((a, b) => a.distance - b.distance).map((p) => ({ ...p }));
}

export async function getDetails(id) {
  await delay(120);
  const p = PLACES.find((x) => x.id === id);
  return p ? { ...p } : null;
}

// --- recent searches (persisted) -----------------------------------------

export function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function pushRecent(query) {
  const q = query.trim();
  if (!q) return loadRecent();
  const next = [q, ...loadRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
  return [];
}
