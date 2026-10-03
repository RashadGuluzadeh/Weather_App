import { countryName, placeName } from "../lib/locations";
import { useSettings } from "../lib/settings";
import { capitalize, cityDate, formatClock, formatTemp } from "../lib/weather";
import { NavigationIcon, RefreshIcon } from "./Icons";
import WeatherIcon from "./WeatherIcon";

function formatAgo(ms, t) {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { n: minutes });
  return t("hoursAgo", { n: Math.floor(minutes / 60) });
}

export default function CurrentWeather({ current, location, today, fetchedAt, now, refreshing, onRefresh, className = "" }) {
  const { t, lang, units, strings } = useSettings();
  const condition = current.weather[0];
  const tz = current.timezone;
  const nowSec = Math.floor(now / 1000);
  const local = cityDate(nowSec, tz);
  const region = [location.state, countryName(location.country || current.sys.country, lang)].filter(Boolean).join(", ");
  const dateLine = `${strings.days[local.getUTCDay()]}, ${local.getUTCDate()} ${strings.months[local.getUTCMonth()]} · ${formatClock(nowSec, tz)}`;
  const description = capitalize(condition.description, lang);

  return (
    <section aria-labelledby="current-title" className={`card flex flex-col p-5 sm:p-7 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 id="current-title" className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {location.gps && (
              <NavigationIcon className="h-5 w-5 shrink-0 text-white/80" aria-label={t("myLocation")} role="img" />
            )}
            <span className="truncate">{placeName(location, current, lang)}</span>
          </h1>
          {region && <p className="mt-1 text-sm text-white/80">{region}</p>}
          <p className="text-sm text-white/70">{dateLine}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title={t("refresh")}
          aria-label={`${t("refresh")} · ${t("updated", { ago: formatAgo(now - fetchedAt, t) })}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-white/70 ring-1 ring-inset ring-white/20 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait"
        >
          <RefreshIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{t("updated", { ago: formatAgo(now - fetchedAt, t) })}</span>
        </button>
      </div>

      <div className="mt-6 flex flex-1 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-7xl font-light leading-none tracking-tighter sm:text-8xl">
            {formatTemp(current.main.temp, units)}
          </p>
          <p className="mt-3 text-lg font-medium">{description}</p>
          <p className="mt-1 text-sm text-white/80">
            <span className="whitespace-nowrap">
              {t("feelsLike")} {formatTemp(current.main.feels_like, units)}
            </span>
            <span className="mx-2 text-white/40">·</span>
            <span className="whitespace-nowrap">
              ↑{formatTemp(today.max, units)} ↓{formatTemp(today.min, units)}
            </span>
          </p>
        </div>
        <WeatherIcon
          id={condition.id}
          icon={condition.icon}
          label={description}
          className="h-28 w-28 shrink-0 drop-shadow-2xl sm:h-40 sm:w-40"
        />
      </div>
    </section>
  );
}
