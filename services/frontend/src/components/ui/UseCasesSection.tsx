"use client";

import { Music, Film, Smartphone, Twitter } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

const USE_CASES = [
  {
    icon: Music,
    titleKey: "useCase1Title",
    descKey: "useCase1Desc",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-400/20",
  },
  {
    icon: Film,
    titleKey: "useCase2Title",
    descKey: "useCase2Desc",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/20",
  },
  {
    icon: Smartphone,
    titleKey: "useCase3Title",
    descKey: "useCase3Desc",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-400/20",
  },
  {
    icon: Twitter,
    titleKey: "useCase4Title",
    descKey: "useCase4Desc",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/20",
  },
];

export default function UseCasesSection() {
  const { t } = useI18n();

  return (
    <section id="features" className="w-full max-w-3xl scroll-mt-24">
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {t("useCasesTitle")}
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {t("useCasesSubtitle")}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {USE_CASES.map((uc) => {
          const Icon = uc.icon;
          return (
            <div
              key={uc.titleKey}
              className={`rounded-2xl border ${uc.border} ${uc.bg} p-5 backdrop-blur-sm`}
            >
              <Icon className={`h-8 w-8 ${uc.color}`} aria-hidden />
              <h3 className="mt-3 text-sm font-semibold text-white">
                {t(uc.titleKey)}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {t(uc.descKey)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
