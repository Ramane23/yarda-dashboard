"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectIsAdmin, useAppStore } from "@/lib/store";

/**
 * Renders its children only for platform admins; redirects others to the
 * overview. The role comes from the server session, never from browser
 * storage. Must be used inside {@link AuthGuard}.
 *
 * This is a usability guard: the API enforces admin access independently.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useAppStore(selectIsAdmin);

  useEffect(() => {
    if (!isAdmin) router.replace("/dashboard");
  }, [isAdmin, router]);

  return isAdmin ? <>{children}</> : null;
}
