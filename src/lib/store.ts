/**
 * Global client state.
 *
 * Two kinds of state live here and are treated differently:
 * - **Session** (`user`, `authStatus`): who is signed in, as reported by the
 *   API. Never persisted; restored from the refresh cookie on page load.
 * - **Preferences** (`period`, `sidebarOpen`, `locale`, `viewAsClient`):
 *   persisted to localStorage because they are harmless conveniences.
 *
 * Earlier versions persisted the access token, role and tenant, which let
 * anyone unlock admin screens by editing localStorage (plan items SEC-31,
 * SEC-33, DSH-03).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";
import type { Period } from "@/types/api";

/** The signed-in user, as returned by the API. */
export interface SessionUser {
  id: number;
  email: string;
  displayName: string | null;
  role: "admin" | "client";
  /** Tenant slug for client users; `null` for platform admins. */
  clientId: string | null;
  clientName: string | null;
}

/** `unknown` until the first restore attempt finishes. */
export type AuthStatus = "unknown" | "authenticated" | "anonymous";

interface AppState {
  // Session (not persisted)
  user: SessionUser | null;
  authStatus: AuthStatus;
  setUser: (user: SessionUser) => void;
  clearUser: () => void;

  // Preferences (persisted)
  period: Period;
  sidebarOpen: boolean;
  locale: Locale;
  /** Tenant an admin is viewing; empty string means "all clients". */
  viewAsClient: string;
  setPeriod: (period: Period) => void;
  toggleSidebar: () => void;
  setLocale: (locale: Locale) => void;
  setViewAsClient: (clientId: string) => void;
}

type PersistedPreferences = Pick<AppState, "period" | "sidebarOpen" | "locale" | "viewAsClient">;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      authStatus: "unknown",
      setUser: (user) => set({ user, authStatus: "authenticated" }),
      clearUser: () => set({ user: null, authStatus: "anonymous", viewAsClient: "" }),

      period: "7d",
      sidebarOpen: true,
      locale: "en",
      viewAsClient: "",
      setPeriod: (period) => set({ period }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLocale: (locale) => set({ locale }),
      setViewAsClient: (viewAsClient) => set({ viewAsClient }),
    }),
    {
      name: "yarda-store",
      version: 2,
      partialize: (state): PersistedPreferences => ({
        period: state.period,
        sidebarOpen: state.sidebarOpen,
        locale: state.locale,
        viewAsClient: state.viewAsClient,
      }),
      // Version 1 persisted the token, role and tenant; keep only preferences.
      migrate: (persisted) => {
        const old = (persisted ?? {}) as Partial<PersistedPreferences>;
        return {
          period: old.period ?? "7d",
          sidebarOpen: old.sidebarOpen ?? true,
          locale: old.locale ?? "en",
          viewAsClient: old.viewAsClient ?? "",
        } satisfies PersistedPreferences;
      },
    },
  ),
);

/** Whether the signed-in user is a platform admin. */
export const selectIsAdmin = (state: AppState): boolean => state.user?.role === "admin";
