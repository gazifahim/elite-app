import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import translations from "./translations.js";

const LanguageContext = createContext(null);

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function LanguageProvider({ children }) {
  // Always starts in English
  const [lang, setLang] = useState("en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translations[lang].meta.title;
  }, [lang]);

  // t("nav.services") -> string | array | object (falls back to English)
  const t = useCallback((path) => {
    const walk = (obj) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
    const v = walk(translations[lang]);
    return v !== undefined ? v : walk(translations.en);
  }, [lang]);

  // Localise digits, e.g. n("4.7") -> "৪.৭" in Bengali
  const n = useCallback(
    (value) => (lang === "bn" ? String(value).replace(/\d/g, (d) => BN_DIGITS[d]) : String(value)),
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, n, toggle: () => setLang((l) => (l === "en" ? "bn" : "en")) }),
    [lang, t, n]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
