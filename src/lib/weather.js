const pad = (n) => String(n).padStart(2, "0");

// OpenWeatherMap times are UTC seconds plus the city's UTC offset. Shifting by the
// offset and reading UTC fields gives the city's wall-clock time in any browser timezone.
export const cityDate = (unix, tzOffset) => new Date((unix + tzOffset) * 1000);

export function formatClock(unix, tzOffset) {
  const d = cityDate(unix, tzOffset);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

const dateKey = (unix, tzOffset) => cityDate(unix, tzOffset).toISOString().slice(0, 10);

export function getCondition(id = 800, icon = "01d") {
  const night = icon.endsWith("n");
  let kind = "cloudy";
  if (id >= 200 && id < 300) kind = "thunder";
  else if (id >= 300 && id < 400) kind = "drizzle";
  else if (id === 511 || (id >= 611 && id <= 616)) kind = "sleet";
  else if ((id >= 502 && id <= 504) || id === 522 || id === 531) kind = "heavyRain";
  else if (id >= 500 && id < 600) kind = "rain";
  else if (id >= 600 && id < 700) kind = "snow";
  else if (id === 711 || id === 762) kind = "smoke";
  else if (id === 721) kind = "haze";
  else if (id === 731 || id === 751 || id === 761) kind = "dust";
  else if (id === 771 || id === 781) kind = "wind";
  else if (id >= 700 && id < 800) kind = "fog";
  else if (id === 800) kind = "clear";
  else if (id === 801 || id === 802) kind = "partly";
  else if (id === 804) kind = "overcast";
  return { kind, night };
}

const THEME_BY_KIND = {
  clear: "clear",
  partly: "clear",
  cloudy: "cloudy",
  overcast: "cloudy",
  wind: "cloudy",
  drizzle: "rain",
  rain: "rain",
  heavyRain: "rain",
  sleet: "snow",
  snow: "snow",
  fog: "fog",
  haze: "fog",
  smoke: "fog",
  dust: "dust",
};

export function getTheme({ kind, night }) {
  if (kind === "thunder") return "storm";
  return `${THEME_BY_KIND[kind] ?? "cloudy"}-${night ? "night" : "day"}`;
}

export const capitalize = (text, lang) =>
  text ? text.charAt(0).toLocaleUpperCase(lang) + text.slice(1) : "";

const toUnitTemp = (celsius, units) => (units === "imperial" ? (celsius * 9) / 5 + 32 : celsius);

export const formatTemp = (celsius, units) => `${Math.round(toUnitTemp(celsius, units))}°`;

function formatDecimal(value, lang) {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: value >= 10 ? 0 : 1 }).format(value);
}

export function formatWind(ms, units) {
  return units === "imperial"
    ? { value: Math.round(ms * 2.23694), unit: "mph" }
    : { value: Math.round(ms), unit: "m/s" };
}

export function formatVisibility(meters, units, lang) {
  return units === "imperial"
    ? { value: formatDecimal(meters / 1609.344, lang), unit: "mi" }
    : { value: formatDecimal(meters / 1000, lang), unit: "km" };
}

// Azerbaijani forecasts traditionally quote pressure in millimetres of mercury.
export function formatPressure(hpa, units, lang) {
  if (units === "imperial") return { value: (hpa * 0.02953).toFixed(2), unit: "inHg" };
  if (lang === "az") return { value: Math.round(hpa * 0.750062), unit: "mm c.s." };
  return { value: Math.round(hpa), unit: "hPa" };
}

export const windDirectionIndex = (deg) => Math.round((((deg % 360) + 360) % 360) / 45) % 8;

export function windLevel(ms) {
  if (ms < 0.5) return "calm";
  if (ms < 3.4) return "light";
  if (ms < 8) return "moderate";
  if (ms < 13.9) return "strong";
  return "severe";
}

export function pressureLevel(hpa) {
  if (hpa < 1000) return "low";
  if (hpa > 1025) return "high";
  return "normal";
}

