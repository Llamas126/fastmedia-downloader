import { BarChart3, Check, Megaphone } from "lucide-react";
import type { Dict } from "@/lib/i18n/dictionaries/dict_lang1";
import type { Locale } from "@/lib/i18n/locales";

interface LegalCookiesContentProps {
  dict: Dict;
  locale: Locale;
}

export default function LegalCookiesContent({ dict, locale }: LegalCookiesContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {dict.legalCookies}
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Última actualización: {new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">1. ¿Qué son las cookies?</h2>
        <p className="text-slate-300 leading-relaxed">
          Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, móvil, tablet)
          cuando los visita. Permiten que el sitio recuerde información sobre su visita, como su idioma preferido u otras opciones,
          para facilitar su próxima visita y hacer que el sitio le resulte más útil.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">2. Tipos de cookies que utilizamos</h2>

        <div className="mb-8 p-4 rounded-xl border border-white/10 bg-white/5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400" aria-hidden>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Funcionales (Necesarias) - Siempre activas
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Son esenciales para que el sitio web funcione correctamente. Permiten la navegación por la página y la utilización
            de las diferentes opciones o servicios que en ella existan. <strong>No requieren consentimiento.</strong>
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li><strong>fm_lang:</strong> Guarda su idioma preferido (12 meses).</li>
            <li><strong>fm_consent:</strong> Registra qué categorías de cookies ha aceptado o rechazado (12 meses).</li>
            <li><strong>fm_session:</strong> Marca de sesión para distinguir visitas (30 meses de uso normal / 30 días).</li>
          </ul>
        </div>

        <div className="mb-8 p-4 rounded-xl border border-white/10 bg-white/5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-violet-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-400" aria-hidden>
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            Analíticas (Opcionales) - Requieren consentimiento
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización
            que hacen los usuarios del servicio. <strong>Solo se activan si usted las acepta.</strong>
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li><strong>_ga, _ga_*:</strong> Google Analytics 4 - Distinguir usuarios, sesiones, eventos (14 meses).</li>
            <li>Datos anonimizados (IP truncada). No se cruzan con datos personales.</li>
          </ul>
        </div>

        <div className="mb-8 p-4 rounded-xl border border-white/10 bg-white/5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400" aria-hidden>
              <Megaphone className="h-3.5 w-3.5" />
            </span>
            Publicidad / Marketing (Opcionales) - Requieren consentimiento
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Permiten la gestión, de la forma más eficaz posible, de los espacios publicitarios que el editor haya incluido
            en la página web. <strong>Solo se activan si usted las acepta.</strong>
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li><strong>Google AdSense:</strong> Cookies para mostrar anuncios personalizados/no personalizados.</li>
            <li>Pueden usarse para crear perfiles de intereses basados en la navegación.</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">3. Gestión de sus preferencias</h2>
        <p className="text-slate-300 leading-relaxed">
          Puede cambiar sus preferencias en cualquier momento a través del botón «Configurar cookies» que aparece en el
          banner de cookies o en el pie de página, o borrando las cookies de este sitio desde la configuración de su navegador.
        </p>
        <h3 className="mt-6 mb-3 text-xl font-medium text-white">Cómo deshabilitar cookies en navegadores principales:</h3>
        <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
          <li>Chrome: Configuración › Privacidad y seguridad › Cookies y otros datos de sitios.</li>
          <li>Firefox: Opciones › Privacidad y seguridad › Cookies y datos del sitio.</li>
          <li>Safari: Preferencias › Privacidad › Gestionar datos de sitios web.</li>
          <li>Edge: Configuración › Cookies y permisos del sitio › Administrar y eliminar cookies.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">4. Cookies de terceros</h2>
        <p className="text-slate-300 leading-relaxed">
          Algunos servicios externos que utilizamos instalan sus propias cookies:
        </p>
        <ul className="space-y-3 text-slate-300 leading-relaxed list-disc list-inside">
          <li><strong>Google (Analytics, AdSense):</strong> <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 underline">Política de cookies de Google</a></li>
          <li><strong>GitHub Sponsors:</strong> <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 underline">Privacidad de GitHub</a></li>
          <li><strong>Buy Me a Coffee:</strong> <a href="https://buymeacoffee.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 underline">Privacidad de BMC</a></li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">5. Consentimiento</h2>
        <p className="text-slate-300 leading-relaxed">
          Al hacer clic en &ldquo;Aceptar todas&rdquo; en el banner de cookies, consiente el uso de <strong>todas</strong> las categorías.
          Al elegir &ldquo;Solo esenciales&rdquo;, rechaza analítica y publicidad. Puede retirar su consentimiento en cualquier momento
          desde el panel de configuración de cookies.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">6. Contacto</h2>
        <p className="text-slate-300 leading-relaxed">
          Para dudas sobre esta Política de Cookies:
          <br />
          <a href="mailto:ing.llamas.juan@gmail.com" className="break-all hover:text-violet-400 underline">ing.llamas.juan@gmail.com</a>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">Marco Normativo</h2>
        <p className="text-slate-300 leading-relaxed">
          Esta política se rige por la Ley 1581 de 2012 (Protección de Datos Personales / Habeas Data),
          el Decreto 1377 de 2013, la Ley 527 de 1999 (Comercio Electrónico) y las normas complementarias
          de la República de Colombia, cumpliendo estándares internacionales GDPR/CCPA (ePrivacy Directive)
          y las políticas de Google AdSense.
        </p>
      </section>
    </div>
  );
}