"use client";

import { useEffect, useId, useMemo } from "react";
import {
  Calculator,
  CheckCircle2,
  CircleDashed,
  Layers3,
  Minus,
  Plus,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { ScoreMeter } from "@/components/common/score-meter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuditReport, PricingItem } from "@/lib/types/audit";
import { applyProposalOffer, isProposalOfferActive } from "@/lib/utils/proposal-offers";
import {
  applyProposalPriceDisplayMultiplier,
  calculateProjectedScore,
  calculatePricingSummary,
  calculateRoiScenario,
  getDefaultSelectedIds,
} from "@/lib/utils/pricing";
import { usePricingDisplayStore } from "@/store/pricing-display-store";
import { usePricingStore } from "@/store/pricing-store";
import { useUiStore } from "@/store/ui-store";

const impactVariants = {
  core: "success",
  high: "warning",
  transformative: "accent",
} as const;

const impactLabels = {
  core: "Core",
  high: "High",
  transformative: "Transformative",
} as const;

function PricingRow({
  item,
  synergyTitles,
  selected,
  onToggle,
  priceMultiplier = 1,
}: {
  item: PricingItem;
  synergyTitles: string[];
  selected: boolean;
  onToggle: () => void;
  priceMultiplier?: number;
}) {
  const descriptionId = useId();
  const benchmarkId = useId();
  const displayPrice = Math.round(item.price * priceMultiplier);

  return (
    <div
      className="grid gap-4 border-t border-border/70 px-4 py-4 md:grid-cols-[minmax(0,1.7fr)_9rem_minmax(0,0.95fr)_7rem_3rem] md:items-start"
      role="row"
    >
        <div className="space-y-3" role="cell">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={selected ? "accent" : "neutral"}>
              {selected ? "Selected" : "Optional"}
            </Badge>
            <Badge variant={impactVariants[item.impactLevel]}>{impactLabels[item.impactLevel]}</Badge>
          </div>
          <div>
            <h3 className="text-[1rem] font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted" id={descriptionId}>
              {item.description}
            </p>
          </div>
        <Accordion collapsible type="single">
          <AccordionItem className="bg-background-alt/60 px-4" value={`${item.id}-details`}>
            <AccordionTrigger>Deliverables</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {item.deliverables.map((deliverable) => (
                    <div
                      className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3 text-sm text-foreground"
                      key={deliverable}
                    >
                      {deliverable}
                    </div>
                  ))}
                </div>
                {synergyTitles.length ? (
                  <div className="rounded-[calc(var(--theme-radius)-6px)] border border-accent/20 bg-accent/8 px-4 py-3 text-sm leading-6 text-foreground">
                    Pairs with: {synergyTitles.join(", ")}.
                  </div>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-2" role="cell">
        <p className="font-display text-[2rem] font-semibold text-accent">
          +{item.estimatedScoreLift.toFixed(1)}
        </p>
        <p className="text-sm font-semibold text-foreground">{item.estimatedLiftLabel}</p>
        <p className="text-xs leading-5 text-muted">
          Focus: {item.liftFocus.map((entry) => entry.replace(/-/g, " ")).join(", ")}
        </p>
      </div>

      <div className="space-y-2" role="cell">
        <p className="text-sm font-semibold text-foreground">{item.sourceLabel}</p>
        <p className="text-sm leading-6 text-muted" id={benchmarkId}>
          {item.benchmarkNote}
        </p>
      </div>

      <div className="space-y-2 md:text-right" role="cell">
        <p className="font-display text-[2rem] font-semibold text-accent">
          ${displayPrice.toLocaleString()}
        </p>
      </div>

      <div className="md:justify-self-end md:self-start" role="cell">
        <Button
          aria-describedby={`${descriptionId} ${benchmarkId}`}
          aria-label={selected ? `Remove ${item.title}` : `Add ${item.title}`}
          aria-pressed={selected}
          className="size-10 px-0"
          onClick={onToggle}
          size="icon"
          variant={selected ? "secondary" : "default"}
        >
          {selected ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

export function PricingConfigurator({ report }: { report: AuditReport }) {
  const monthlyLeadId = useId();
  const leadToClientId = useId();
  const averageClientValueId = useId();
  const initializeReport = usePricingStore((state) => state.initializeReport);
  const toggleItem = usePricingStore((state) => state.toggleItem);
  const setSelections = usePricingStore((state) => state.setSelections);
  const setRoiValue = usePricingStore((state) => state.setRoiValue);
  const storedSelections = usePricingStore((state) => state.selectionsByReport[report.id]);
  const storedRoi = usePricingStore((state) => state.roiByReport[report.id]);
  const setContactModalOpen = useUiStore((state) => state.setContactModalOpen);
  const proposalPriceMultiplier = usePricingDisplayStore((state) => state.proposalPriceMultiplier);
  const selections = storedSelections ?? getDefaultSelectedIds(report.pricingBundle);
  const roi = storedRoi ?? report.roiDefaults;
  const baseOnlySelections = [report.pricingBundle.baseItem.id];
  const allSelections = [
    report.pricingBundle.baseItem.id,
    ...report.pricingBundle.addOns.map((item) => item.id),
  ];

  useEffect(() => {
    initializeReport(report.id, getDefaultSelectedIds(report.pricingBundle), report.roiDefaults);
  }, [initializeReport, report.id, report.pricingBundle, report.roiDefaults]);

  const summary = calculatePricingSummary(report.pricingBundle, selections);
  const displaySummary = useMemo(
    () => applyProposalPriceDisplayMultiplier(summary, proposalPriceMultiplier),
    [summary, proposalPriceMultiplier],
  );
  const offerSummary = applyProposalOffer(displaySummary.total, report.proposalOffer);
  const roiScenario = calculateRoiScenario(offerSummary.finalTotal, roi);
  const projectedScore = calculateProjectedScore(report.overallScore, summary.selectedPackageItems);
  const objectionCards = [
    {
      title: "Patches rarely fix the root problem",
      subtitle: "Why band-aids stall the score",
      icon: ShieldCheck,
      body: report.objectionHandling[0],
    },
    {
      title: "Phased work is lower risk",
      subtitle: "Validate step by step",
      icon: Layers3,
      body: report.objectionHandling[1],
    },
    {
      title: "Scope can flex with budget",
      subtitle: "Keep the strategy, trim the extras",
      icon: WalletCards,
      body: report.objectionHandling[2],
    },
  ];

  const proposalSummarySections = (
    <>
      <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Total investment</p>
        <p
          aria-live="polite"
          className="mt-2 font-display text-[2.4rem] font-semibold leading-none text-accent"
        >
          ${offerSummary.finalTotal.toLocaleString()}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Planning estimate only — final scope and price depend on discovery.
        </p>
        {report.proposalOffer ? (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold text-foreground">{report.proposalOffer.label}</p>
            <p className="text-xs leading-5 text-muted">{report.proposalOffer.reason}</p>
            <p className="text-xs leading-5 text-muted">
              {isProposalOfferActive(report.proposalOffer)
                ? `From $${offerSummary.originalTotal.toLocaleString()} · expires ${new Date(report.proposalOffer.expiresAt).toLocaleDateString()}`
                : "Offer expired"}
            </p>
          </div>
        ) : null}
        <p className="mt-2 text-sm leading-6 text-muted">{report.pricingBundle.stickyNote}</p>
        <div className="mt-4 rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 p-4">
          <ScoreMeter
            className="max-w-full"
            compact
            label="Projected impact"
            projectedScore={projectedScore}
            score={report.overallScore}
            valueClassName="text-[2.25rem] sm:text-[2.35rem]"
          />
          <p className="mt-3 text-sm leading-7 text-muted">
            Current score first, projected score underneath. Add-ons update the values so the lift stays
            obvious on every device.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel/55 px-4 py-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground">{displaySummary.baseItem.title}</p>
            <p className="text-xs leading-5 text-muted">${displaySummary.baseItem.price.toLocaleString()}</p>
          </div>
        </div>
        {displaySummary.selectedAddOns.length === 0 ? (
          <div className="rounded-[calc(var(--theme-radius)-4px)] border border-dashed border-border/70 bg-background-alt/50 px-4 py-3 text-sm text-muted">
            No add-ons selected.
          </div>
        ) : null}
        {displaySummary.selectedAddOns.map((item) => (
          <div
            className="flex items-start justify-between gap-3 rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel/55 px-4 py-3"
            key={item.id}
          >
            <div className="flex items-start gap-3">
              <Plus className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs leading-5 text-muted">${item.price.toLocaleString()}</p>
                <p className="text-xs leading-5 text-muted">+{item.estimatedScoreLift.toFixed(1)} score</p>
              </div>
            </div>
            <Button
              aria-label={`Remove ${item.title}`}
              size="sm"
              variant="ghost"
              onClick={() => toggleItem(report.id, item.id)}
            >
              <Minus className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      {displaySummary.synergyNotes.length ? (
        <div className="rounded-[calc(var(--theme-radius)-2px)] border border-accent/20 bg-accent/8 p-4">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <TrendingUp className="size-4" />
            Good combinations
          </div>
          <div className="space-y-2 text-sm leading-6 text-foreground">
            {displaySummary.synergyNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Suggested next upgrades</p>
        {displaySummary.recommendedUpsells.map((item) => (
          <div
            className="flex items-center justify-between gap-3 rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-3"
            key={item.id}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted">
                {item.estimatedLiftLabel} · +{item.estimatedScoreLift.toFixed(1)}
              </p>
            </div>
            <CircleDashed className="size-4 shrink-0 text-accent" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button className="w-full" onClick={() => setContactModalOpen(true)}>
          Book Strategy Call
        </Button>
      </div>
    </>
  );

  return (
    <section className="presentation-section" id="pricing">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Choose your price"
          title="Scope the proposal like a real estimate"
          description="The base rebuild should create a visible lift on its own. Add-ons are only for broader page coverage, search growth, or follow-up systems. Shown prices are estimates for planning, not a binding quote."
        />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-6">
            <Card className="border-accent/20 bg-accent/8">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Badge variant="accent">Base package</Badge>
                    <CardTitle className="mt-3 text-3xl">{report.pricingBundle.baseItem.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted">
                      +{report.pricingBundle.baseItem.estimatedScoreLift.toFixed(1)} score when the core rebuild is completed well.
                    </p>
                  </div>
                  <p className="font-display text-4xl font-semibold text-accent">
                    $
                    {Math.round(report.pricingBundle.baseItem.price * proposalPriceMultiplier).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted">
                  {report.pricingBundle.baseItem.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {report.pricingBundle.baseItem.deliverables.map((deliverable) => (
                    <div
                      className="rounded-[calc(var(--theme-radius)-4px)] border border-accent/20 bg-panel/60 px-4 py-3 text-sm text-foreground"
                      key={deliverable}
                    >
                      {deliverable}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2 pb-5">
                <Badge variant="neutral">Straight answers</Badge>
                <CardTitle className="text-[clamp(2.85rem,2.35rem+0.8vw,3.55rem)] leading-[0.96] tracking-[-0.04em]">
                  What clients ask before they sign
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-3">
                {objectionCards.map((item) => (
                  <div
                    className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-4"
                    key={item.title}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-[8px] border border-accent/20 bg-accent/10 p-2 text-accent">
                        <item.icon className="size-4" />
                      </div>
                      <h3 className="text-[clamp(1.8rem,1.55rem+0.35vw,2.15rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted">
                      {item.subtitle}
                    </p>
                    <p className="mt-3 text-[15px] leading-7 text-muted">{item.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="space-y-2 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Badge variant="neutral">Proposal line items</Badge>
                    <CardTitle className="mt-3 text-[clamp(2.8rem,2.35rem+0.7vw,3.35rem)] leading-[0.96] tracking-[-0.04em]">
                      Optional upgrades
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelections(report.id, allSelections)}
                    >
                      Add all
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelections(report.id, baseOnlySelections)}
                    >
                      Base only
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div aria-label="Optional proposal upgrades" role="table">
                  <div
                    className="hidden md:grid md:grid-cols-[minmax(0,1.7fr)_9rem_minmax(0,0.95fr)_7rem_3rem] md:gap-4 md:px-4 md:pb-2"
                    role="row"
                  >
                    <div role="columnheader">Scope item</div>
                    <div role="columnheader">Lift</div>
                    <div role="columnheader">Benchmark</div>
                    <div role="columnheader">Price</div>
                    <div aria-hidden="true" />
                  </div>
                  {report.pricingBundle.addOns.map((item) => (
                    <PricingRow
                      item={item}
                      key={item.id}
                      priceMultiplier={proposalPriceMultiplier}
                      synergyTitles={item.synergyWith
                        .map(
                          (relatedId) =>
                            report.pricingBundle.addOns.find((entry) => entry.id === relatedId)?.title,
                        )
                        .filter((value): value is string => Boolean(value))}
                      onToggle={() => toggleItem(report.id, item.id)}
                      selected={selections.includes(item.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-accent">
                  <Calculator className="size-4" />
                  ROI scenario calculator
                </div>
                <CardTitle className="text-3xl">Frame upside without overpromising</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted">
                  Use this for scenario planning only. Adjust the inputs to match the
                  client&apos;s actual lead economics and sales reality.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-[0.18em] text-muted"
                      htmlFor={monthlyLeadId}
                    >
                      Extra leads / month
                    </label>
                    <Input
                      id={monthlyLeadId}
                      inputMode="numeric"
                      min={0}
                      onChange={(event) =>
                        setRoiValue(report.id, "monthlyLeadGain", Number(event.target.value))
                      }
                      type="number"
                      value={roi.monthlyLeadGain}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-[0.18em] text-muted"
                      htmlFor={leadToClientId}
                    >
                      Lead to client %
                    </label>
                    <Input
                      id={leadToClientId}
                      inputMode="numeric"
                      max={100}
                      min={0}
                      onChange={(event) =>
                        setRoiValue(report.id, "leadToClientRate", Number(event.target.value))
                      }
                      type="number"
                      value={roi.leadToClientRate}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs uppercase tracking-[0.18em] text-muted"
                      htmlFor={averageClientValueId}
                    >
                      Average client value
                    </label>
                    <Input
                      id={averageClientValueId}
                      inputMode="numeric"
                      min={0}
                      onChange={(event) =>
                        setRoiValue(report.id, "averageClientValue", Number(event.target.value))
                      }
                      type="number"
                      value={roi.averageClientValue}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Monthly pipeline
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                      ${roiScenario.monthlyPipelineValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Payback period
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                      {roiScenario.paybackMonths} mo
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Annualized upside
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                      ${roiScenario.annualizedValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="xl:sticky xl:top-24 xl:h-fit">
            <Card className="overflow-hidden">
              <CardHeader>
                <Badge variant="accent">Proposal summary</Badge>
                <CardTitle className="text-3xl">Current package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">{proposalSummarySections}</CardContent>
            </Card>

          </aside>
        </div>
      </div>
    </section>
  );
}
