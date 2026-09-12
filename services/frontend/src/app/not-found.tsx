"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main
      id="main-content"
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        initial={mounted ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <SearchX className="h-14 w-14 text-violet-400" aria-hidden />
          </div>
          <span className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl font-bold text-white shadow-lg shadow-violet-600/30">
            ?
          </span>
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-white sm:text-8xl">
          404
        </h1>
        <p className="mt-4 max-w-md text-lg text-slate-400">
          Esta pagina no existe o fue movida a otra ubicacion.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" aria-hidden />
            Volver al inicio
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver atras
          </button>
        </div>
      </motion.div>
    </main>
  );
}
