import { describeError } from "../lib/errors";
import { displayName, POPULAR_CITIES } from "../lib/locations";
import { useSettings } from "../lib/settings";
import { AlertIcon, LocateIcon, RefreshIcon, Spinner, XIcon } from "./Icons";
import WeatherIcon from "./WeatherIcon";

export function EmptyState({ onSelect, onLocate, locating }) {
  const { t, lang } = useSettings();
  return (
    <section className="card mx-auto max-w-xl px-6 py-10 text-center sm:px-10">
      <WeatherIcon id={801} icon="02d" className="mx-auto h-28 w-28 drop-shadow-2xl" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{t("welcomeTitle")}</h1>
      <p className="mt-2 text-white/80">{t("welcomeText")}</p>
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-slate-900 shadow-lg transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:cursor-wait"
      >
        {locating ? <Spinner className="h-5 w-5" /> : <LocateIcon className="h-5 w-5" />}
        {t("locate")}
      </button>
      <div className="mt-8">
        <p className="text-sm text-white/70">{t("popular")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelect(city)}
              className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset ring-white/20 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {displayName(city, lang)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonBar({ className }) {
  return <div className={`rounded-full bg-white/20 ${className}`} />;
}

export function LoadingState() {
  const { t } = useSettings();
  return (
    <div role="status" aria-label={t("loading")} className="grid animate-pulse grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="card space-y-4 p-6 lg:col-span-3">
        <SkeletonBar className="h-7 w-40" />
        <SkeletonBar className="h-4 w-56" />
        <div className="flex items-center justify-between pt-6">
          <SkeletonBar className="h-20 w-36" />
          <div className="h-28 w-28 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="card space-y-5 p-6 lg:col-span-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonBar key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="card h-36 lg:col-span-5" />
    </div>
  );
}

export function ErrorState({ error, onRetry, onDismiss, compact = false }) {
  const { t } = useSettings();
  const { code, title, hint } = describeError(error, t);
  const canRetry = onRetry && code !== "missingKey";

  if (compact) {
    return (
      <div role="alert" className="card flex items-start gap-3 px-4 py-3">
        <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <p className="flex-1 text-sm">
          <span className="font-semibold">{title}.</span> <span className="text-white/80">{hint}</span>
        </p>
        {canRetry && (
          <button type="button" onClick={onRetry} className="shrink-0 text-sm font-semibold underline-offset-2 hover:underline">
            {t("retry")}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("dismiss")}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <section role="alert" className="card mx-auto max-w-xl px-6 py-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10">
        <AlertIcon className="h-7 w-7 text-amber-300" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-white/80">{hint}</p>
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-slate-900 shadow-lg transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
        >
          <RefreshIcon className="h-4 w-4" />
          {t("retry")}
        </button>
      )}
    </section>
  );
}
