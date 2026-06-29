/*
  Divergify — Weather service (real data).

  Provider: Open-Meteo (https://open-meteo.com) — free, accurate, no API key,
  CORS-friendly. City name via BigDataCloud reverse geocoding (also key-free).
  Location comes from the browser Geolocation API (with the user's consent).
*/

const STORAGE_KEY = "diverge.weather";

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000, maximumAge: 600000 }
    );
  });
}

export async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("weather request failed");
  const j = await res.json();
  const place = await reverseGeocode(lat, lon).catch(() => null);

  return {
    place,
    current: {
      temp: Math.round(j.current.temperature_2m),
      feels: Math.round(j.current.apparent_temperature),
      humidity: Math.round(j.current.relative_humidity_2m),
      wind: Math.round(j.current.wind_speed_10m),
      code: j.current.weather_code,
    },
    daily: j.daily.time.map((d, i) => ({
      date: d,
      code: j.daily.weather_code[i],
      max: Math.round(j.daily.temperature_2m_max[i]),
      min: Math.round(j.daily.temperature_2m_min[i]),
    })),
    fetchedAt: Date.now(),
  };
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  );
  if (!res.ok) return null;
  const j = await res.json();
  return j.city || j.locality || j.principalSubdivision || null;
}

// WMO weather code -> a translation key under "weatherCodes.*".
export function codeKey(code) {
  if (code === 0) return "clear";
  if (code <= 2) return "mainlyClear";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 95) return "thunder";
  return "cloudy";
}

export function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveCache(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
