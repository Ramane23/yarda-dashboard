"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldAlert,
  Box,
  Settings,
  ChevronLeft,
  LogOut,
  Monitor,
  Workflow,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import type { TranslationKey } from "@/lib/i18n";

const nav: {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}[] = [
  { href: "/dashboard", labelKey: "nav.overview", icon: LayoutDashboard },
  { href: "/dashboard/transactions", labelKey: "nav.transactions", icon: ArrowLeftRight },

  { href: "/dashboard/review", labelKey: "nav.reviewQueue", icon: ShieldAlert },
  { href: "/dashboard/training-data", labelKey: "nav.trainingData", icon: Database },
  { href: "/dashboard/models", labelKey: "nav.models", icon: Box, adminOnly: true },
  { href: "/dashboard/pipeline", labelKey: "nav.pipeline", icon: Workflow, adminOnly: true },
  { href: "/dashboard/system", labelKey: "nav.system", icon: Monitor, adminOnly: true },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, logout, clientId } = useAppStore();
  const t = useT();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white transition-all duration-300 dark:bg-surface-900",
        sidebarOpen ? "w-64" : "w-[68px]",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        {sidebarOpen ? (
          <>
            {/* Light mode: full logo with dark text */}
            <Image
              src="/logo.png"
              alt="YARDA"
              width={160}
              height={40}
              className="h-9 w-auto dark:hidden"
            />
            {/* Dark mode: icon + text (logo text is dark, not visible on dark bg) */}
            <div className="hidden items-center gap-2.5 dark:flex">
              <Image
                src="/icon.png"
                alt="YARDA"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  {t("app.name")}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-surface-400">
                  {t("nav.fraudDetection")}
                </span>
              </div>
            </div>
          </>
        ) : (
          <Image src="/icon.png" alt="YARDA" width={36} height={36} className="h-9 w-9 shrink-0" />
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        >
          <ChevronLeft
            size={16}
            className={cn("transition-transform duration-300", !sidebarOpen && "rotate-180")}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav
          .filter((item) => {
            const isAdmin = useAppStore.getState().userRole === "admin" || clientId === "admin";
            return !item.adminOnly || isAdmin;
          })
          .map((item) => {
            const label = t(item.labelKey);
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                    : "text-surface-500 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200",
                  !sidebarOpen && "justify-center px-2",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                )}
                <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-surface-400 dark:hover:bg-red-950/30 dark:hover:text-red-400",
            !sidebarOpen && "justify-center px-2",
          )}
        >
          <LogOut size={18} />
          {sidebarOpen && <span>{t("nav.signOut")}</span>}
        </button>
        {sidebarOpen && (
          <p className="px-3 py-1 text-[10px] font-medium text-surface-400">{t("app.version")}</p>
        )}
      </div>
    </aside>
  );
}
