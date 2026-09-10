"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - Cargador de Google Analytics (GA4)     |
// |                                                                 |
// |   Carga condicional: SOLO inyecta gtag.js cuando el usuario ha  |
// |   aceptado la categoria "analytics" del banner de cookies. Sin  |
// |   consentimiento, cero codigo de terceros se descarga.          |
// \_________________________________________________________________/

import { useEffect } from "react";
import { useConsent } from "@/components/providers/ConsentProvider";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

export default function AnalyticsLoader() {
  const { state } = useConsent();
  const analyticsConsent = state?.analytics ?? false;

  useEffect(() => {
    if (!GA_ID || !analyticsConsent) return;
    if (document.querySelector("script[data-fm-gtag]")) return;

    const script = document.createElement("script");
    script.async = true;
    script.dataset.fmGtag = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const win = window as unknown as {
      dataLayer?: unknown[][];
      gtag?: (...args: unknown[]) => void;
    };
    win.dataLayer = win.dataLayer ?? [];
    const gtag = (...args: unknown[]) => {
      win.dataLayer!.push(args);
    };
    win.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }, [analyticsConsent]);

  return null;
}