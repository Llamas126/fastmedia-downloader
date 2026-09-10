"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - Cargador de script de AdSense          |
// |                                                                 |
// |   SOLO inyecta el SDK de Google Ads cuando el usuario ha dado   |
// |   consentimiento de "marketing" (categoria "Publicidad"). Sin   |
// |   consentimiento, cero codigo de terceros se descarga.          |
// \_________________________________________________________________/

import { useEffect } from "react";
import { adsEnabled } from "@/components/ui/AdSlot";
import { useConsent } from "@/components/providers/ConsentProvider";

const AD_CLIENT = process.env.NEXT_PUBLIC_AD_CLIENT?.trim() ?? "";

export default function AdScriptLoader() {
  const { state } = useConsent();
  const marketingConsent = state?.marketing ?? false;

  useEffect(() => {
    if (!adsEnabled() || !marketingConsent) return;
    if (document.querySelector("script[data-fm-adsense]")) return;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.fmAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [marketingConsent]);

  return null;
}