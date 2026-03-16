"use client";

import { useEffect, useId } from "react";
import {
  Calculator,
  CheckCircle2,
  CircleDashed,
  Minus,
  Plus,
  TrendingUp,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
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
import {
  calculateProjectedScore,
  calculatePricingSummary,
  calculateRoiScenario,
  getDefaultSelectedIds,
} from "@/lib/utils/pricing";
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
}: {
  item: PricingItem;
  synergyTitles: string[];
  selected: boolean;
  onToggle: () => void;
}) {
  const descriptionId = useId();
  const benchmarkId = useId();

  return (
    <div
      className="grid gap-4 border-t border-border/70 px-4 py-5 md:grid-cols-[minmax(0,1.55fr)_11rem_minmax(0,0.95fr)_8rem_3.25rem] md:items-start"
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
          <p className="text-base font-semibold text-foreground">{item.title}</p>
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
        <p className="font-display text-3xl font-semibold text-accent">
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
        <p className="font-display text-3xl font-semibold text-accent">
          ${item.price.toLocaleString()}
        </p>
      </div>

      <div className="md:justify-self-end md:self-start" role="cell">
        <Button
          aria-describedby={`${descriptionId} ${benchmarkId}`}
          aria-label={selected ? `Remove ${item.title}` : `Add ${item.title}`}
          aria-pressed={selected}
          className="size-11 px-0"
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
  const roiScenario = calculateRoiScenario(summary.total, roi);
  const projectedScore = calculateProjectedScore(report.overallScore, summary.selectedPackageItems);

  return (
    <section className="presentation-section" id="pricing">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Choose your price"
          title="Scope the proposal like a real estimate"
          description="Keep the base clear. Add-ons stay itemized so scope and price move together."
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
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
                    ${report.pricingBundle.baseItem.price.toLocaleString()}
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
              <CardHeader>
                <Badge variant="neutral">Why this matters now</Badge>
                <CardTitle className="text-3xl">Objection handling inside the estimate</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {report.objectionHandling.map((point) => (
                  <div
                    className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-4 text-sm leading-6 text-muted"
                    key={point}
                  >
                    {point}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Badge variant="neutral">Proposal line items</Badge>
                    <CardTitle className="mt-3 text-3xl">Optional upgrades</CardTitle>
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
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div aria-label="Optional proposal upgrades" role="table">
                  <div
                    className="hidden md:grid md:grid-cols-[minmax(0,1.55fr)_11rem_minmax(0,0.95fr)_8rem_3.25rem] md:gap-4 md:px-4 md:pb-2"
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

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <Card className="overflow-hidden">
              <CardHeader>
                <Badge variant="accent">Proposal summary</Badge>
                <CardTitle className="text-3xl">Current package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Total investment</p>
                  <p
                    aria-live="polite"
                    className="mt-2 font-display text-5xl font-semibold text-accent"
                  >
                    ${summary.total.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {report.pricingBundle.stickyNote}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel/50 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Current score</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                        {report.overallScore}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--theme-radius)-4px)] border border-accent/25 bg-accent/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Projected score</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-accent">
                        {projectedScore}
                      </p>
                      <p className="text-xs leading-5 text-muted">
                        Includes +{summary.projectedScoreLift.toFixed(1)} potential lift from the selected package.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel/55 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {summary.baseItem.title}
                      </p>
                      <p className="text-xs leading-5 text-muted">
                        ${summary.baseItem.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {summary.selectedAddOns.length === 0 ? (
                    <div className="rounded-[calc(var(--theme-radius)-4px)] border border-dashed border-border/70 bg-background-alt/50 px-4 py-3 text-sm text-muted">
                      No add-ons selected.
                    </div>
                  ) : null}
                  {summary.selectedAddOns.map((item) => (
                    <div
                      className="flex items-start justify-between gap-3 rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel/55 px-4 py-3"
                      key={item.id}
                    >
                      <div className="flex items-start gap-3">
                        <Plus className="mt-0.5 size-4 shrink-0 text-accent" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-xs leading-5 text-muted">
                            ${item.price.toLocaleString()}
                          </p>
                          <p className="text-xs leading-5 text-muted">
                            +{item.estimatedScoreLift.toFixed(1)} score
                          </p>
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

                {summary.synergyNotes.length ? (
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-accent/20 bg-accent/8 p-4">
                    <div className="mb-2 flex items-center gap-2 text-accent">
                      <TrendingUp className="size-4" />
                      Good combinations
                    </div>
                    <div className="space-y-2 text-sm leading-6 text-foreground">
                      {summary.synergyNotes.map((note) => (
                        <p key={note}>{note}</p>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Suggested next upgrades
                  </p>
                  {summary.recommendedUpsells.map((item) => (
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
              </CardContent>
            </Card>

            <div className="fixed inset-x-4 bottom-4 z-30 rounded-[calc(var(--theme-radius-lg))] border border-border bg-panel/90 p-4 shadow-[var(--theme-shadow)] backdrop-blur-xl lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Proposal total</p>
                  <p className="font-display text-3xl font-semibold text-accent">
                    ${summary.total.toLocaleString()}
                  </p>
                </div>
                <Button onClick={() => setContactModalOpen(true)}>Book call</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
