"use client";

//  _________________________________________________________________
// /                                                                 \
// |   FastMedia Downloader - Selector de idioma flotante            |
// |                                                                 |
// |   Arriba-derecha. Patron ARIA de listbox con navegacion por     |
// |   teclado (flechas arriba/abajo + Home/End). Cero dependencias. |
// \_________________________________________________________________/

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe, X } from "lucide-react";
import { Locale, LOCALE_META, RTL_LOCALES, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { useI18n } from "@/components/providers/I18nProvider";

export default function I18nSwitcher() {
  const { locale, setLocale, t, isRTL } = useI18n();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(0);
  const listRef = useRef<HTMLUListElement>(null);

  const currentName = LOCALE_META[locale].name;
  const languages = SUPPORTED_LOCALES;

  useEffect(() => {
    setHighlight(languages.indexOf(locale));
  }, [locale, languages]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    setHighlight(languages.indexOf(locale));
    setOpen(true);
  };

  const triggerRef = useRef<HTMLButtonElement>(null);

  const select = (code: Locale) => {
    setLocale(code);
    close();
  };

  const moveHighlight = (next: number) => {
    const clamped = Math.max(0, Math.min(languages.length - 1, next));
    setHighlight(clamped);
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${clamped}"]`);
    el?.scrollIntoView({ block: "nearest" });
  };

  const onContainerKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
        setHighlight(languages.indexOf(locale));
      }
      return;
    }
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        moveHighlight(highlight + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveHighlight(highlight - 1);
        break;
      case "Home":
        event.preventDefault();
        moveHighlight(0);
        break;
      case "End":
        event.preventDefault();
        moveHighlight(languages.length - 1);
        break;
      case "Enter":
      case " ":
        if (event.target === triggerRef.current) return;
        event.preventDefault();
        select(languages[highlight]);
        break;
      case "Tab":
        close();
        break;
    }
  };

  const currentDir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <div
      dir={currentDir}
      onKeyDown={onContainerKeyDown}
      className="relative"
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("langSwitcherLabel")}
        className="inline-flex h-11 min-w-11 items-center gap-1.5 rounded-full border border-white/10 bg-[#151522]/90 px-3.5 text-xs font-medium text-slate-200 shadow-lg shadow-black/30 backdrop-blur transition hover:border-violet-400/40 hover:text-white"
      >
        <Globe className="h-3.5 w-3.5 text-violet-300" aria-hidden />
        <span>{currentName}</span>
        {open ? <X className="h-3 w-3 text-slate-400" aria-hidden /> : null}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-full mt-2 w-56 max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-[#151522]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur"
          >
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {t("langOpen")}
            </p>
            <ul ref={listRef} role="listbox" aria-label={t("langSwitcherLabel")}>
              {languages.map((code) => {
                const meta = LOCALE_META[code];
                const selected = code === locale;
                const active = highlight === languages.indexOf(code);
                return (
                  <li
                    key={code}
                    role="option"
                    data-index={languages.indexOf(code)}
                    aria-selected={selected}
                    onClick={() => select(code)}
                    onMouseEnter={() => setHighlight(languages.indexOf(code))}
                    className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-sm transition ${
                      active ? "bg-violet-500/20 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="min-w-0 truncate">{meta.name}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0 text-violet-300" aria-hidden />}
                  </li>
                );
              })}
            </ul>
            <p className="px-2.5 pb-1 pt-1.5 text-[10px] text-slate-500" aria-hidden>
              {t("langCurrent", { name: currentName })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}