export function visibilityLevel(meters) {
  if (meters >= 10000) return "great";
  if (meters >= 5000) return "good";
  if (meters >= 1000) return "moderate";
  return "poor";
}

export function feelsLikeHint(temp, feels) {
  const diff = feels - temp;
  if (diff >= 2) return "feelsWarmer";
  if (diff <= -2) return "feelsColder";
  return "feelsSimilar";
}

// Magnus formula, accurate to ~0.4°C for normal weather ranges.
export function dewPoint(temp, humidity) {
  if (!humidity) return null;
  const a = 17.62;
  const b = 243.12;
  const gamma = Math.log(humidity / 100) + (a * temp) / (b + temp);
  return (b * gamma) / (a - gamma);
}

// Diverging scale: cold blues and warm oranges/reds around a neutral 15°C midpoint.
const TEMP_STOPS = [
  [-20, [37, 99, 235]],
  [0, [96, 165, 250]],
  [15, [226, 232, 240]],
  [27, [251, 146, 60]],
  [40, [220, 38, 38]],
];

export function tempColor(celsius) {
  if (celsius <= TEMP_STOPS[0][0]) return `rgb(${TEMP_STOPS[0][1].join(",")})`;
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [t1, c1] = TEMP_STOPS[i];
    if (celsius <= t1) {
      const [t0, c0] = TEMP_STOPS[i - 1];
      const k = (celsius - t0) / (t1 - t0);
      return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(",")})`;
    }
  }
  return `rgb(${TEMP_STOPS[TEMP_STOPS.length - 1][1].join(",")})`;
}

const pickCondition = (item) => ({ id: item.weather[0].id, icon: item.weather[0].icon });

function middayItem(items, tzOffset) {
  let best = null;
  let bestDiff = Infinity;
  for (const item of items) {
    const diff = Math.abs(cityDate(item.dt, tzOffset).getUTCHours() - 13);
    if (diff < bestDiff) {
      best = item;
      bestDiff = diff;
    }
  }
  return best;
}

export function buildForecast(current, forecast) {
  const tz = forecast.city.timezone;

  const hourly = [
    { key: "now", now: true, dt: current.dt, temp: current.main.temp, pop: 0, ...pickCondition(current) },
    ...forecast.list.slice(0, 8).map((item) => ({
      key: item.dt,
      dt: item.dt,
      temp: item.main.temp,
      pop: item.pop ?? 0,
      ...pickCondition(item),
    })),
  ];

  const groups = new Map();
  for (const item of forecast.list) {
    const key = dateKey(item.dt, tz);
    if (!groups.has(key)) groups.set(key, { key, dt: item.dt, items: [] });
    groups.get(key).items.push(item);
  }

  // Late in the evening the forecast may already start tomorrow.
  const todayKey = dateKey(current.dt, tz);
  if (!groups.has(todayKey)) {
    groups.set(todayKey, { key: todayKey, dt: current.dt, items: [] });
  }

  const daily = [...groups.values()]
    .sort((a, b) => a.dt - b.dt)
    .slice(0, 5)
    .map((group) => {
      const isToday = group.key === todayKey;
      const temps = group.items.flatMap((item) => [item.main.temp_min, item.main.temp_max]);
      if (isToday) temps.push(current.main.temp);
      const midday = middayItem(group.items, tz);
      const condition = midday ? pickCondition(midday) : pickCondition(current);
      return {
        key: group.key,
        dt: group.dt,
        isToday,
        min: Math.min(...temps),
        max: Math.max(...temps),
        pop: Math.max(0, ...group.items.map((item) => item.pop ?? 0)),
        id: condition.id,
        icon: condition.icon.replace("n", "d"),
      };
    });

  const lo = Math.min(...daily.map((d) => d.min));
  const hi = Math.max(...daily.map((d) => d.max));

  return { hourly, daily, range: { lo, hi } };
}
