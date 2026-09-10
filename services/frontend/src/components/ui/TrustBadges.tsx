"use client";

import { Heart, ShieldCheck, ShieldOff, Lock } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

const BADGES = [
  { key: "trustFree", icon: Heart, color: "text-violet-400" },
  { key: "trustNoReg", icon: ShieldCheck, color: "text-emerald-400" },
  { key: "trustNoMalware", icon: ShieldOff, color: "text-cyan-400" },
  { key: "trustSSL", icon: Lock, color: "text-amber-400" },
] as const;

export default function TrustBadges() {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3" role="list" aria-label="Trust indicators">
      {BADGES.map(({ key, icon: Icon, color }) => (
        <div
          key={key}
          role="listitem"
          className="flex items-center gap-2 text-sm text-slate-400"
        >
          <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden />
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
