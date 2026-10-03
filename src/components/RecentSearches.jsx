import { displayName, sameLocation } from "../lib/locations";
import { useSettings } from "../lib/settings";
import { HistoryIcon, XIcon } from "./Icons";

export default function RecentSearches({ items, current, onSelect, onRemove }) {
  const { t, lang } = useSettings();
  if (!items.length) return null;

  return (
    <nav aria-label={t("recent")} className="scrollbar-none -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <HistoryIcon className="h-4 w-4 shrink-0 text-white/60" />
      {items.map((location) => {
        const name = displayName(location, lang);
        const selected = sameLocation(location, current);
        return (
          <span
            key={`${location.lat},${location.lon}`}
            className={`flex shrink-0 items-center rounded-full ring-1 ring-inset transition ${
              selected ? "bg-white text-slate-900 ring-white" : "bg-white/10 ring-white/20 hover:bg-white/20"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(location)}
              aria-current={selected ? "true" : undefined}
              className="rounded-full py-1.5 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {name}
            </button>
            <button
              type="button"
              onClick={() => onRemove(location)}
              aria-label={t("removeRecent", { city: name })}
              className="mr-1 grid h-6 w-6 place-items-center rounded-full opacity-60 transition hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        );
      })}
    </nav>
  );
}
