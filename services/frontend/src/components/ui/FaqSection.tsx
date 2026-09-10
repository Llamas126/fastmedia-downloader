"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

interface FaqItem {
  qKey: string;
  aKey: string;
}

const GENERAL_FAQS: FaqItem[] = [
  { qKey: "faqQ1", aKey: "faqA1" },
  { qKey: "faqQ2", aKey: "faqA2" },
  { qKey: "faqQ3", aKey: "faqA3" },
  { qKey: "faqQ4", aKey: "faqA4" },
  { qKey: "faqQ5", aKey: "faqA5" },
];

const TECHNICAL_FAQS: FaqItem[] = [
  { qKey: "faqTQ1", aKey: "faqTA1" },
  { qKey: "faqTQ2", aKey: "faqTA2" },
  { qKey: "faqTQ3", aKey: "faqTA3" },
  { qKey: "faqTQ4", aKey: "faqTA4" },
  { qKey: "faqTQ5", aKey: "faqTA5" },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();

  return (
    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.qKey}>
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-white transition hover:bg-white/5 sm:px-6"
              >
                <span>{t(item.qKey)}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
            </h3>
            {isOpen && (
              <div className="px-5 pb-4 sm:px-6">
                <p className="text-sm leading-relaxed text-slate-400">
                  {t(item.aKey)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FaqSection() {
  const { t } = useI18n();

  return (
    <section id="faq" className="w-full max-w-3xl scroll-mt-24 space-y-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("faqGeneralTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {t("faqGeneralSubtitle")}
        </p>
        <div className="mt-6">
          <FaqAccordion items={GENERAL_FAQS} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("faqTechnicalTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {t("faqTechnicalSubtitle")}
        </p>
        <div className="mt-6">
          <FaqAccordion items={TECHNICAL_FAQS} />
        </div>
      </div>
    </section>
  );
}
