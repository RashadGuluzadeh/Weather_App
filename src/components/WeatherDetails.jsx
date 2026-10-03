import { useSettings } from "../lib/settings";
import {
  dewPoint,
  feelsLikeHint,
  formatClock,
  formatPressure,
  formatTemp,
  formatVisibility,
  formatWind,
  pressureLevel,
  visibilityLevel,
  windDirectionIndex,
  windLevel,
} from "../lib/weather";
import { CloudIcon, DropletIcon, EyeIcon, GaugeIcon, NavigationIcon, SunIcon, ThermometerIcon, WindIcon } from "./Icons";

function Tile({ icon: Icon, label, value, unit, hint, children, className = "" }) {
  return (
    <div className={`card flex flex-col gap-2 p-4 ${className}`}>
      <p className="flex items-center gap-1.5 text-sm text-white/70">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      {value !== undefined && (
        <p className="text-2xl font-semibold">
          {value}
          {unit && <span className="ml-1 text-base font-medium text-white/70">{unit}</span>}
        </p>
      )}
      {children}
      {hint && <p className="mt-auto text-xs leading-snug text-white/70">{hint}</p>}
    </div>
  );
}

function Meter({ value }) {
  return (
    <div className="h-1.5 rounded-full bg-sky-200/20" aria-hidden="true">
      <div className="h-full rounded-full bg-sky-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function SunTile({ sunrise, sunset, tz, now, className }) {
  const { t } = useSettings();
  const valid = sunrise > 0 && sunset > sunrise;
  const nowSec = now / 1000;
  const progress = valid ? Math.min(1, Math.max(0, (nowSec - sunrise) / (sunset - sunrise))) : 0;
  const isDay = valid && nowSec >= sunrise && nowSec <= sunset;
  const angle = Math.PI * (1 - progress);
  const x = 60 + 46 * Math.cos(angle);
  const y = 52 - 46 * Math.sin(angle);
  const daylight = valid ? sunset - sunrise : 0;

  return (
    <div className={`card flex flex-col gap-2 p-4 ${className}`}>
      <p className="flex items-center gap-1.5 text-sm text-white/70">
        <SunIcon className="h-4 w-4" />
        {t("sun")}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-white/70">{t("sunrise")}</p>
          <p className="text-xl font-semibold tabular-nums">{valid ? formatClock(sunrise, tz) : "—"}</p>
        </div>
        <svg viewBox="0 0 120 58" className="h-14 max-w-[9rem] flex-1" aria-hidden="true">
          <path d="M14 52A46 46 0 0 1 106 52" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
          {isDay && <path d={`M14 52A46 46 0 0 1 ${x} ${y}`} fill="none" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" />}
          <path d="M4 52H116" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          {isDay && <circle cx={x} cy={y} r="5.5" fill="#FCD34D" stroke="rgba(15,23,42,0.4)" strokeWidth="2" />}
        </svg>
        <div className="text-right">
          <p className="text-xs text-white/70">{t("sunset")}</p>
          <p className="text-xl font-semibold tabular-nums">{valid ? formatClock(sunset, tz) : "—"}</p>
        </div>
      </div>
      {valid && (
        <p className="mt-auto text-xs text-white/70">
          {t("daylight", { h: Math.floor(daylight / 3600), m: Math.floor((daylight % 3600) / 60) })}
        </p>
      )}
    </div>
  );
}

export default function WeatherDetails({ current, now, className = "" }) {
  const { t, lang, units, strings } = useSettings();
  const { main, wind = {}, clouds = {}, visibility, sys, timezone } = current;
  const windSpeed = formatWind(wind.speed ?? 0, units);
  const gust = wind.gust ? formatWind(wind.gust, units) : null;
  const pressure = formatPressure(main.pressure, units, lang);
  const dew = dewPoint(main.temp, main.humidity);
  const hasDirection = Number.isFinite(wind.deg);

  return (
    <section aria-labelledby="details-title" className={className}>
      <h2 id="details-title" className="sr-only">
        {t("details")}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Tile
          icon={ThermometerIcon}
          label={t("feelsLike")}
          value={formatTemp(main.feels_like, units)}
          hint={t(feelsLikeHint(main.temp, main.feels_like))}
        />
        <Tile
          icon={DropletIcon}
          label={t("humidity")}
          value={main.humidity}
          unit="%"
          hint={dew !== null ? t("dewPoint", { v: formatTemp(dew, units) }) : undefined}
        >
          <Meter value={main.humidity} />
        </Tile>
        <Tile
          icon={WindIcon}
          label={t("wind")}
          hint={gust ? t("gusts", { v: `${gust.value} ${gust.unit}` }) : undefined}
        >
          <p className="flex items-center gap-2 text-2xl font-semibold">
            {windSpeed.value}
            <span className="-ml-1 text-base font-medium text-white/70">{windSpeed.unit}</span>
            {hasDirection && (
              <NavigationIcon className="h-5 w-5 text-white/80" style={{ transform: `rotate(${wind.deg + 180}deg)` }} />
            )}
          </p>
          <p className="text-xs text-white/70">
            {t(`windLevel.${windLevel(wind.speed ?? 0)}`)}
            {hasDirection && ` · ${strings.directions[windDirectionIndex(wind.deg)]}`}
          </p>
        </Tile>
        <Tile
          icon={GaugeIcon}
          label={t("pressure")}
          value={pressure.value}
          unit={pressure.unit}
          hint={t(`pressureLevel.${pressureLevel(main.pressure)}`)}
        />
        {Number.isFinite(visibility) && (
          <Tile
            icon={EyeIcon}
            label={t("visibility")}
            value={formatVisibility(visibility, units, lang).value}
            unit={formatVisibility(visibility, units, lang).unit}
            hint={t(`visibilityLevel.${visibilityLevel(visibility)}`)}
          />
        )}
        <Tile icon={CloudIcon} label={t("clouds")} value={clouds.all ?? 0} unit="%">
          <Meter value={clouds.all ?? 0} />
        </Tile>
        <SunTile
          sunrise={sys.sunrise}
          sunset={sys.sunset}
          tz={timezone}
          now={now}
          className="col-span-2 sm:col-span-3 lg:col-span-2"
        />
      </div>
    </section>
  );
}
