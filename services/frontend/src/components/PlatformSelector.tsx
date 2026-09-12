"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Info } from "lucide-react";
import { getPlatform, PLATFORMS } from "@/lib/platformIcons";
import { useI18n } from "@/components/providers/I18nProvider";

interface PlatformSelectorProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CHIP_BASE =
  "group inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70";

const CHIP_ACTIVE =
  "border-violet-400/60 bg-violet-500/15 text-violet-200 shadow-[0_0_14px_rgba(139,92,246,0.25)]";

const CHIP_IDLE =
  "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200";

export default function PlatformSelector({ selectedId, onSelect }: PlatformSelectorProps) {
  const { t, dir } = useI18n();
  const selectedPlatform = getPlatform(selectedId);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusIndex(index: number) {
    return () => {
      onSelect(index === 0 ? null : PLATFORMS[index - 1].id);
      chipRefs.current[index]?.focus();
    };
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const count = PLATFORMS.length + 1;
    let current = selectedId === null ? 0 : PLATFORMS.findIndex((p) => p.id === selectedId) + 1;
    if (current < 0) current = 0;
    let target: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        target = (current + 1) % count;
        break;
      case "ArrowLeft":
        target = (current - 1 + count) % count;
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    onSelect(target === 0 ? null : PLATFORMS[target - 1].id);
    chipRefs.current[target]?.focus();
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-2.5 border-t border-white/5 px-2 pb-1.5 pt-3">
        <div
          role="radiogroup"
          aria-label={t("selectorLabel")}
          onKeyDown={handleKeyDown}
          className="platform-scroll flex w-full items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-2 snap-x"
        >
          <motion.button
            ref={(node) => {
              chipRefs.current[0] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selectedId === null}
            aria-label={t("selectorAllLabel")}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={focusIndex(0)}
            className={`${CHIP_BASE} ${selectedId === null ? CHIP_ACTIVE : CHIP_IDLE}`}
          >
            <Globe className="h-4 w-4" aria-hidden />
            {t("selectorAll")}
          </motion.button>

          {PLATFORMS.map(({ id, label, Icon }, index) => {
            const active = selectedId === id;
            return (
              <motion.button
                key={id}
                ref={(node) => {
                  chipRefs.current[index + 1] = node;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={focusIndex(index + 1)}
                className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </motion.button>
            );
          })}
        </div>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 w-12 ${dir === "rtl" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"} from-[#0b0b14]/95 to-transparent`}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={selectedId ?? "all"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-1.5 px-2 pt-1 text-[11px] text-slate-500"
        >
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {selectedPlatform
            ? t("selectorHintPlatform", { platform: selectedPlatform.label })
            : t("selectorHintDefault")}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}