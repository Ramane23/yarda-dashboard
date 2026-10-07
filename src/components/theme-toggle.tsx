"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/useT";

/**
 * Light/dark switch. Uses `resolvedTheme` so it also works when the theme
 * follows the operating system.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useT();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" aria-hidden />;

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
