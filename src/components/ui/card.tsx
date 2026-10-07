import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Surface that groups related content. Compose with the sub-components:
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Decisions</CardTitle>
 *     <CardDescription>Last 7 days</CardDescription>
 *     <CardActions><Button size="sm" variant="ghost">Export</Button></CardActions>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-xs", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/** Header row: title and description on the left, actions on the right. */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-start gap-x-4 gap-y-1 p-5 pb-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold leading-6 tracking-tight", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("basis-full text-xs text-muted-foreground", className)} {...props} />;
}

/** Right-aligned actions inside a {@link CardHeader}. */
export function CardActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ml-auto flex items-center gap-2", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 border-t px-5 py-3", className)} {...props} />;
}
