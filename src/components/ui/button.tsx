import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Visual variants of {@link Button}. */
export const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary: "border border-input bg-card text-foreground shadow-xs hover:bg-accent",
        ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        danger: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        "danger-ghost": "text-destructive hover:bg-destructive/10",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a `<Link>`) with button styles. */
  asChild?: boolean;
  /** Show a spinner and disable the button while an action runs. */
  loading?: boolean;
}

/**
 * The one button of the app.
 *
 * Icon-only buttons (`size="icon"`) must receive an `aria-label`.
 *
 * @example
 * <Button variant="secondary" onClick={exportCsv}><Download /> Export</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...(asChild ? {} : { type: props.type ?? "button" })}
        {...props}
      >
        {loading && !asChild ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {children}
      </Component>
    );
  },
);
Button.displayName = "Button";
