"use client";

// Barra de progreso dinamica con dos estados:
//  - determinada: mientras el cliente reporta porcentaje real (descargando)
//  - indeterminada + shimmer: en cola o durante el ensamblaje con FFmpeg
//    (el worker congela el % en 99 hasta terminar el merge).
// Animaciones solo por transform/opacity (GPU-friendly), respetando
// prefers-reduced-motion.

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { JobStatus } from "@/lib/api";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Dict } from "@/lib/i18n/dictionaries/dict_lang1";

type ProgressTranslator = (key: keyof Dict) => string;

function stageLabel(job: JobStatus | null, t: ProgressTranslator): string {
  if (!job || job.status === "queued") return t("progressQueued");
  if (job.status === "processing") return t("progressProcessing");
  if (job.stage === "completado") return t("progressCompleted");
  return t("progressDownloading");
}

function isIndeterminate(job: JobStatus | null): boolean {
  if (!job) return true;
  return (
    job.status === "queued" ||
    job.status === "processing" ||
    Math.round(job.progress) <= 0
  );
}

export default function DownloadProgress({ job }: { job: JobStatus | null }) {
  const { t } = useI18n();
  const progress = Math.max(Math.min(job?.progress ?? 0, 100), 0);
  const indeterminate = isIndeterminate(job);
  const label = stageLabel(job, t);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-busy="true"
      className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between gap-4 text-sm">
        <span className="inline-flex min-w-0 items-center gap-2 font-medium text-slate-200">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-400" aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="shrink-0 font-mono tabular-nums text-slate-400">
          {indeterminate ? "—" : `${Math.round(progress)}%`}
        </span>
      </div>

      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("progressLabel")}
      >
        {indeterminate ? (
          <div className="relative h-full w-1/2 overflow-hidden rounded-full">
            <div className="animate-indeterminate h-full w-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500" />
            <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200%_100%]" />
          </div>
        ) : (
          <motion.div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
            initial={false}
            animate={{ width: `${Math.max(progress, 3)}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.3),transparent)] bg-[length:200%_100%]" />
          </motion.div>
        )}
      </div>

      {job?.title && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 truncate text-xs text-slate-500"
        >
          {job.title}
        </motion.p>
      )}
    </motion.section>
  );
}