import { useCallback, useEffect, useMemo, useState } from "react";
import Background from "./components/Background";
import CurrentWeather from "./components/CurrentWeather";
import DailyForecast from "./components/DailyForecast";
import Header from "./components/Header";
import HourlyForecast from "./components/HourlyForecast";
import RecentSearches from "./components/RecentSearches";
import SearchBar from "./components/SearchBar";
import { EmptyState, ErrorState, LoadingState } from "./components/States";
import WeatherDetails from "./components/WeatherDetails";
import { useNow } from "./hooks/useNow";
import { usePersistentState } from "./hooks/usePersistentState";
import { fetchWeather } from "./lib/api";
import { detectLang, translate } from "./lib/i18n";
import { addRecent, gpsLocation, isLocation, placeName, removeRecent, sameLocation } from "./lib/locations";
import { SettingsProvider } from "./lib/settings";
import { buildForecast, formatTemp, getCondition, getTheme } from "./lib/weather";

const STALE_AFTER_MS = 10 * 60 * 1000;

const isLang = (v) => v === "az" || v === "en";
const isUnits = (v) => v === "metric" || v === "imperial";
const isLocationList = (v) => Array.isArray(v) && v.every(isLocation);
const isLocationOrNull = (v) => v === null || isLocation(v);

const App = () => {
  const [lang, setLang] = usePersistentState("hava:lang", detectLang, isLang);
  const [units, setUnits] = usePersistentState("hava:units", "metric", isUnits);
  const [recents, setRecents] = usePersistentState("hava:recents", [], isLocationList);
  const [location, setLocation] = usePersistentState("hava:location", null, isLocationOrNull);
  const [weather, setWeather] = useState({ status: "idle", data: null, error: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const now = useNow(30_000);

  // Refetch only when the coordinates change, not when the stored name is updated.
  const locationKey = location ? `${location.lat},${location.lon}` : null;

  useEffect(() => {
    if (!location) return undefined;
    const controller = new AbortController();
    setWeather((prev) => ({ ...prev, status: "loading", error: null }));
    fetchWeather(location, lang, controller.signal)
      .then((data) => {
        setWeather({ status: "success", data: { ...data, location }, error: null });
        setRecents((prev) =>
          addRecent(prev, {
            ...location,
            name: location.name || data.current.name,
            country: location.country || data.current.sys.country,
          })
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setWeather((prev) => ({ ...prev, status: "error", error }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey, lang, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Coming back to a tab with old data triggers a refresh.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && weather.data && Date.now() - weather.data.fetchedAt > STALE_AFTER_MS) {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [weather.data, refresh]);

  const selectLocation = useCallback(
    (next) => {
      setGeoError(null);
      setLocation(next);
    },
    [setLocation]
  );

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError({ code: "geoUnavailable" });
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setLocation(gpsLocation(position.coords));
      },
      (err) => {
        setLocating(false);
        setGeoError({ code: err.code === err.PERMISSION_DENIED ? "geoDenied" : "geoUnavailable" });
      },
      { timeout: 10_000, maximumAge: STALE_AFTER_MS }
    );
  }, [setLocation]);

  const data = weather.data;
  const hasData = !!data && sameLocation(data.location, location);
  const forecast = useMemo(() => (data ? buildForecast(data.current, data.forecast) : null), [data]);
  const theme = hasData ? getTheme(getCondition(data.current.weather[0].id, data.current.weather[0].icon)) : "default";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const appName = translate(lang, "appName");
    document.title = hasData
      ? `${placeName(location, data.current, lang)} ${formatTemp(data.current.main.temp, units)} · ${appName}`
      : appName;
  }, [hasData, data, location, lang, units]);

  let content;
  if (!location) {
    content = <EmptyState onSelect={selectLocation} onLocate={locate} locating={locating} />;
  } else if (hasData) {
    content = (
      <div key={locationKey} className="space-y-4 motion-safe:animate-fade-in-up">
        {weather.status === "error" && <ErrorState compact error={weather.error} onRetry={refresh} />}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <CurrentWeather
            className="lg:col-span-3 lg:row-start-1"
            current={data.current}
            location={location}
            today={forecast.daily[0]}
            fetchedAt={data.fetchedAt}
            now={now}
            refreshing={weather.status === "loading"}
            onRefresh={refresh}
          />
          <HourlyForecast className="lg:col-span-5" items={forecast.hourly} tz={data.current.timezone} />
          <DailyForecast
            className="lg:col-span-2 lg:col-start-4 lg:row-start-1"
            days={forecast.daily}
            range={forecast.range}
            tz={data.current.timezone}
            currentTemp={data.current.main.temp}
          />
          <WeatherDetails className="lg:col-span-5" current={data.current} now={now} />
        </div>
      </div>
    );
  } else if (weather.status === "error") {
    content = <ErrorState error={weather.error} onRetry={refresh} />;
  } else {
    content = <LoadingState />;
  }

  return (
    <SettingsProvider lang={lang} units={units}>
      <Background theme={theme} />
      <div className="relative min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-6 pt-3 sm:px-6 sm:pt-5">
          <Header onLangChange={setLang} onUnitsChange={setUnits} />
          <SearchBar onSelect={selectLocation} onLocate={locate} locating={locating} />
          <RecentSearches
            items={recents}
            current={location}
            onSelect={selectLocation}
            onRemove={(loc) => setRecents((prev) => removeRecent(prev, loc))}
          />
          {geoError && (
            <div className="mt-3">
              <ErrorState compact error={geoError} onDismiss={() => setGeoError(null)} />
            </div>
          )}
          <main className="mt-6 flex-1">{content}</main>
          <footer className="mt-10 text-center text-xs text-white/60">
            {translate(lang, "dataBy")}{" "}
            <a
              href="https://openweathermap.org/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              OpenWeatherMap
            </a>
          </footer>
        </div>
      </div>
    </SettingsProvider>
  );
};

export default App;
