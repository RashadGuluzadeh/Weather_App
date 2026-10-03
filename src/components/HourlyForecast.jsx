import { useSettings } from "../lib/settings";
import { formatClock, formatTemp } from "../lib/weather";
import { ClockIcon, DropletIcon } from "./Icons";
import WeatherIcon from "./WeatherIcon";

export default function HourlyForecast({ items, tz, className = "" }) {
  const { t, units } = useSettings();

  return (
    <section aria-labelledby="hourly-title" className={`card p-4 sm:p-5 ${className}`}>
      <h2 id="hourly-title" className="section-title">
        <ClockIcon className="h-4 w-4" />
        {t("hourly")}
      </h2>
      <ol className="scrollbar-thin -mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {items.map((hour) => (
          <li
            key={hour.key}
            className={`flex min-w-[4.5rem] flex-1 snap-start flex-col items-center gap-1.5 rounded-2xl px-2 py-3 ${
              hour.now ? "bg-white/20 ring-1 ring-inset ring-white/20" : "bg-white/5"
            }`}
          >
            <span className="text-xs font-medium text-white/80">{hour.now ? t("now") : formatClock(hour.dt, tz)}</span>
            <WeatherIcon id={hour.id} icon={hour.icon} animated={false} className="h-10 w-10" />
            <span className="text-base font-semibold">{formatTemp(hour.temp, units)}</span>
            <span className="flex h-4 items-center gap-0.5 text-[11px] font-medium text-sky-200">
              {hour.pop >= 0.1 && (
                <>
                  <DropletIcon className="h-3 w-3" />
                  {Math.round(hour.pop * 100)}%
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
