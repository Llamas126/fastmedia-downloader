"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - Consent Provider (cookies)             |
// |                                                                 |
// |   Author: Juan Camilo Llamas Cárdenas                           |
// |   License: MIT (Free & Open Source Use)                         |
// \_________________________________________________________________/

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  buildConsent,
  clearConsent,
  markSession,
  readConsent,
  saveConsent,
  type ConsentState,
} from "@/lib/cookies";

interface ConsentContextValue {
  state: ConsentState | null;
  bannerOpen: boolean;
  acceptAll: () => void;
  essentialOnly: () => void;
  savePreferences: (analytics: boolean, marketing: boolean) => void;
  revisit: () => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentState | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setState(existing);
    setBannerOpen(existing == null);
    markSession();
  }, []);

  const apply = useCallback((next: ConsentState) => {
    saveConsent(next);
    setState(next);
    setBannerOpen(false);
  }, []);

  const acceptAll = useCallback(() => apply(buildConsent(true, true)), [apply]);
  const essentialOnly = useCallback(() => apply(buildConsent(false, false)), [apply]);
  const savePreferences = useCallback(
    (analytics: boolean, marketing: boolean) => apply(buildConsent(analytics, marketing)),
    [apply],
  );
  const revisit = useCallback(() => setBannerOpen(true), []);

  return (
    <ConsentContext.Provider
      value={{ state, bannerOpen, acceptAll, essentialOnly, savePreferences, revisit }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent debe usarse dentro de <ConsentProvider>");
  }
  return context;
}

export { clearConsent };