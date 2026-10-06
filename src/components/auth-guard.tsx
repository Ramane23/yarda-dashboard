"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureSession, purgeLegacyStorage } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";

/** Delay before retrying when the API could not be reached, doubled up to the cap. */
const RETRY_INITIAL_MS = 2_000;
const RETRY_MAX_MS = 30_000;

/**
 * Renders its children only for a signed-in user.
 *
 * On first render it restores the session from the httpOnly refresh cookie
 * (the access token lives in memory and does not survive a reload):
 * - session rejected → login page, remembering where the user was going;
 * - API unreachable → a "reconnecting" notice and retries with backoff,
 *   because an outage is not a reason to sign the user out.
 * It also follows later session changes (expiry, logout in another tab).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const authStatus = useAppStore((s) => s.authStatus);
  const [unavailable, setUnavailable] = useState(false);
  const t = useT();

  useEffect(() => {
    purgeLegacyStorage();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attempt = async (delay: number) => {
      const outcome = await ensureSession();
      if (cancelled) return;
      setUnavailable(outcome === "unavailable");
      if (outcome === "unavailable") {
        timer = setTimeout(() => void attempt(Math.min(delay * 2, RETRY_MAX_MS)), delay);
      }
    };
    void attempt(RETRY_INITIAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (authStatus === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authStatus, pathname, router]);

  if (authStatus !== "authenticated") {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-50 dark:bg-surface-950"
        role="status"
        aria-live="polite"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <span className={unavailable ? "text-sm text-surface-500" : "sr-only"}>
          {unavailable ? t("auth.reconnecting") : t("auth.loading")}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
