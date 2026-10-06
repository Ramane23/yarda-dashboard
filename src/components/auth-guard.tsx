"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureSession, purgeLegacyStorage } from "@/lib/auth";
import { useAppStore } from "@/lib/store";

/**
 * Renders its children only for a signed-in user.
 *
 * On first render it restores the session from the httpOnly refresh cookie
 * (the access token lives in memory and does not survive a reload). If that
 * fails, or the session ends later (expiry, logout in another tab), it sends
 * the user to the login page and remembers where they were going.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const authStatus = useAppStore((s) => s.authStatus);

  useEffect(() => {
    purgeLegacyStorage();
    void ensureSession();
  }, []);

  useEffect(() => {
    if (authStatus === "anonymous") {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [authStatus, pathname, router]);

  if (authStatus !== "authenticated") {
    return (
      <div
        className="flex h-screen items-center justify-center bg-surface-50 dark:bg-surface-950"
        role="status"
        aria-live="polite"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
