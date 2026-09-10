"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - Composicion global de providers        |
// |                                                                 |
// |   ConsentProvider (cookies) > I18nProvider > hijos + overlays   |
// |   globales (selector de idioma, banner de cookies, AdSense).    |
// \_________________________________________________________________/

import { ConsentProvider } from "@/components/providers/ConsentProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import AdScriptLoader from "@/components/providers/AdScriptLoader";
import AnalyticsLoader from "@/components/providers/AnalyticsLoader";
import CookieBanner from "@/components/ui/CookieBanner";
import Toaster from "@/components/ui/Toast";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <I18nProvider>
        {children}
        <CookieBanner />
        <Toaster />
        <AdScriptLoader />
        <AnalyticsLoader />
      </I18nProvider>
    </ConsentProvider>
  );
}
