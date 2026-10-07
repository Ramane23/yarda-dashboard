"use client";

import { SegmentedControl } from "@/components/ui/tabs";
import type { Locale } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";

const LOCALES = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
] as const satisfies readonly { value: Locale; label: string }[];

/** Interface language switch (EN / FR). */
export function LocaleToggle() {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  const t = useT();
  return (
    <SegmentedControl
      label={t("header.language")}
      value={locale}
      onChange={setLocale}
      options={LOCALES}
      size="sm"
    />
  );
}
