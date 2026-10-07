import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * YARDA wordmark with the shield.
 *
 * Both variants are rendered and CSS shows the one matching the theme, so
 * there is no flash of the wrong logo before the theme script runs. The dark
 * variant has a light wordmark (the original indigo one is unreadable on dark
 * surfaces).
 *
 * @param className - Sets the height (e.g. `h-7`); the width follows.
 */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative inline-flex h-7", className)}>
      <Image
        src="/logo.png"
        alt="YARDA"
        width={797}
        height={225}
        priority={priority}
        className="h-full w-auto dark:hidden"
      />
      <Image
        src="/logo-dark.png"
        alt="YARDA"
        width={797}
        height={225}
        priority={priority}
        className="hidden h-full w-auto dark:block"
      />
    </span>
  );
}
