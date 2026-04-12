"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export const AuditHorizontalRail = ({
  children,
  "aria-label": ariaLabel,
  className,
  railClassName,
  tabIndex = 0,
}: {
  children: ReactNode;
  "aria-label": string;
  className?: string;
  /** Extra classes merged onto the scrolling `.horizontal-rail` grid. */
  railClassName?: string;
  tabIndex?: number;
}) => {
  return (
    <div className={cn("full-bleed-rail", className)}>
      <div
        aria-label={ariaLabel}
        className={cn("horizontal-rail gap-8", railClassName)}
        tabIndex={tabIndex}
      >
        {children}
      </div>
    </div>
  );
};
