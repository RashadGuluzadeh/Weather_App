import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchCities } from "../lib/api";
import { describeError } from "../lib/errors";
import { countryName, dedupeLocations, displayName, locationFromGeo } from "../lib/locations";
import { useSettings } from "../lib/settings";
import { LocateIcon, MapPinIcon, SearchIcon, Spinner, XIcon } from "./Icons";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

const isTyping = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

export default function SearchBar({ onSelect, onLocate, locating }) {
  const { t, lang } = useSettings();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState({ q: "", items: [], status: "idle", error: null });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const cache = useRef(new Map());
  const requestId = useRef(0);
  const latestQuery = useRef("");
  const inputId = useId();
  const listId = useId();
  const q = query.trim();

  // Responses that arrive after a newer search started are dropped.
  const runSearch = useCallback(async (text) => {
    const id = ++requestId.current;
    const key = text.toLowerCase();
    let items = cache.current.get(key);
    if (!items) {
      setSearch((s) => ({ ...s, status: "loading" }));
      try {
        items = dedupeLocations((await searchCities(text)).map(locationFromGeo));
        cache.current.set(key, items);
      } catch (error) {
        if (id === requestId.current) setSearch({ q: text, items: [], status: "error", error });
        return null;
      }
    }
    if (id !== requestId.current) return null;
    setSearch({ q: text, items, status: "done", error: null });
    return items;
  }, []);

  useEffect(() => {
    if (q.length < MIN_QUERY) {
      requestId.current++;
      setSearch({ q: "", items: [], status: "idle", error: null });
      return undefined;
    }
    const timer = setTimeout(() => runSearch(q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q, runSearch]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const choose = (location) => {
    onSelect(location);
    setQuery("");
    latestQuery.current = "";
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
  };

  const items = search.items;
  const fresh = search.q === q;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return choose(items[active]);
    if (fresh && items.length) return choose(items[0]);
    if (q.length < MIN_QUERY) return;
    setOpen(true);
    const result = await runSearch(q);
    if (result?.length && latestQuery.current.trim() === q) choose(result[0]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else setQuery("");
    }
  };

  const showPanel = open && q.length >= MIN_QUERY;
  const showList = showPanel && items.length > 0;
  let message = null;
  if (showPanel && !showList) {
    if (fresh && search.status === "error") {
      const { title, hint } = describeError(search.error, t);
      message = (
        <>
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-white/70">{hint}</p>
        </>
      );
    } else if (fresh && search.status === "done") {
      message = t("noResults", { q });
    } else {
      message = t("searching");
    }
  }

  return (
    <div ref={boxRef} className="relative z-30 mt-4">
      <form role="search" onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <label htmlFor={inputId} className="sr-only">
            {t("searchLabel")}
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 z-10 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck="false"
            enterKeyHint="search"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              latestQuery.current = e.target.value;
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-2xl bg-white/10 pl-12 pr-20 text-base text-white shadow-lg shadow-black/10 ring-1 ring-inset ring-white/20 backdrop-blur-xl transition placeholder:text-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {search.status === "loading" && q.length >= MIN_QUERY && <Spinner className="h-4 w-4 text-white/70" />}
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  latestQuery.current = "";
                  inputRef.current?.focus();
                }}
                aria-label={t("clear")}
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="mr-2 hidden rounded-md border border-white/20 px-1.5 text-xs text-white/60 sm:block">/</kbd>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          aria-label={t("locate")}
          title={t("locate")}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 shadow-lg shadow-black/10 ring-1 ring-inset ring-white/20 backdrop-blur-xl transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-wait"
        >
          {locating ? <Spinner /> : <LocateIcon />}
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-2xl bg-slate-900/90 py-1 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
        >
          {items.map((location, i) => (
            <li
              key={`${location.lat},${location.lon}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(location)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-white/10" : ""}`}
            >
              <MapPinIcon className="h-4 w-4 shrink-0 text-white/60" />
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName(location, lang)}</p>
                <p className="truncate text-sm text-white/60">
                  {[location.state, countryName(location.country, lang)].filter(Boolean).join(", ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <div
          role="status"
          className="absolute inset-x-0 top-full mt-2 rounded-2xl bg-slate-900/90 px-4 py-3 text-sm shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
        >
          {message}
        </div>
      )}
    </div>
  );
}
