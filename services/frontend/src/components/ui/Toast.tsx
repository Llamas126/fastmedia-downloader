"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { dismissToast, subscribeToast, type ToastMessage } from "@/lib/toast";
import { useI18n } from "@/components/providers/I18nProvider";

const ICONS = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
} as const;

const STYLES = {
  error: "border-red-400/30 text-red-300",
  success: "border-emerald-400/30 text-emerald-300",
  info: "border-cyan-400/30 text-cyan-300",
} as const;

export default function Toaster() {
  const { t } = useI18n();
  const [items, setItems] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => subscribeToast(setItems), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          const color = STYLES[item.kind];
          return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            role={item.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto w-full max-w-sm rounded-xl border bg-[#151522]/95 p-3.5 shadow-2xl shadow-black/50 backdrop-blur ${color}`}
          >
            <div className="flex items-start gap-3">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.35, bounce: 0.5, delay: 0.05 }}
                className="mt-0.5 shrink-0"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 break-words text-sm text-slate-300">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label={t("toastDismiss")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}