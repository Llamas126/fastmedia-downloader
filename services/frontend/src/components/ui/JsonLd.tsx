const SITE_URL = "https://fastmedia.qbitsglobal.com";

function WebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FastMedia Downloader",
    url: SITE_URL,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList:
      "Descarga de videos y audio en alta calidad (hasta 4K), extracción de audio MP3, compatible con YouTube, TikTok, Instagram, Facebook, X, Twitch, Pinterest, Spotify y SoundCloud, sin registro y sin costos.",
    inLanguage: ["es", "en"],
    author: {
      "@type": "Person",
      name: "Juan Camilo Llamas Cárdenas",
    },
  };
}

function OrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FastMedia Downloader",
    alternateName: "FastMedia",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    email: "ing.llamas.juan@gmail.com",
    founder: {
      "@type": "Person",
      name: "Juan Camilo Llamas Cárdenas",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CO",
    },
    sameAs: [
      "https://github.com/Llamas126",
      "https://github.com/sponsors/Llamas126",
      "https://www.buymeacoffee.com/llamas126",
    ],
  };
}

function FaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es FastMedia Downloader?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FastMedia Downloader es una herramienta gratuita y open source que te permite descargar videos y audio de más de 10 plataformas en calidad original, hasta 4K.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué plataformas son compatibles?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "YouTube, TikTok, Instagram (Reels), Facebook, X (Twitter), Twitch, Pinterest, Spotify, SoundCloud y muchas más plataformas.",
        },
      },
      {
        "@type": "Question",
        name: "¿Es realmente gratis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. FastMedia es 100% gratuito, open source y sin registro. No hay costos ocultos ni límites de descarga.",
        },
      },
      {
        "@type": "Question",
        name: "¿Mis datos están seguros?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FastMedia no almacena tus descargas ni tu historial. Las URLs se procesan y eliminan inmediatamente. No compartimos datos con terceros.",
        },
      },
      {
        "@type": "Question",
        name: "¿Es legal descargar videos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Depende del uso. Puedes descargar contenido para uso personal si tienes derecho o autorización. No promovemos la infracción de derechos de autor.",
        },
      },
    ],
  };
}

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WebApplicationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(OrganizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FaqSchema()) }}
      />
    </>
  );
}