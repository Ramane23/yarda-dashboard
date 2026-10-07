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
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Monitor,
  Workflow,
  Database,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { selectIsAdmin, useAppStore } from "@/lib/store";
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
  {
    href: "/dashboard/training-data",
    labelKey: "nav.trainingData",
    icon: Database,
    adminOnly: true,
  },
  { href: "/dashboard/models", labelKey: "nav.models", icon: Box, adminOnly: true },
  { href: "/dashboard/pipeline", labelKey: "nav.pipeline", icon: Workflow, adminOnly: true },
  { href: "/dashboard/system", labelKey: "nav.system", icon: Monitor, adminOnly: true },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const isAdmin = useAppStore(selectIsAdmin);
  const t = useT();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-card transition-[width] duration-200",
        sidebarOpen ? "w-60" : "w-[60px]",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b",
          sidebarOpen ? "gap-2 pl-5 pr-2" : "justify-center px-2",
        )}
      >
        {sidebarOpen ? (
          <Logo className="h-7" priority />
        ) : (
          <Image
            src="/icon.png"
            alt="YARDA"
            width={356}
            height={358}
            className="size-8 object-contain"
            priority
          />
        )}
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={toggleSidebar}
            aria-label={t("nav.collapse")}
            aria-expanded
          >
            <PanelLeftClose />
          </Button>
        )}
      </div>

      <nav aria-label={t("nav.main")} className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="mx-auto mb-2 flex"
            onClick={toggleSidebar}
            aria-label={t("nav.expand")}
            aria-expanded={false}
          >
            <PanelLeftOpen />
          </Button>
        )}
        {nav
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const label = t(item.labelKey);
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const link = (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={!sidebarOpen ? label : undefined}
                className={cn(
                  "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  !sidebarOpen && "justify-center px-0",
                )}
              >
                <item.icon
                  className={cn("size-4 shrink-0", active && "text-primary")}
                  aria-hidden
                />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            );
            return sidebarOpen ? (
              link
            ) : (
              <Tooltip key={item.href} content={label} side="right">
                {link}
              </Tooltip>
            );
          })}
      </nav>

      <div className="space-y-1 border-t p-2.5">
        <button
          type="button"
          onClick={handleLogout}
          aria-label={!sidebarOpen ? t("nav.signOut") : undefined}
          className={cn(
            "flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors",
            "hover:bg-destructive/10 hover:text-destructive",
            !sidebarOpen && "justify-center px-0",
          )}
        >
          <LogOut className="size-4" aria-hidden />
          {sidebarOpen && <span>{t("nav.signOut")}</span>}
        </button>
        {sidebarOpen && (
          <p className="px-2.5 pt-1 text-2xs text-subtle-foreground">{t("app.version")}</p>
        )}
      </div>
    </aside>
  );
}
