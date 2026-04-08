"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { AuditReport } from "@/lib/types/audit";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { usePricingStore } from "@/store/pricing-store";

/**
 * Mobile-only sticky bar at the bottom of audit report pages. Shows the
 * current proposal total and opens a bottom-sheet drawer with the full
 * pricing breakdown, score lift projections, and any active offer.
 *
 * Hidden at sm breakpoint and above where the full pricing configurator is
 * already visible in the sidebar.
 */
export function MobileProposalSticky({ report }: { report: AuditReport }) {
  const [open, setOpen] = useState(false);

  const selectedIds =
    usePricingStore((s) => s.selectionsByReport[report.id]) ??
    getDefaultSelectedIds(report.pricingBundle);

  const summary = calculatePricingSummary(report.pricingBundle, selectedIds);

  return (
    <>
      {/* Sticky bar — mobile only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-panel/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              Proposal total
            </p>
            <p className="font-display text-2xl font-semibold leading-none text-accent">
              ${summary.total.toLocaleString()}
            </p>
          </div>
          <Button onClick={() => setOpen(true)} size="sm">
            <ChevronUp aria-hidden className="size-4" />
            View breakdown
          </Button>
        </div>
      </div>

      {/* Bottom-sheet drawer */}
      <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
        <DialogPrimitive.Portal>
          {/* Overlay */}
          <DialogPrimitive.Overlay className="sm:hidden fixed inset-0 z-50 bg-background/75 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          {/* Bottom sheet content */}
          <DialogPrimitive.Content
            className={cn(
              "sm:hidden fixed bottom-0 left-0 right-0 z-50",
              "max-h-[82vh] overflow-y-auto overscroll-contain",
              "rounded-t-[calc(var(--theme-radius-lg))] border-t border-border bg-panel/98 p-5",
              "shadow-[0_-4px_32px_rgba(0,0,0,0.24)]",
              "outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
              "duration-300",
            )}
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                  Proposal breakdown
                </p>
                <p className="mt-1 font-display text-[clamp(2rem,1.6rem+1vw,2.9rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-foreground">
                  ${summary.total.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Projected score lift:{" "}
                  <span className="font-semibold text-foreground">
                    +{summary.projectedScoreLift.toFixed(1)} pts
                  </span>
                </p>
              </div>
              <DialogPrimitive.Close className="mt-1 rounded-full border border-border bg-panel p-2 text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                <X aria-hidden className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              {summary.selectedPackageItems.map((item) => (
                <div
                  className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-accent">
                        +{item.estimatedScoreLift.toFixed(1)} pts projected
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-xl font-semibold text-accent">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total summary row */}
            <div className="mt-4 rounded-[calc(var(--theme-radius))] border border-accent/30 bg-accent/8 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                    Total investment
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {summary.selectedPackageItems.length} item
                    {summary.selectedPackageItems.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <p className="font-display text-3xl font-semibold text-accent">
                  ${summary.total.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Offer details if active */}
            {report.proposalOffer ? (
              <div className="mt-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-accent">
                  Active offer
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {report.proposalOffer.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {report.proposalOffer.reason}
                </p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                  Expires {new Date(report.proposalOffer.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ) : null}

            {/* Bottom safe-area spacer for phones with home indicator */}
            <div className="h-safe-bottom mt-4" />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
