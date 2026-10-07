import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { t as translate, type Locale, type TranslationKey } from "@/lib/i18n";
import { phaseTone } from "@/lib/tokens";

/** Merge class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const phaseKeys: Record<string, TranslationKey> = {
  detection: "phase.detection",
  learning: "phase.learning",
  classification: "phase.classification",
  intelligence: "phase.intelligence",
};

/**
 * Translated label and pill classes of a learning phase.
 *
 * Colours come from `lib/tokens` (single source); prefer `<PhaseBadge>`
 * from `components/ui/badge` in new code.
 */
export function phaseLabel(phase: string, locale: Locale = "en"): { label: string; color: string } {
  const key = phaseKeys[phase];
  return { label: key ? translate(key, locale) : phase, color: phaseTone(phase).soft };
}
