import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/dictionary";
import LegalPageShell from "@/components/legal/LegalPageShell";
import LegalCookiesContent from "@/components/legal/LegalCookiesContent";

interface LegalPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  return {
    title: dict.legalCookies,
    description: "Política de Cookies de FastMedia Downloader",
    alternates: {
      canonical: `/${locale}/cookies`,
    },
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function CookiesPage({ params }: LegalPageProps) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dict = getDictionary(locale as Locale);

  return (
    <LegalPageShell>
      <LegalCookiesContent dict={dict} locale={locale as Locale} />
    </LegalPageShell>
  );
}