// Merga de diccionarios y helper de traduccion con interpolacion de tokens {token}.

import type { Locale } from "./locales";
import { FALLBACK_LOCALE } from "./locales";
import { es, en, pt, fr, de, it } from "./dictionaries/dict_lang1";
import { nl, pl, sv, da, no, fi, el } from "./dictionaries/dict_lang2";
import { uk, ru, cs, sk, sl, hr, sr, bg, ro, hu, lt, lv, et } from "./dictionaries/dict_lang3";
import { ar, he, fa, tr, ka, hy } from "./dictionaries/dict_lang4";
import { hi, ur, mr, ta, te, bn, pa, gu, kn, ml, ne, si } from "./dictionaries/dict_lang5";
import { zh, ja, ko, vi, th, id, ms, mn, my, km, lo, sw, af } from "./dictionaries/dict_lang6";
import type { Dict } from "./dictionaries/dict_lang1";

export const DICTIONARIES: Record<Locale, Dict> = {
  es,
  en,
  pt,
  fr,
  de,
  it,
  nl,
  pl,
  sv,
  da,
  no,
  fi,
  el,
  uk,
  ru,
  cs,
  sk,
  sl,
  hr,
  sr,
  bg,
  ro,
  hu,
  lt,
  lv,
  et,
  ar,
  he,
  fa,
  tr,
  ka,
  hy,
  hi,
  ur,
  mr,
  ta,
  te,
  bn,
  pa,
  gu,
  kn,
  ml,
  ne,
  si,
  zh,
  ja,
  ko,
  vi,
  th,
  id,
  ms,
  mn,
  my,
  km,
  lo,
  sw,
  af,
};

export function getDictionary(locale: Locale): Dict {
  return DICTIONARIES[locale] ?? DICTIONARIES[FALLBACK_LOCALE];
}

const TOKEN_RE = /\{(\w+)\}/g;

export function translate(dict: Dict, key: keyof Dict, vars?: Record<string, string | number>): string {
  let text = dict[key];
  if (text == null) text = DICTIONARIES[FALLBACK_LOCALE][key];
  if (vars) {
    text = text.replace(TOKEN_RE, (match, name: string) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
    );
  }
  return text;
}