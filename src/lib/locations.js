const MAX_RECENTS = 6;

const round = (n) => Math.round(n * 1e4) / 1e4;

export function locationFromGeo(geo) {
  return {
    name: geo.name,
    names: { az: geo.local_names?.az, en: geo.local_names?.en },
    state: geo.state || "",
    country: geo.country || "",
    lat: round(geo.lat),
    lon: round(geo.lon),
  };
}

export function gpsLocation(coords) {
  return { name: "", names: {}, state: "", country: "", lat: round(coords.latitude), lon: round(coords.longitude), gps: true };
}

export const isLocation = (value) =>
  !!value && typeof value === "object" && Number.isFinite(value.lat) && Number.isFinite(value.lon);

export const sameLocation = (a, b) =>
  !!a && !!b && Math.abs(a.lat - b.lat) < 1e-3 && Math.abs(a.lon - b.lon) < 1e-3;

export const displayName = (location, lang) => location.names?.[lang] || location.name;

export const placeName = (location, current, lang) => displayName(location, lang) || current?.name || "";

const labels = (loc) => [loc.name, loc.names?.az, loc.names?.en].filter(Boolean).map((s) => s.toLowerCase());

// The geocoder often returns a city next to its administrative area ("Bakı" and
// "Bakı İnzibati Ərazisi"). Nearby results whose names share a prefix are one place;
// distinct nearby cities (Tokyo, Chofu) have unrelated names and stay separate.
const samePlace = (a, b) =>
  a.country === b.country &&
  Math.abs(a.lat - b.lat) < 0.5 &&
  Math.abs(a.lon - b.lon) < 0.5 &&
  labels(a).some((x) => labels(b).some((y) => x.startsWith(y) || y.startsWith(x)));

const nameWeight = (loc) => labels(loc).reduce((sum, label) => sum + label.length, 0);

export function dedupeLocations(list) {
  const result = [];
  for (const loc of list) {
    const i = result.findIndex((existing) => samePlace(existing, loc));
    if (i === -1) result.push(loc);
    else if (nameWeight(loc) < nameWeight(result[i])) result[i] = loc;
  }
  return result;
}

export function addRecent(recents, location) {
  const entry = { ...location };
  delete entry.gps;
  return [entry, ...recents.filter((r) => !sameLocation(r, entry))].slice(0, MAX_RECENTS);
}

export const removeRecent = (recents, location) => recents.filter((r) => !sameLocation(r, location));

const regionNames = {};

export function countryName(code, lang) {
  if (!code) return "";
  try {
    if (!regionNames[lang]) regionNames[lang] = new Intl.DisplayNames([lang], { type: "region" });
    return regionNames[lang].of(code) || code;
  } catch {
    return code;
  }
}

const city = (az, en, country, lat, lon) => ({ name: en, names: { az, en }, state: "", country, lat, lon });

export const POPULAR_CITIES = [
  city("Bakı", "Baku", "AZ", 40.4093, 49.8671),
  city("Gəncə", "Ganja", "AZ", 40.6828, 46.3606),
  city("İstanbul", "Istanbul", "TR", 41.0082, 28.9784),
  city("London", "London", "GB", 51.5074, -0.1278),
  city("Paris", "Paris", "FR", 48.8566, 2.3522),
  city("Nyu-York", "New York", "US", 40.7128, -74.006),
  city("Dubay", "Dubai", "AE", 25.2048, 55.2708),
  city("Tokio", "Tokyo", "JP", 35.6762, 139.6503),
];
