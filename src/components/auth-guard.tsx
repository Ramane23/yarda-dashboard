"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

/**
 * Waits for Zustand store to rehydrate from localStorage,
 * then redirects to /login if no token is found.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAppStore((s) => s.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist rehydrates synchronously after first render.
    // We also check localStorage directly as a fallback.
    const stored = localStorage.getItem("token");
    const storeToken = useAppStore.getState().token;

    if (storeToken || stored) {
      setHydrated(true);
    } else {
      // Give Zustand one tick to rehydrate, then decide
      const unsub = useAppStore.persist.onFinishHydration?.(() => {
        const t = useAppStore.getState().token;
        if (t) {
          setHydrated(true);
        } else {
          router.replace("/login");
        }
        unsub?.();
      });

      // Fallback: if already hydrated but no token
      if (useAppStore.persist.hasHydrated?.()) {
        if (!useAppStore.getState().token && !stored) {
          router.replace("/login");
        } else {
          setHydrated(true);
        }
        unsub?.();
      }
    }
  }, [router]);

  // Also redirect if token disappears (e.g., logout in another tab)
  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
