import * as React from "react";

import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-[8px] border border-border bg-panel/70 px-4 text-sm text-foreground shadow-[var(--theme-shadow)] outline-none transition placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger/70 aria-[invalid=true]:bg-danger/8 focus-visible:border-accent/60 focus-visible:bg-elevated focus-visible:ring-2 focus-visible:ring-accent/35",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };
