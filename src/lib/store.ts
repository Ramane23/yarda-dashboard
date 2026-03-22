import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Period } from "@/types/api";
import type { Locale } from "@/lib/i18n";

interface AppState {
  // Auth
  token: string;
  clientId: string;
  userRole: string; // "admin" | "client"
  displayName: string;
  // Legacy compat (still used by some components)
  apiKey: string;
  // UI
  period: Period;
  sidebarOpen: boolean;
  locale: Locale;
  viewAsClient: string;
  // Actions
  login: (opts: {
    token: string;
    clientId: string | null;
    role: string;
    displayName: string | null;
  }) => void;
  logout: () => void;
  setClientId: (id: string) => void;
  setApiKey: (key: string) => void;
  setPeriod: (p: Period) => void;
  toggleSidebar: () => void;
  setLocale: (l: Locale) => void;
  setViewAsClient: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: "",
      clientId: "",
      userRole: "",
      displayName: "",
      apiKey: "",
      period: "7d",
      sidebarOpen: true,
      locale: "en",
      viewAsClient: "",

      login: ({ token, clientId, role, displayName }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("client_id", clientId || (role === "admin" ? "admin" : ""));
        localStorage.setItem("user_role", role);
        set({
          token,
          clientId: clientId || (role === "admin" ? "admin" : ""),
          userRole: role,
          displayName: displayName || "",
        });
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("client_id");
        localStorage.removeItem("api_key");
        localStorage.removeItem("user_role");
        localStorage.removeItem("view_as_client");
        set({
          token: "",
          clientId: "",
          userRole: "",
          displayName: "",
          apiKey: "",
          viewAsClient: "",
        });
      },

      setClientId: (id) => {
        localStorage.setItem("client_id", id);
        set({ clientId: id });
      },
      setApiKey: (key) => {
        localStorage.setItem("api_key", key);
        set({ apiKey: key });
      },
      setPeriod: (period) => set({ period }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setLocale: (locale) => set({ locale }),
      setViewAsClient: (id) => {
        if (id) {
          localStorage.setItem("view_as_client", id);
        } else {
          localStorage.removeItem("view_as_client");
        }
        set({ viewAsClient: id });
      },
    }),
    { name: "yarda-store" },
  ),
);
