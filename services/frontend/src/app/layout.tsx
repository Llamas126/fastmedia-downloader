//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - High-Performance Engine                |
// |   Architecture & Core Implementation                            |
// |                                                                 |
// |   Author: Juan Camilo Llamas Cárdenas                           |
// |   License: MIT (Free & Open Source Use)                         |
// |   Copyright (c) 2026 Juan Camilo Llamas Cárdenas                |
// \_________________________________________________________________/
//               \
//                \   /\___/\
//                   /       \
//                  |  #   #  |
//                  \  ___  /
//                   |     |
//                   |     |      __
//                   |     \_____/  \
//                   |               |
//                    \______/\_____/
//                    /      /
//                   /      /
//                  /__/   /__/

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import JsonLd from "@/components/ui/JsonLd";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://fastmedia.qbitsglobal.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FastMedia Downloader — Videos y audio hasta 4K",
    template: "%s | FastMedia Downloader",
  },
  description:
    "Analiza y descarga videos o audio en cualquier calidad: 4K, 1080p, 720p o MP3. Rápido, gratis y sin registro.",
  authors: [{ name: "Juan Camilo Llamas Cárdenas" }],
  creator: "Juan Camilo Llamas Cárdenas",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "FastMedia Downloader",
    title: "FastMedia Downloader — Videos y audio hasta 4K",
    description:
      "Descarga videos y audio de YouTube, TikTok, Instagram y más. Hasta 4K, gratis y sin registro.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "FastMedia Downloader — Descargador de videos 100% gratuito",
      },
    ],
    locale: "es",
  },
  twitter: {
    card: "summary_large_image",
    title: "FastMedia Downloader — Videos y audio hasta 4K",
    description:
      "Descarga videos y audio de YouTube, TikTok, Instagram y más. Hasta 4K, gratis y sin registro.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} min-h-screen font-sans text-slate-200 antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-violet-600 text-white rounded-md font-medium"
        >
          Saltar al contenido principal
        </a>
        <AppProviders>
          <JsonLd />
          <Header />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
