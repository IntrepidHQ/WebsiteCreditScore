"use client";

import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { AuditReport } from "@/lib/types/audit";
import { applyProposalOffer } from "@/lib/utils/proposal-offers";
import {
  applyProposalPriceDisplayMultiplier,
  calculatePricingSummary,
  calculateProjectedScore,
  getDefaultSelectedIds,
} from "@/lib/utils/pricing";
import { usePricingDisplayStore } from "@/store/pricing-display-store";
import { usePricingStore } from "@/store/pricing-store";
import { useUiStore } from "@/store/ui-store";

/**
 * Mobile-only sticky bar at the bottom of audit report pages. Single summary bar
 * (desktop sidebar duplicate removed from PricingConfigurator). Emphasizes score
 * lift; investment total is secondary.
 */
export function MobileProposalSticky({ report }: { report: AuditReport }) {
  const [open, setOpen] = useState(false);
  const setContactModalOpen = useUiStore((s) => s.setContactModalOpen);
  const proposalPriceMultiplier = usePricingDisplayStore((s) => s.proposalPriceMultiplier);

  const selectedIds =
    usePricingStore((s) => s.selectionsByReport[report.id]) ??
    getDefaultSelectedIds(report.pricingBundle);

  const summary = calculatePricingSummary(report.pricingBundle, selectedIds);
  const displaySummary = useMemo(
    () => applyProposalPriceDisplayMultiplier(summary, proposalPriceMultiplier),
    [summary, proposalPriceMultiplier],
  );
  const offerSummary = applyProposalOffer(displaySummary.total, report.proposalOffer);
  const projectedScore = calculateProjectedScore(report.overallScore, summary.selectedPackageItems);

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-panel/95 backdrop-blur-md">
        <div className="flex items-end justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">Score with this scope</p>
            <p className="mt-1 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-foreground sm:text-[1.85rem]">
              <span className="tabular-nums">{report.overallScore.toFixed(1)}</span>
              <span className="mx-1.5 text-muted">→</span>
              <span className="tabular-nums text-accent">{projectedScore.toFixed(1)}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Investment{" "}
              <span className="font-medium tabular-nums text-foreground">
                ${offerSummary.finalTotal.toLocaleString()}
              </span>
              {proposalPriceMultiplier !== 1 ? (
                <span className="text-muted"> · {Math.round(proposalPriceMultiplier * 100)}% list</span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Button className="h-9 px-3 text-xs" onClick={() => setOpen(true)} size="sm" variant="secondary">
              <ChevronUp aria-hidden className="size-3.5" />
              Breakdown
            </Button>
            <Button className="h-9 px-3 text-xs" onClick={() => setContactModalOpen(true)} size="sm">
              Book call
            </Button>
          </div>
        </div>
      </div>

      <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="sm:hidden fixed inset-0 z-50 bg-background/75 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

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
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-accent">Proposal breakdown</p>
                <p className="mt-2 font-display text-3xl font-semibold leading-none text-foreground">
                  <span className="tabular-nums">{report.overallScore.toFixed(1)}</span>
                  <span className="mx-2 text-muted">→</span>
                  <span className="tabular-nums text-accent">{projectedScore.toFixed(1)}</span>
                </p>
                <p className="mt-1 text-sm text-muted">Current score to projected with selected scope</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">Total investment</p>
                <p className="font-display text-2xl font-semibold text-accent">
                  ${offerSummary.finalTotal.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Projected score lift from add-ons:{" "}
                  <span className="font-semibold text-foreground">
                    +{summary.projectedScoreLift.toFixed(1)} pts
                  </span>{" "}
                  (model)
                </p>
              </div>
              <DialogPrimitive.Close className="mt-1 rounded-full border border-border bg-panel p-2 text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                <X aria-hidden className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-3">
              {displaySummary.selectedPackageItems.map((item) => (
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
                    <p className="shrink-0 font-display text-lg font-semibold text-accent">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[calc(var(--theme-radius))] border border-accent/30 bg-accent/8 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">Total investment</p>
                  <p className="mt-1 text-xs text-muted">
                    {displaySummary.selectedPackageItems.length} item
                    {displaySummary.selectedPackageItems.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <p className="font-display text-2xl font-semibold text-accent">
                  ${offerSummary.finalTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {report.proposalOffer ? (
              <div className="mt-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-accent">Active offer</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{report.proposalOffer.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{report.proposalOffer.reason}</p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                  Expires {new Date(report.proposalOffer.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => setContactModalOpen(true)}>
                Book call
              </Button>
              <Button className="flex-1" onClick={() => setOpen(false)} variant="secondary">
                Close
              </Button>
            </div>

            <div className="h-safe-bottom mt-4" />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
