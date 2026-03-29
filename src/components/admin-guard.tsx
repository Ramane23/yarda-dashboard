"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Redirects non-admin users to /dashboard.
 * Must be used inside AuthGuard (which ensures hydration).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userRole = useAppStore((s) => s.userRole);
  const clientId = useAppStore((s) => s.clientId);

  const isAdmin =
    userRole === "admin" ||
    clientId === "admin" ||
    (typeof window !== "undefined" && localStorage.getItem("user_role") === "admin");

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return <>{children}</>;
}
