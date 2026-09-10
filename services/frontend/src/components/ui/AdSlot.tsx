"use client";

// Espacio publicitario con dimensiones fijas (estable, sin CLS).
// Solo se inyecta el bloque AdSense si existe configuracion (env) Y el usuario
// acepto publicidad (marketing=true). Sin eso, renderiza una caja reservada
// con la misma dimension, de modo que activar AdSense no mueva el layout.

import { useEffect, useState } from "react";
import { useConsent } from "@/components/providers/ConsentProvider";
import { useI18n } from "@/components/providers/I18nProvider";

const AD_CLIENT = process.env.NEXT_PUBLIC_AD_CLIENT?.trim() ?? "";
const AD_SLOT = process.env.NEXT_PUBLIC_AD_SLOT_HEADER?.trim() ?? "";

export function adsEnabled(): boolean {
  return Boolean(AD_CLIENT && AD_SLOT);
}

const BOX_CLASSES = {
  leaderboard: "h-[90px] w-full max-w-[728px]",
  rectangle: "h-[250px] w-[300px]",
} as const;

export type AdVariant = keyof typeof BOX_CLASSES;

export default function AdSlot({ variant = "leaderboard" }: { variant?: AdVariant }) {
  const { t } = useI18n();
  const { state: consent } = useConsent();
  const [pushed, setPushed] = useState(false);

  const marketingAllowed = Boolean(consent?.marketing);
  const shouldRenderAd = adsEnabled() && marketingAllowed;

  useEffect(() => {
    if (!shouldRenderAd || pushed) return;
    setPushed(true);
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle ?? [];
      w.adsbygoogle.push({});
    } catch {
      /* el bloque estara vacio si AdSense no responde; la caja permanece reservada */
    }
  }, [shouldRenderAd, pushed]);

  const boxClass = BOX_CLASSES[variant];

  if (!shouldRenderAd) {
    return (
      <aside
        aria-hidden="true"
        className={`mx-auto mb-6 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 ${boxClass}`}
      >
        {t("adPlaceholder")}
      </aside>
    );
  }

  return (
    <div
      className={`mx-auto mb-6 flex items-center justify-center overflow-hidden rounded-xl bg-black/20 ${boxClass}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format={variant === "leaderboard" ? "horizontal" : "rectangle"}
        data-full-width-responsive="true"
      />
    </div>
  );
}