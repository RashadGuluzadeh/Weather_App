const API_KEY = import.meta.env.VITE_OWM_API_KEY;
const BASE_URL = "https://api.openweathermap.org";

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const STATUS_CODES = { 401: "invalidKey", 404: "notFound", 429: "rateLimit" };

async function request(path, params, signal) {
  if (!API_KEY) throw new ApiError("missingKey", "VITE_OWM_API_KEY is not set");

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries({ ...params, appid: API_KEY })) {
    url.searchParams.set(key, value);
  }

  let res;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("network", err.message);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      message = (await res.json()).message || message;
    } catch {
      // Error body is not JSON; keep the status text.
    }
    throw new ApiError(STATUS_CODES[res.status] ?? "server", message, res.status);
  }
  return res.json();
}

export function searchCities(query, signal) {
  return request("/geo/1.0/direct", { q: query, limit: 5 }, signal);
}

// Always fetched in metric; the UI converts to imperial so switching units is instant.
export async function fetchWeather({ lat, lon }, lang, signal) {
  const params = { lat, lon, units: "metric", lang };
  const [current, forecast] = await Promise.all([
    request("/data/2.5/weather", params, signal),
    request("/data/2.5/forecast", params, signal),
  ]);
  return { current, forecast, fetchedAt: Date.now() };
}
