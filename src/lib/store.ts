import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Period } from "@/types/api";
import type { Locale } from "@/lib/i18n";

interface AppState {
  clientId: string;
  apiKey: string;
  period: Period;
  sidebarOpen: boolean;
  locale: Locale;
  viewAsClient: string;
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
      clientId: "",
      apiKey: "",
      period: "7d",
      sidebarOpen: true,
      locale: "en",
      viewAsClient: "",
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
