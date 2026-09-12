// Locales soportados por FastMedia Downloader.
// Evaluacion por prefijo (navigator.language(s)): "pt-BR" -> "pt", "zh-Hans" -> "zh".

export const SUPPORTED_LOCALES = [
  "es",
  "en",
  "pt",
  "fr",
  "de",
  "it",
  "nl",
  "pl",
  "sv",
  "da",
  "no",
  "fi",
  "el",
  "uk",
  "ru",
  "cs",
  "sk",
  "sl",
  "hr",
  "sr",
  "bg",
  "ro",
  "hu",
  "lt",
  "lv",
  "et",
  "ar",
  "he",
  "fa",
  "tr",
  "ka",
  "hy",
  "hi",
  "ur",
  "mr",
  "ta",
  "te",
  "bn",
  "pa",
  "gu",
  "kn",
  "ml",
  "ne",
  "si",
  "zh",
  "ja",
  "ko",
  "vi",
  "th",
  "id",
  "ms",
  "mn",
  "my",
  "km",
  "lo",
  "sw",
  "af",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  const base = value.split("-")[0].toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(base);
}

export const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(["ar", "he", "fa", "ur"]);

export const DEFAULT_LOCALE: Locale = "es";
export const FALLBACK_LOCALE: Locale = "en";

// El valor SSR/base (HTML prerenderizado sin JS) queda en espanol; el cliente
// aplica el idioma detectado/persistido despues del primer render.
export const SSR_LOCALE: Locale = DEFAULT_LOCALE;

export const LOCALE_META: Record<Locale, { name: string; dir: "ltr" | "rtl" }> = {
  es: { name: "Español", dir: "ltr" },
  en: { name: "English", dir: "ltr" },
  pt: { name: "Português", dir: "ltr" },
  fr: { name: "Français", dir: "ltr" },
  de: { name: "Deutsch", dir: "ltr" },
  it: { name: "Italiano", dir: "ltr" },
  nl: { name: "Nederlands", dir: "ltr" },
  pl: { name: "Polski", dir: "ltr" },
  sv: { name: "Svenska", dir: "ltr" },
  da: { name: "Dansk", dir: "ltr" },
  no: { name: "Norsk", dir: "ltr" },
  fi: { name: "Suomi", dir: "ltr" },
  el: { name: "Ελληνικά", dir: "ltr" },
  uk: { name: "Українська", dir: "ltr" },
  ru: { name: "Русский", dir: "ltr" },
  cs: { name: "Čeština", dir: "ltr" },
  sk: { name: "Slovenčina", dir: "ltr" },
  sl: { name: "Slovenščina", dir: "ltr" },
  hr: { name: "Hrvatski", dir: "ltr" },
  sr: { name: "Српски", dir: "ltr" },
  bg: { name: "Български", dir: "ltr" },
  ro: { name: "Română", dir: "ltr" },
  hu: { name: "Magyar", dir: "ltr" },
  lt: { name: "Lietuvių", dir: "ltr" },
  lv: { name: "Latviešu", dir: "ltr" },
  et: { name: "Eesti", dir: "ltr" },
  ar: { name: "العربية", dir: "rtl" },
  he: { name: "עברית", dir: "rtl" },
  fa: { name: "فارسی", dir: "rtl" },
  tr: { name: "Türkçe", dir: "ltr" },
  ka: { name: "ქართული", dir: "ltr" },
  hy: { name: "Հայերեն", dir: "ltr" },
  hi: { name: "हिन्दी", dir: "ltr" },
  ur: { name: "اردو", dir: "rtl" },
  mr: { name: "मराठी", dir: "ltr" },
  ta: { name: "தமிழ்", dir: "ltr" },
  te: { name: "తెలుగు", dir: "ltr" },
  bn: { name: "বাংলা", dir: "ltr" },
  pa: { name: "ਪੰਜਾਬੀ", dir: "ltr" },
  gu: { name: "ગુજરાતી", dir: "ltr" },
  kn: { name: "ಕನ್ನಡ", dir: "ltr" },
  ml: { name: "മലയാളം", dir: "ltr" },
  ne: { name: "नेपाली", dir: "ltr" },
  si: { name: "සිංහල", dir: "ltr" },
  zh: { name: "中文", dir: "ltr" },
  ja: { name: "日本語", dir: "ltr" },
  ko: { name: "한국어", dir: "ltr" },
  vi: { name: "Tiếng Việt", dir: "ltr" },
  th: { name: "ไทย", dir: "ltr" },
  id: { name: "Bahasa Indonesia", dir: "ltr" },
  ms: { name: "Bahasa Melayu", dir: "ltr" },
  mn: { name: "Монгол", dir: "ltr" },
  my: { name: "မြန်မာ", dir: "ltr" },
  km: { name: "ខ្មែរ", dir: "ltr" },
  lo: { name: "ລາວ", dir: "ltr" },
  sw: { name: "Kiswahili", dir: "ltr" },
  af: { name: "Afrikaans", dir: "ltr" },
};

export function normalizeLocale(raw: string | null | undefined): Locale | null {
  if (!raw) return null;
  const base = raw.split("-")[0].toLowerCase();
  if (isLocale(base)) return base;
  return null;
}

// Detecta el idioma del navegador probando cada idioma preferido en orden.
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return SSR_LOCALE;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of candidates) {
    const match = normalizeLocale(tag);
    if (match) return match;
  }
  return FALLBACK_LOCALE;
}