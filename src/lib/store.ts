import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Period } from "@/types/api";

interface AppState {
  clientId: string;
  apiKey: string;
  period: Period;
  sidebarOpen: boolean;
  setClientId: (id: string) => void;
  setApiKey: (key: string) => void;
  setPeriod: (p: Period) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      clientId: "",
      apiKey: "",
      period: "7d",
      sidebarOpen: true,
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
    }),
    { name: "yarda-store" },
  ),
);
