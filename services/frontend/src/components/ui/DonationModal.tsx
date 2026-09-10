"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coffee, ExternalLink, Github, Heart, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useI18n } from "@/components/providers/I18nProvider";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DONATION_OPTIONS = [
  {
    name: "GitHub Sponsors",
    url: "https://github.com/sponsors/Llamas126",
    icon: Github,
    className:
      "bg-[#ebf0f5] text-[#24292f] hover:bg-white",
  },
  {
    name: "Buy Me a Coffee",
    url: "https://www.buymeacoffee.com/llamas126",
    icon: Coffee,
    className: "bg-[#FFDD00] text-black hover:brightness-110",
  },
];

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    confetti({
      particleCount: 120,
      spread: 65,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#22d3ee", "#ffdd00"],
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = (url: string) => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#22d3ee", "#ffdd00"],
    });

    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#151522] p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            aria-label={t("donationCancel")}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
              <Heart className="h-8 w-8 fill-current" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">
              {t("donationTitle")}
            </h3>

            <p className="text-sm leading-relaxed text-slate-400">
              {t("donationChoose")}
            </p>

            <p className="mt-2 mb-6 text-xs leading-relaxed text-slate-500">
              {t("donationWarning", { platform: "GitHub Sponsors / Buy Me a Coffee" })}
            </p>

            <div className="flex w-full flex-col gap-3">
              {DONATION_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleContinue(option.url)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold shadow-lg shadow-black/20 transition active:scale-[0.98] ${option.className}`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.name}
                  <ExternalLink className="h-4 w-4" />
                </button>
              ))}

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-white/5 py-3 font-medium text-slate-300 transition hover:bg-white/10"
              >
                {t("donationCancel")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonationModal;