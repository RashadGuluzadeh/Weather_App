import { useSettings } from "../lib/settings";
import WeatherIcon from "./WeatherIcon";

function Segmented({ label, value, options, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full bg-white/10 p-1 ring-1 ring-inset ring-white/20 backdrop-blur-xl">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              selected ? "bg-white text-slate-900 shadow" : "text-white/80 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Header({ onLangChange, onUnitsChange }) {
  const { t, lang, units } = useSettings();
  return (
    <header className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2">
        <WeatherIcon id={801} icon="02d" animated={false} className="h-9 w-9" />
        <span className="text-xl font-semibold tracking-tight">{t("appName")}</span>
      </div>
      <div className="flex items-center gap-2">
        <Segmented
          label={t("language")}
          value={lang}
          onChange={onLangChange}
          options={[
            { value: "az", label: "AZ" },
            { value: "en", label: "EN" },
          ]}
        />
        <Segmented
          label={t("units")}
          value={units}
          onChange={onUnitsChange}
          options={[
            { value: "metric", label: "°C" },
            { value: "imperial", label: "°F" },
          ]}
        />
      </div>
    </header>
  );
}
