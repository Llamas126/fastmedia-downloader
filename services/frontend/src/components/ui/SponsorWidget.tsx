"use client";

import React from "react";
import { Coffee, Github, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { useI18n } from "@/components/providers/I18nProvider";

export const SponsorWidget: React.FC = () => {
  const { t } = useI18n();

  const handleSupport = (url: string) => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#8b5cf6", "#ec4899", "#22d3ee", "#ffdd00"],
    });
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 600);
  };

  return (
    <section className="mx-auto my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {t("sponsorTitle")}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => handleSupport("https://github.com/sponsors/Llamas126")}
          aria-label={t("sponsorGithubLabel")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <Github className="h-4 w-4" />
          GitHub Sponsors
        </button>

        <button
          onClick={() => handleSupport("https://www.buymeacoffee.com/llamas126")}
          aria-label={t("sponsorCoffeeLabel")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FFDD00] px-4 py-2 text-sm font-bold text-black shadow-lg shadow-black/20 transition hover:brightness-110 active:scale-[0.98]"
        >
          <Coffee className="h-4 w-4" />
          Buy me a coffee
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <Heart className="h-3.5 w-3.5 fill-current text-red-400" aria-hidden />
        {t("footerOpenSource")}
      </p>
    </section>
  );
};

export default SponsorWidget;