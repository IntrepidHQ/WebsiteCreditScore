"use client";

import { useId } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { usePricingDisplayStore } from "@/store/pricing-display-store";

export function WorkspaceProposalSettings() {
  const labelId = useId();
  const proposalPriceMultiplier = usePricingDisplayStore((s) => s.proposalPriceMultiplier);
  const setProposalPriceMultiplier = usePricingDisplayStore((s) => s.setProposalPriceMultiplier);

  const pct = Math.round(proposalPriceMultiplier * 100);

  return (
    <section aria-labelledby={labelId} className="space-y-4">
      <SectionHeading
        description="Scale every dollar amount shown in audit proposals (line items, totals, ROI inputs). Score math is unchanged — only displayed prices."
        eyebrow="Workspace"
        title="Proposal pricing display"
      />
      <Card className="border-border/70">
        <CardHeader className="space-y-2">
          <Badge variant="neutral">Client-facing</Badge>
          <CardTitle className="text-2xl" id={labelId}>
            List price multiplier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted">
              {pct}% of catalog prices — use for discounts or markups you show on audits.
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums text-accent">{pct}%</p>
          </div>
          <Slider
            aria-label="Proposal price multiplier"
            max={130}
            min={70}
            onValueChange={([value]) => setProposalPriceMultiplier(value / 100)}
            step={1}
            value={[pct]}
          />
          <p className="text-xs leading-5 text-muted">
            Stored in this browser for your signed-in workspace session. Reset to 100% for catalog
            defaults.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
