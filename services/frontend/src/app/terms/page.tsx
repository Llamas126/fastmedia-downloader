import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import LegalPageShell from "@/components/legal/LegalPageShell";
import LegalTermsContent from "@/components/legal/LegalTermsContent";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos y Condiciones de Uso de FastMedia Downloader.",
  alternates: {
    canonical: "/terms",
  },
};

export default async function RootTermsPage() {
  const dict = getDictionary(DEFAULT_LOCALE);
  return (
    <LegalPageShell>
      <LegalTermsContent dict={dict} locale={DEFAULT_LOCALE} />
    </LegalPageShell>
  );
}