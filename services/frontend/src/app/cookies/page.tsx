import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import LegalPageShell from "@/components/legal/LegalPageShell";
import LegalCookiesContent from "@/components/legal/LegalCookiesContent";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de Cookies de FastMedia Downloader.",
  alternates: {
    canonical: "/cookies",
  },
};

export default async function RootCookiesPage() {
  const dict = getDictionary(DEFAULT_LOCALE);
  return (
    <LegalPageShell>
      <LegalCookiesContent dict={dict} locale={DEFAULT_LOCALE} />
    </LegalPageShell>
  );
}