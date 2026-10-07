"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/**
 * Toast notifications for the outcome of user actions (saved, revoked,
 * failed…). Mount once in the providers; trigger with `toast.success(…)` /
 * `toast.error(…)` from `sonner`.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-border !bg-popover !text-popover-foreground !shadow-overlay",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}
