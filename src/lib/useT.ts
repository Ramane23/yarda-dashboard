import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

export function useT() {
  const locale = useAppStore((s) => s.locale);
  return (key: TranslationKey) => t(key, locale);
}
