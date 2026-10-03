import { useSettings } from "../lib/settings";
import { cityDate, formatTemp, tempColor } from "../lib/weather";
import { CalendarIcon } from "./Icons";
import WeatherIcon from "./WeatherIcon";

function RangeBar({ min, max, lo, hi, current }) {
  const span = hi - lo || 1;
  const left = ((min - lo) / span) * 100;
  const width = Math.max(((max - min) / span) * 100, 6);
  return (
    <div className="relative h-1.5 min-w-[3rem] flex-1 rounded-full bg-white/20" aria-hidden="true">
      <div
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${Math.min(left, 100 - width)}%`,
          width: `${width}%`,
          background: `linear-gradient(90deg, ${tempColor(min)}, ${tempColor(max)})`,
        }}
      />
      {current !== undefined && (
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-slate-900/50"
          style={{ left: `${((current - lo) / span) * 100}%` }}
        />
      )}
    </div>
  );
}

export default function DailyForecast({ days, range, tz, currentTemp, className = "" }) {
  const { t, units, strings } = useSettings();

  return (
    <section aria-labelledby="daily-title" className={`card p-4 sm:p-5 ${className}`}>
      <h2 id="daily-title" className="section-title">
        <CalendarIcon className="h-4 w-4" />
        {t("daily")}
      </h2>
      <ul className="mt-1 divide-y divide-white/10">
        {days.map((day) => {
          const weekday = cityDate(day.dt, tz).getUTCDay();
          return (
            <li key={day.key} className="flex items-center gap-2 py-2.5 sm:gap-3">
              <span className="w-16 shrink-0 text-sm font-medium sm:w-32 sm:text-base lg:w-[7.5rem] lg:text-sm">
                {day.isToday ? (
                  t("today")
                ) : (
                  <>
                    <span className="sm:hidden">{strings.daysShort[weekday]}</span>
                    <span className="hidden sm:inline">{strings.days[weekday]}</span>
                  </>
                )}
              </span>
              <div className="flex w-10 shrink-0 flex-col items-center">
                <WeatherIcon id={day.id} icon={day.icon} animated={false} className="h-8 w-8" />
                {day.pop >= 0.1 && (
                  <span className="text-[11px] font-medium leading-none text-sky-200">{Math.round(day.pop * 100)}%</span>
                )}
              </div>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-white/70">{formatTemp(day.min, units)}</span>
              <RangeBar
                min={day.min}
                max={day.max}
                lo={range.lo}
                hi={range.hi}
                current={day.isToday ? currentTemp : undefined}
              />
              <span className="w-10 shrink-0 text-sm font-semibold tabular-nums">{formatTemp(day.max, units)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
