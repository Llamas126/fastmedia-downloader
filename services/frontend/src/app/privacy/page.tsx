import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import LegalPageShell from "@/components/legal/LegalPageShell";
import LegalPrivacyContent from "@/components/legal/LegalPrivacyContent";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de Privacidad de FastMedia Downloader (Ley 1581 de 2012).",
  alternates: {
    canonical: "/privacy",
  },
};

export default async function RootPrivacyPage() {
  const dict = getDictionary(DEFAULT_LOCALE);
  return (
    <LegalPageShell>
      <LegalPrivacyContent dict={dict} locale={DEFAULT_LOCALE} />
    </LegalPageShell>
  );
}