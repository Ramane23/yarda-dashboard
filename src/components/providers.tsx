"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/menu";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/query-client";
import { useAppStore } from "@/lib/store";

/** Keep `<html lang>` in sync with the chosen language (screen readers, hyphenation, spellcheck). */
function DocumentLanguage() {
  const locale = useAppStore((state) => state.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

/**
 * App-wide providers.
 *
 * @param nonce - CSP nonce of this response, for next-themes' inline script.
 */
export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem nonce={nonce}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          <DocumentLanguage />
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
