import Link from "next/link";
import type { Dict } from "@/lib/i18n/dictionaries/dict_lang1";
import type { Locale } from "@/lib/i18n/locales";

interface LegalPrivacyContentProps {
  dict: Dict;
  locale: Locale;
}

export default function LegalPrivacyContent({ dict, locale }: LegalPrivacyContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {dict.legalPrivacy}
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Última actualización: {new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">1. Responsable del Tratamiento</h2>
        <p className="text-slate-300 leading-relaxed">
          Juan Camilo Llamas Cárdenas (en adelante, &ldquo;el Responsable&rdquo;, &ldquo;nosotros&rdquo; o &ldquo;FastMedia Downloader&rdquo;) es el responsable del tratamiento
          de los datos personales que puedan recopilarse a través de este sitio web.
          Contacto: <Link href="mailto:ing.llamas.juan@gmail.com" className="break-all hover:text-violet-400 underline">ing.llamas.juan@gmail.com</Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">2. Datos que Recopilamos</h2>
        <h3 className="mb-2 text-xl font-medium text-white">Datos proporcionados voluntariamente</h3>
        <p className="text-slate-300 leading-relaxed">
          FastMedia Downloader no requiere registro ni inicio de sesión. No recopilamos datos de identificación personal
          (nombre, email, IP) a menos que usted nos los proporcione voluntariamente mediante el formulario de contacto
          o al interactuar con los widgets de donación (GitHub Sponsors, Buy Me a Coffee).
        </p>
        <h3 className="mt-6 mb-2 text-xl font-medium text-white">Datos técnicos y de uso (anonimizados)</h3>
        <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
          <li>Preferencia de idioma (almacenada en localStorage/cookie).</li>
          <li>Consentimiento de cookies (categorías aceptadas/rechazadas).</li>
          <li>Estadísticas anónimas de uso (si acepta cookies analíticas): páginas visitadas, tiempo de permanencia, errores.</li>
        </ul>
        <p className="mt-4 text-slate-300 leading-relaxed">
          <strong>No almacenamos las URLs que analiza ni los videos que descarga.</strong> El procesamiento ocurre en memoria
          en nuestros servidores backend y los archivos temporales se eliminan automáticamente tras la descarga o expiración.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">3. Finalidad y Base Legal</h2>
        <table className="w-full text-sm text-left text-slate-300">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-2 font-semibold text-white">Finalidad</th>
              <th className="pb-2 font-semibold text-white">Base Legal</th>
              <th className="pb-2 font-semibold text-white">Datos</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-2">Recordar preferencias de idioma</td>
              <td className="py-2">Interés legítimo / Consentimiento</td>
              <td className="py-2">Cookies funcionales (necesarias)</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2">Analítica anónima (mejora del servicio)</td>
              <td className="py-2">Consentimiento (opt-in)</td>
              <td className="py-2">Cookies analíticas</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2">Publicidad (Google AdSense)</td>
              <td className="py-2">Consentimiento (opt-in)</td>
              <td className="py-2">Cookies de marketing</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2">Procesamiento de descargas (yt-dlp/FFmpeg)</td>
              <td className="py-2">Ejecución de contrato (solicitud del usuario)</td>
              <td className="py-2">URL temporal, metadatos públicos (sin IP personal)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">4. Compartición de Datos</h2>
        <ul className="space-y-3 text-slate-300 leading-relaxed list-disc list-inside">
          <li><strong>Proveedores de backend:</strong> FastAPI + yt-dlp (procesamiento de video, datos efímeros).</li>
          <li><strong>Google AdSense:</strong> Solo si acepta cookies de marketing (ver Política de Cookies).</li>
          <li><strong>Plataformas de donación:</strong> GitHub Sponsors / Buy Me a Coffee (solo si hace clic y es redirigido).</li>
          <li><strong>Autoridades competentes:</strong> Cuando lo exija la ley o para proteger derechos legales (SIC, autoridades colombianas).</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">5. Transferencias Internacionales</h2>
        <p className="text-slate-300 leading-relaxed">
          Algunos proveedores (Google, GitHub) pueden procesar datos en EE. UU. Dichas transferencias se amparan en
          Cláusulas Contractuales Tipo (SCC) aprobadas por la Comisión Europea o decisiones de adecuación,
          cumpliendo con la Ley 1581 de 2012.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">6. Sus Derechos (Ley 1581/2012 - Habeas Data)</h2>
        <p className="text-slate-300 leading-relaxed">
          Usted tiene derecho a: conocer, actualizar, rectificar, suprimir, limitar, oponerse al tratamiento y a la portabilidad de sus datos (Derechos ARCO).
          Puede ejercer estos derechos escribiendo a <Link href="mailto:ing.llamas.juan@gmail.com" className="break-all hover:text-violet-400 underline">ing.llamas.juan@gmail.com</Link>.
          También puede presentar una reclamación ante la Superintendencia de Industria y Comercio (SIC).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">7. Retención de Datos</h2>
        <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
          <li>Preferencias (idioma, consentimiento): 12 meses desde la última interacción.</li>
          <li>Logs de analítica anónima: 14 meses (Google Analytics) / agregados indefinidos.</li>
          <li>Datos de procesamiento de video: Eliminados automáticamente tras completar/fallar la descarga (máx. 1 hora).</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">8. Seguridad</h2>
        <p className="text-slate-300 leading-relaxed">
          Implementamos medidas técnicas y organizativas apropiadas: HTTPS/TLS 1.3, headers de seguridad (CSP, HSTS),
          aislamiento de procesos backend, sin almacenamiento persistente de URLs de usuario.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">9. Cambios en esta Política</h2>
        <p className="text-slate-300 leading-relaxed">
          Publicaremos cualquier modificación en esta página con la fecha de &ldquo;Última actualización&rdquo;. Le recomendamos
          revisar esta política periódicamente.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">10. Contacto</h2>
        <p className="text-slate-300 leading-relaxed">
          Para cualquier duda sobre privacidad:
          <Link href="mailto:ing.llamas.juan@gmail.com" className="break-all hover:text-violet-400 underline ml-2">
            ing.llamas.juan@gmail.com
          </Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">Marco Normativo</h2>
        <p className="text-slate-300 leading-relaxed">
          Esta política se rige por la Ley 1581 de 2012 (Protección de Datos Personales / Habeas Data),
          el Decreto 1377 de 2013, la Ley 527 de 1999 (Comercio Electrónico) y las normas complementarias
          de la República de Colombia, cumpliendo estándares internacionales GDPR/CCPA y políticas de Google AdSense.
        </p>
      </section>
    </div>
  );
}