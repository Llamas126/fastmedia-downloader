import Link from "next/link";
import type { Dict } from "@/lib/i18n/dictionaries/dict_lang1";
import type { Locale } from "@/lib/i18n/locales";

interface LegalTermsContentProps {
  dict: Dict;
  locale: Locale;
}

export default function LegalTermsContent({ dict, locale }: LegalTermsContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {dict.legalTerms}
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Última actualización: {new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">1. Aceptación de los Términos</h2>
        <p className="text-slate-300 leading-relaxed">
          Al acceder y utilizar FastMedia Downloader, usted acepta estar sujeto a estos Términos y Condiciones de Uso,
          a nuestra Política de Privacidad y a nuestra Política de Cookies. Si no está de acuerdo con alguna parte de estos términos,
          no debe utilizar nuestro servicio.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">2. Descripción del Servicio</h2>
        <p className="text-slate-300 leading-relaxed">
          FastMedia Downloader es una herramienta gratuita basada en web que permite a los usuarios analizar enlaces de video y audio
          de plataformas compatibles y descargar el contenido disponible públicamente. El servicio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">3. Uso Responsable y Legal</h2>
        <ul className="space-y-3 text-slate-300 leading-relaxed list-disc list-inside">
          <li>El usuario es el único responsable del contenido que descarga.</li>
          <li>Queda estrictamente prohibido descargar material protegido por derechos de autor sin la debida autorización.</li>
          <li>El usuario debe cumplir con los términos de servicio de las plataformas de origen (YouTube, TikTok, Instagram, etc.).</li>
          <li>FastMedia Downloader no aloja, almacena ni transmite contenido protegido por derechos de autor.</li>
        </ul>
        <p className="mt-4 text-slate-300 leading-relaxed">
          {dict.footerResponsible}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">4. Propiedad Intelectual</h2>
        <p className="text-slate-300 leading-relaxed">
          FastMedia Downloader, su marca, logotipo, interfaz de usuario y código subyacente son propiedad de Juan Camilo Llamas Cárdenas.
          El uso del servicio no le otorga ningún derecho de propiedad intelectual sobre el software.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">5. Limitación de Responsabilidad</h2>
        <p className="text-slate-300 leading-relaxed">
          En la máxima medida permitida por la ley, Juan Camilo Llamas Cárdenas no será responsable por daños indirectos, incidentales,
          especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos o uso, derivados del uso o la imposibilidad
          de usar el servicio.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">6. Modificaciones del Servicio</h2>
        <p className="text-slate-300 leading-relaxed">
          Nos reservamos el derecho de modificar, suspender o interrumpir el servicio (o cualquier parte del mismo)
          en cualquier momento, con o sin previo aviso. No seremos responsables ante usted ni ante terceros por
          cualquier modificación, suspensión o interrupción del servicio.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">7. Ley Aplicable y Jurisdicción</h2>
        <p className="text-slate-300 leading-relaxed">
          Estos términos se regirán e interpretarán de acuerdo con las leyes de la República de Colombia, sin tener en cuenta sus
          disposiciones sobre conflictos de leyes. Cualquier disputa se someterá a la jurisdicción exclusiva
          de las autoridades competentes de Colombia, en particular la Superintendencia de Industria y Comercio (SIC).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">8. Contacto</h2>
        <p className="text-slate-300 leading-relaxed">
          Si tiene preguntas sobre estos Términos, póngase en contacto con nosotros en:
        </p>
        <p className="mt-2 text-slate-400">
          <Link href="mailto:ing.llamas.juan@gmail.com" className="break-all hover:text-violet-400 underline">
            ing.llamas.juan@gmail.com
          </Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">Marco Normativo</h2>
        <p className="text-slate-300 leading-relaxed">
          Este servicio se rige por la Ley 1581 de 2012 (Protección de Datos Personales / Habeas Data) y la Ley 527 de 1999
          (Comercio Electrónico y Mensajes de Datos) de la República de Colombia, así como por los estándares internacionales
          GDPR/CCPA y las políticas de Google AdSense.
        </p>
      </section>
    </div>
  );
}