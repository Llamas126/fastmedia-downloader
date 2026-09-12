"use client";

import React from "react";
import Link from "next/link";
import { Coffee, Cookie, Github, Heart, Lock, Mail, Music, Scale, Shield, Zap } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useConsent } from "@/components/providers/ConsentProvider";

export default function Footer() {
  const { t, locale } = useI18n();
  const { revisit } = useConsent();
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { href: `/${locale}/terms`, label: t("legalTerms"), icon: Scale },
    { href: `/${locale}/privacy`, label: t("legalPrivacy"), icon: Shield },
    { href: `/${locale}/cookies`, label: t("legalCookies"), icon: Cookie },
  ];

  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white" aria-label="FastMedia Downloader - Home">
              <Zap className="h-7 w-7 text-violet-400" aria-hidden />
              <span>FastMedia</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t("footerValue")}</p>
            <ul className="mt-5 space-y-2.5" role="list">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Zap className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                <span>{t("footerBadgeSpeed")}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Lock className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <span>{t("footerBadgeSecurity")}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Music className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
                <span>{t("footerBadgeQuality")}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{t("footerContact")}</h3>
            <ul className="mt-4 space-y-3" role="list">
              <li>
                <a
                  href="https://github.com/Llamas126"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <Github className="h-4 w-4 shrink-0" aria-hidden />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t("footerEmail")}`}
                  className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-all">{t("footerEmail")}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h3>
            <ul className="mt-4 space-y-3" role="list">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                  >
                    <link.icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={revisit}
                  className="flex w-full items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <Cookie className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{t("cookiePreferences")}</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{t("footerCommunity")}</h3>
            <ul className="mt-4 space-y-3" role="list">
              <li>
                <a
                  href="https://github.com/sponsors/Llamas126"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <Github className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{t("footerSponsors")}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.buymeacoffee.com/llamas126"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <Coffee className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{t("footerCoffee")}</span>
                </a>
              </li>
              <li>
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <Heart className="h-4 w-4 shrink-0 fill-current text-red-400" aria-hidden />
                  <span>{t("footerOpenSource")}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-xs text-slate-400">
            © {currentYear} {t("footerCopyright").replace(/^©\s*\d{4}\s*/, "").trim()}
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            {t("legalTitular")} · {t("legalJurisdiction")}
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">{t("legalFramework")}</p>
          <p className="mt-2 text-center text-xs text-slate-500">{t("footerResponsible")}</p>
        </div>
      </div>
    </footer>
  );
}