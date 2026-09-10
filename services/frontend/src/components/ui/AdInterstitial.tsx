"use client";

// Modal publicitario central: aparece al completar CADA descarga, centrado,
// con animacion de entrada/salida (backdrop fade + panel spring). El boton
// principal dispara la descarga del archivo (gesto de usuario confiable: no
// lo bloquean los navegadores) y luego cierra el modal.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Download, X } from "lucide-react";
import AdSlot, { adsEnabled } from "@/components/ui/AdSlot";
import { useConsent } from "@/components/providers/ConsentProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { modalBackdrop, modalPanel } from "@/lib/motion";

interface AdInterstitialProps {
  open: boolean;
  onClose: () => void;
  onPrimary?: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function AdInterstitial({ open, onClose, onPrimary }: AdInterstitialProps) {
  const { t } = useI18n();
  const { state: consent } = useConsent();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<Element | null>(null);

  const marketingAllowed = Boolean(consent?.marketing);
  const shouldRenderAd = adsEnabled() && marketingAllowed;

  const closeAndRestore = () => {
    onClose();
    const previous = lastActiveRef.current;
    if (previous instanceof HTMLElement) previous.focus();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      if (onPrimary) {
        panelRef.current?.querySelector<HTMLElement>("button[type='button']:not([aria-label])")?.focus();
      } else {
        panelRef.current?.querySelector<HTMLElement>("button[type='button']")?.focus();
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndRestore();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastActiveRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function renderSupportLink(template: string) {
    const parts = template.split(/(\{buy\}|\{github\})/g);
    return parts.map((part, index) => {
      if (part === "{buy}") {
        return (
          <a
            key={index}
            href="https://www.buymeacoffee.com/llamas126"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-300 hover:underline"
          >
            Buy Me a Coffee
          </a>
        );
      }
      if (part === "{github}") {
        return (
          <a
            key={index}
            href="https://github.com/sponsors/Llamas126"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-violet-300 hover:underline"
          >
            GitHub Sponsors
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("interstitialLabel")}
          aria-describedby="interstitial-description"
        >
          <motion.button
            type="button"
            aria-label={t("interstitialClose")}
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeAndRestore}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onKeyDown={handlePanelKeyDown}
            className="relative w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#151522] p-6 text-center shadow-2xl shadow-black/60 max-h-[85vh]"
          >
            <button
              type="button"
              onClick={closeAndRestore}
              aria-label={t("interstitialCloseAd")}
              className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <h3 className="text-lg font-semibold text-white">{t("interstitialTitle")}</h3>
            <p
              id="interstitial-description"
              className="mt-1 text-sm text-slate-400"
            >
              {t("interstitialBody")}
            </p>

            <div className="mt-4">
              {shouldRenderAd ? (
                <AdSlot variant="rectangle" />
              ) : (
                <div className="mx-auto mb-6 flex h-[250px] w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4">
                  <Coffee className="h-6 w-6 text-amber-300" aria-hidden />
                  <div className="text-xs leading-relaxed text-slate-400">
                    {renderSupportLink(t("interstitialSupport"))}
                  </div>
                </div>
              )}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onPrimary?.();
                closeAndRestore();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              {onPrimary ? <Download className="h-4 w-4" aria-hidden /> : <Coffee className="h-4 w-4" aria-hidden />}
              {onPrimary ? t("interstitialDownloadNow") : t("interstitialContinue")}
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}