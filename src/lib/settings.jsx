import { createContext, useContext, useMemo } from "react";
import { STRINGS, translate } from "./i18n";

const SettingsContext = createContext(null);

export function SettingsProvider({ lang, units, children }) {
  const value = useMemo(
    () => ({
      lang,
      units,
      strings: STRINGS[lang],
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, units]
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
