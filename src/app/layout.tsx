import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { NONCE_HEADER } from "@/lib/csp";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YARDA — Fraud Detection Dashboard",
  description: "Real-time fraud monitoring and analytics for MTO clients",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

/**
 * Root layout. Reading the request headers makes every page render per
 * request, which the CSP nonce requires (see `src/middleware.ts`).
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
