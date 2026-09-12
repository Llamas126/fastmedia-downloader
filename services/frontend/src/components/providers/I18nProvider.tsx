"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - I18n Provider                          |
// |                                                                 |
// |   Sin dependencias: idioma detectado via navigator.language(s), |
// |   persistido en cookie funcional SOLO despues del consentimiento|
// |   (ver lib/cookies).                                            |
// \_________________________________________________________________/

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEFAULT_LOCALE,
  detectLocale,
  LOCALE_META,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/locales";
import { getDictionary, translate } from "@/lib/i18n/dictionary";
import { readPersistedLocale, saveLocale } from "@/lib/cookies";
import { useConsent } from "@/components/providers/ConsentProvider";
import type { Dict } from "@/lib/i18n/dictionaries/dict_lang1";

type TranslateVars = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: TranslateVars) => string;
  dict: Dict;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { state: consent } = useConsent();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const persisted = readPersistedLocale();
    const initial = normalizeLocale(persisted) ?? detectLocale();
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    const meta = LOCALE_META[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      if (consent) saveLocale(next);
    },
    [consent],
  );

  const dict = getDictionary(locale);
  const dir = LOCALE_META[locale].dir;
  const isRTL = dir === "rtl";

  const t = useCallback(
    (key: string, vars?: TranslateVars) => translate(dict, key as keyof Dict, vars),
    [dict],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict, dir, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  }
  return context;
}