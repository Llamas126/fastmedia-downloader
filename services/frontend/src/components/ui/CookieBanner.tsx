"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - Banner de consentimiento de cookies    |
// |                                                                 |
// |   GDPR/CCPA: funcionales siempre activas; analitica y publicidad |
// |   solo si el usuario las acepta explicitamente.                 |
// \_________________________________________________________________/

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useConsent } from "@/components/providers/ConsentProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export default function CookieBanner() {
  const { bannerOpen, acceptAll, essentialOnly, savePreferences } = useConsent();
  const { t } = useI18n();
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (bannerOpen) setDismissed(false);
  }, [bannerOpen]);

  const openConfig = () => {
    // Al abrir la config partimos del rechazo por defecto (opt-in estricto).
    setAnalytics(false);
    setMarketing(false);
    setConfiguring(true);
  };

  const save = () => {
    savePreferences(analytics, marketing);
    setConfiguring(false);
    setAnnounce(t("cookieSavedAnnounce"));
    window.setTimeout(() => setAnnounce(""), 4000);
  };

  const closeAll = () => {
    setConfiguring(false);
    setDismissed(true);
  };

  if ((!bannerOpen || dismissed) && !announce) return null;

  return (
    <div aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {bannerOpen && (
          <motion.div
            key="cookie-banner"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-[75] p-3 sm:p-4"
          >
            <div
              role="dialog"
              aria-modal={configuring ? "true" : "false"}
              aria-label={t("cookieBannerTitle")}
              className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-[#151522]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-5 w-5 shrink-0 text-violet-300" aria-hidden />
                    <h2 className="text-sm font-semibold text-white">{t("cookieBannerTitle")}</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {configuring
                      ? t("cookieFunctional") + " · " + t("cookieFunctionalDesc")
                      : t("cookieBannerBody")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAll}
                  aria-label={t("cookieCloseAria")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              {configuring && (
                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="mt-0.5 h-4 w-4 accent-violet-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {t("cookieFunctional")}
                      </span>
                      <span className="block text-xs leading-relaxed text-slate-400">
                        {t("cookieFunctionalDesc")}
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(event) => setAnalytics(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-violet-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {t("cookieAnalytics")}
                      </span>
                      <span className="block text-xs leading-relaxed text-slate-400">
                        {t("cookieAnalyticsDesc")}
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(event) => setMarketing(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-violet-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {t("cookieMarketing")}
                      </span>
                      <span className="block text-xs leading-relaxed text-slate-400">
                        {t("cookieMarketingDesc")}
                      </span>
                    </span>
                  </label>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                {configuring ? (
                  <button
                    type="button"
                    onClick={save}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.98]"
                  >
                    {t("cookieSave")}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={openConfig}
                      className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                    >
                      {t("cookieConfigure")}
                    </button>
                    <button
                      type="button"
                      onClick={essentialOnly}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
                    >
                      {t("cookieEssential")}
                    </button>
                    <button
                      type="button"
                      onClick={acceptAll}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.98]"
                    >
                      {t("cookieAcceptAll")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {announce ? (
        <p aria-live="polite" role="status" className="sr-only">
          {announce}
        </p>
      ) : null}
    </div>
  );
}