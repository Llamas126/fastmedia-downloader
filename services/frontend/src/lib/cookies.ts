// Utilidades nativas de cookies (cero dependencias) con respaldo en
// localStorage por si el navegador rechaza cookies de terceros o el usuario
// navega en modo privado con proteccion estricta.

export const COOKIE_NAMES = {
  consent: "fm_consent",
  lang: "fm_lang",
  session: "fm_session",
} as const;

const CONSENT_MAX_AGE_DAYS = 400;
const SESSION_MAX_AGE_DAYS = 30;

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* almacenamiento local no disponible (modo privado/quotas) */
  }
}

function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* almacenamiento local no disponible */
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    let entry = part;
    while (entry.startsWith(" ")) entry = entry.slice(1);
    if (entry.startsWith(prefix)) return decodeURIComponent(entry.slice(prefix.length));
  }
  return null;
}

export interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  /** False permite que scripts del mismo origen lean la cookie (necesario para fm_consent/fm_lang). */
  httpOnly?: boolean;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === "undefined") return;
  const { days, path = "/", sameSite = "Lax", httpOnly } = options;
  const encoded = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  const segments = [encoded, `Path=${path}`, `SameSite=${sameSite}`];
  if (httpOnly) segments.push("HttpOnly");
  if (days != null) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    segments.push(`Expires=${expires.toUTCString()}`);
  } else {
    segments.push("Max-Age=31536000");
  }
  document.cookie = segments.join("; ");
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}

function lsKey(name: string): string {
  return `${name}__ls`;
}

export function getCookieOrStorage(name: string): string | null {
  return getCookie(name) ?? safeGetItem(lsKey(name));
}

export function setCookieAndStorage(name: string, value: string, options: CookieOptions = {}): void {
  setCookie(name, value, options);
  safeSetItem(lsKey(name), value);
}

export function deleteCookieAndStorage(name: string): void {
  deleteCookie(name);
  safeRemoveItem(lsKey(name));
}

// ---- Consentimiento ----

export type ConsentCategory = "functional" | "analytics" | "marketing";

export interface ConsentState {
  functional: true;
  analytics: boolean;
  marketing: boolean;
  version: number;
  /** Epoch en ms */
  decidedAt: number;
}

export const CONSENT_VERSION = 1;

export function isConsentState(value: unknown): value is ConsentState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.functional === true &&
    typeof v.analytics === "boolean" &&
    typeof v.marketing === "boolean" &&
    v.version === CONSENT_VERSION &&
    typeof v.decidedAt === "number"
  );
}

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isConsentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  return parseConsent(getCookieOrStorage(COOKIE_NAMES.consent));
}

export function buildConsent(analytics: boolean, marketing: boolean): ConsentState {
  return {
    functional: true,
    analytics,
    marketing,
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
  };
}

export function saveConsent(state: ConsentState): void {
  setCookieAndStorage(COOKIE_NAMES.consent, JSON.stringify(state), {
    days: CONSENT_MAX_AGE_DAYS,
  });
}

export function clearConsent(): void {
  deleteCookieAndStorage(COOKIE_NAMES.consent);
}

// ---- Funcional: idioma ----

export function readPersistedLocale(): string | null {
  if (typeof window === "undefined") return null;
  return getCookieOrStorage(COOKIE_NAMES.lang);
}

export function saveLocale(locale: string): void {
  // Solo se persiste tras existir consentimiento (categoria "functional").
  if (typeof window === "undefined") return;
  if (!readConsent()) return;
  setCookieAndStorage(COOKIE_NAMES.lang, locale, { days: CONSENT_MAX_AGE_DAYS });
}

// ---- Session marker ----

export function markSession(): void {
  if (typeof window === "undefined") return;
  if (getCookie(COOKIE_NAMES.session)) return;
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  setCookie(COOKIE_NAMES.session, nonce, { days: SESSION_MAX_AGE_DAYS });
}