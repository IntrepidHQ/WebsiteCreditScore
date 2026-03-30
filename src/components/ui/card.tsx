import * as React from "react";

import { cn } from "@/lib/utils/cn";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border/70 bg-panel/75 shadow-[var(--theme-shadow)] backdrop-blur-sm",
        className,
      )}
      data-slot="card"
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2 p-5 sm:p-6", className)} data-slot="card-header" {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "font-display text-[clamp(2.7rem,2rem+1.8vw,4.1rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm leading-6 text-muted", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} data-slot="card-content" {...props} />;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
