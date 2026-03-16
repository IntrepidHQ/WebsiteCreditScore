import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border text-sm font-semibold tracking-tight transition duration-300 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "border-accent/30 bg-accent text-[var(--theme-accent-foreground)] shadow-[var(--theme-shadow)] hover:scale-[1.01] hover:border-accent/60 hover:brightness-110",
        secondary:
          "border-border bg-panel/80 text-[var(--theme-panel-foreground)] hover:border-accent/40 hover:bg-elevated hover:text-[var(--theme-elevated-foreground)]",
        ghost:
          "border-transparent bg-transparent text-muted hover:text-foreground",
        outline:
          "border-border bg-transparent text-foreground hover:border-accent/40 hover:bg-panel/70",
      },
      size: {
        sm: "h-10 px-4",
        default: "h-12 px-6",
        lg: "h-14 px-7 text-base",
        icon: "size-11 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedVariant = variant ?? "default";
    const resolvedStyle =
      resolvedVariant === "default"
        ? {
            color: "var(--theme-accent-foreground)",
            WebkitTextFillColor: "var(--theme-accent-foreground)",
            ...style,
          }
        : style;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant: resolvedVariant, size, className }),
          resolvedVariant === "default" &&
            "[&_*]:text-[color:var(--theme-accent-foreground)] [&_svg]:text-[color:var(--theme-accent-foreground)]",
        )}
        ref={ref}
        style={resolvedStyle}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
