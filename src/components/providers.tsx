"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/lib/query-client";

/**
 * App-wide providers.
 *
 * @param nonce - CSP nonce of this response, for next-themes' inline script.
 */
export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem nonce={nonce}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
