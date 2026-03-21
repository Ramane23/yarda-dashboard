"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const locales: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
];

export function LocaleToggle() {
  const { locale, setLocale } = useAppStore();

  return (
    <div className="flex rounded-lg border bg-surface-50 p-0.5 dark:bg-surface-800">
      {locales.map((l) => (
        <button
          key={l.value}
          onClick={() => setLocale(l.value)}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
            locale === l.value
              ? "bg-white text-brand-700 shadow-sm dark:bg-surface-700 dark:text-brand-300"
              : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
