"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Check,
  FileSearch,
  Gauge,
  Minus,
  ScanLine,
  Star,
  XCircle,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreCategoryIcons, scoreCategoryPalette } from "@/components/common/score-category-meta";
import type { AuditReport } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";

// ─── Performance helpers ────────────────────────────────────────────────────

type PerfRating = "good" | "needs-improvement" | "poor";

function lcpRating(ms: number): PerfRating {
  if (ms <= 2500) return "good";
  if (ms <= 4000) return "needs-improvement";
  return "poor";
}
function clsRating(v: number): PerfRating {
  if (v <= 0.1) return "good";
  if (v <= 0.25) return "needs-improvement";
  return "poor";
}
function fcpRating(ms: number): PerfRating {
  if (ms <= 1800) return "good";
  if (ms <= 3000) return "needs-improvement";
  return "poor";
}
function tbtRating(ms: number): PerfRating {
  if (ms <= 200) return "good";
  if (ms <= 600) return "needs-improvement";
  return "poor";
}

const ratingMeta: Record<PerfRating, { text: string; bg: string; border: string; label: string }> = {
  good:               { text: "text-success", bg: "bg-success/10",  border: "border-success/25",  label: "Good" },
  "needs-improvement":{ text: "text-warning", bg: "bg-warning/10",  border: "border-warning/25",  label: "Needs work" },
  poor:               { text: "text-danger",  bg: "bg-danger/10",   border: "border-danger/25",   label: "Poor" },
};

function MetricCard({ label, value, unit, rating }: { label: string; value: string; unit: string; rating: PerfRating }) {
  const m = ratingMeta[rating];
  return (
    <div className={cn("rounded-xl border p-3.5", m.border, m.bg)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1.5 font-display text-[1.65rem] leading-none tracking-[-0.04em]", m.text)}>
        {value}
        {unit && <span className="ml-0.5 font-sans text-[0.75rem] font-normal tracking-normal opacity-70">{unit}</span>}
      </p>
      <p className={cn("mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]", m.text)}>{m.label}</p>
    </div>
  );
}

// ─── "Found" items rendered as pill chips ───────────────────────────────────

function FoundChips({ text }: { text: string }) {
  const parts = text.split(" · ").filter(Boolean);
  if (parts.length === 1) {
    return <p className="mt-1 text-sm font-medium leading-6 text-foreground">{text}</p>;
  }
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {parts.map((part, i) => (
        <span
          className="rounded-full border border-border/60 bg-background-alt/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
          key={i}
        >
          {part}
        </span>
      ))}
    </div>
  );
}

// ─── Signal tab keys ────────────────────────────────────────────────────────

type SignalTab = "seo" | "technical" | "security" | "notable";

// ─── Main component ─────────────────────────────────────────────────────────

export function ResearchTraceSection({ report }: { report: AuditReport }) {
  const { researchTrace, provenance, siteObservation: obs, benchmarkReferences, categoryScores } = report;
  const [signalTab, setSignalTab] = useState<SignalTab>("seo");

  const isEstimated = provenance.mode !== "live-observed";
  const hasPerf = obs.performanceScore !== undefined;
  const perfScore = hasPerf ? Math.round(obs.performanceScore! * 100) : undefined;

  const criticalSignals = researchTrace.missingSignals.filter((s) => s.severity === "critical");
  const standardSignals = researchTrace.missingSignals.filter((s) => s.severity === "standard");

  const signalTabs: Array<{ key: SignalTab; label: string; signals: string[] }> = [
    { key: "seo",       label: "SEO",       signals: obs.seoSignals },
    { key: "technical", label: "Technical", signals: obs.technicalSignals },
    { key: "security",  label: "Security",  signals: obs.securitySignals },
    { key: "notable",   label: "Notable",   signals: obs.notableDetails },
  ];
  const activeSignals = signalTabs.find((t) => t.key === signalTab)?.signals ?? [];
  const totalSignals = obs.seoSignals.length + obs.technicalSignals.length + obs.securitySignals.length + obs.notableDetails.length;
  const hasAnySignals = totalSignals > 0;

  const selectionLabel =
    provenance.benchmarkSelectionSource === "claude-rerank"
      ? "AI-ranked from 28+ candidates"
      : provenance.benchmarkSelectionSource === "niche"
        ? "Matched by industry niche"
        : "Heuristic selection";

  return (
    <section className="presentation-section" id="research-trace">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8">

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="space-y-5 lg:pr-8">
          <Badge variant="accent">Research Trace</Badge>
          <div className="space-y-4">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <ScanLine className="size-6" />
            </div>
            <h2 className="font-display text-[clamp(3.25rem,2.6rem+1vw,4.8rem)] font-semibold tracking-[-0.04em] leading-[0.9]">
              How this was researched
            </h2>
            <p className="text-[1.08rem] leading-[1.95rem] text-muted">
              Every finding is grounded in signals pulled directly from the live site — including raw SEO and technical signals, Core Web Vitals from Google PageSpeed, benchmark comparison against industry leaders, and a full derivation of how each of the seven scores was calculated.
            </p>
          </div>

          {isEstimated && (
            <div className="rounded-xl border border-warning/25 bg-warning/8 p-4">
              <p className="text-sm leading-6 text-muted">
                <span className="font-semibold text-warning">Estimated mode.</span>{" "}
                Live signals were unavailable. Analysis uses heuristic baselines.
              </p>
            </div>
          )}

          {/* Quick-stat counters */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Analysis passes", value: String(researchTrace.steps.length), tone: "foreground" },
              { label: "Signals detected", value: String(totalSignals), tone: "foreground" },
              { label: "Benchmarks", value: String(benchmarkReferences.length), tone: "foreground" },
              {
                label: "Missing signals",
                value: String(researchTrace.missingSignals.length),
                tone: researchTrace.missingSignals.length > 0 ? "danger" : "success",
              },
            ].map(({ label, value, tone }) => (
              <div
                className="rounded-xl border border-border/60 bg-panel/50 px-4 py-3"
                key={label}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
                <p
                  className={cn(
                    "mt-1 font-display text-[2rem] leading-none tracking-[-0.04em]",
                    tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-foreground",
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-4">

          {/* 1 · Analysis passes ──────────────────────────────────────── */}
          <Card>
            <CardHeader className="px-5 pb-2 pt-5">
              <CardTitle className="text-2xl font-semibold">Analysis passes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion collapsible type="single">
                {researchTrace.steps.map((step) => (
                  <AccordionItem
                    className="border-border/60 last:border-0"
                    key={step.pass}
                    value={`pass-${step.pass}`}
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full",
                            step.status === "complete" ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
                          )}
                        >
                          {step.status === "complete" ? <Check className="size-3.5" /> : <Minus className="size-3.5" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Pass {step.pass}</p>
                          <p className="text-base font-semibold text-foreground">{step.label}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5">
                      <div className="space-y-3 pl-9">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Analyzed</p>
                          <p className="mt-1 text-sm leading-6 text-muted">{step.what}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Found</p>
                          <FoundChips text={step.found} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* 2 · Extracted elements + Missing signals ─────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-center gap-2">
                  <FileSearch className="size-4 text-accent" />
                  <CardTitle className="text-2xl font-semibold">Extracted from site</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Hero text</p>
                  {researchTrace.extractedElements.heroText ? (
                    <p className="mt-1.5 rounded-lg border border-border/50 bg-background-alt/50 px-3 py-2 text-sm font-medium italic leading-6 text-foreground">
                      &ldquo;{researchTrace.extractedElements.heroText}&rdquo;
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Not detected</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">CTAs found</p>
                  {researchTrace.extractedElements.ctaLabels.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {researchTrace.extractedElements.ctaLabels.map((cta, i) => (
                        <span className="rounded border border-border/70 bg-background-alt/60 px-2 py-0.5 text-xs font-medium" key={i}>{cta}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted">None detected</p>
                  )}
                </div>
                {researchTrace.extractedElements.trustSignals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Trust signals</p>
                    <ul className="mt-1.5 space-y-1">
                      {researchTrace.extractedElements.trustSignals.map((signal, i) => (
                        <li className="line-clamp-1 text-xs text-muted" key={i}>{signal}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {researchTrace.extractedElements.metaDescription && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Meta description</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{researchTrace.extractedElements.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-danger" />
                  <CardTitle className="text-2xl font-semibold">Missing signals</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {researchTrace.missingSignals.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    <p className="text-sm text-muted">No critical signals missing.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalSignals.length > 0 && (
                      <ul className="space-y-2">
                        {criticalSignals.map((signal, i) => (
                          <li className="flex items-start gap-2" key={i}>
                            <XCircle className="mt-0.5 size-3.5 shrink-0 text-danger" />
                            <p className="text-sm font-medium leading-6 text-foreground">{signal.label}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {criticalSignals.length > 0 && standardSignals.length > 0 && (
                      <div className="border-t border-border/40" />
                    )}
                    {standardSignals.length > 0 && (
                      <ul className="space-y-2">
                        {standardSignals.map((signal, i) => (
                          <li className="flex items-start gap-2" key={i}>
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning/70" />
                            <p className="text-sm leading-6 text-muted">{signal.label}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 3 · Raw signals (tabbed) ──────────────────────────────────── */}
          {hasAnySignals && (
            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-accent" />
                    <CardTitle className="text-2xl font-semibold">Raw signals detected</CardTitle>
                  </div>
                  <p className="text-xs text-muted">{totalSignals} total</p>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border/40 pb-3">
                  {signalTabs.map((tab) => (
                    <button
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                        signalTab === tab.key
                          ? "bg-accent/15 text-accent"
                          : "text-muted hover:text-foreground",
                      )}
                      key={tab.key}
                      onClick={() => setSignalTab(tab.key)}
                      type="button"
                    >
                      {tab.label}
                      <span className="ml-1.5 opacity-60">({tab.signals.length})</span>
                    </button>
                  ))}
                </div>
                {activeSignals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeSignals.map((signal, i) => (
                      <span
                        className="rounded-lg border border-border/50 bg-background-alt/50 px-3 py-1.5 text-xs leading-5 text-muted"
                        key={i}
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No signals detected in this category.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4 · Performance — Core Web Vitals ────────────────────────── */}
          {hasPerf && perfScore !== undefined && (
            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-accent" />
                    <CardTitle className="text-2xl font-semibold">Performance — Google PageSpeed (mobile)</CardTitle>
                  </div>
                  <Badge variant={perfScore >= 90 ? "success" : perfScore >= 50 ? "warning" : "danger"}>
                    {perfScore} / 100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {/* Overall bar */}
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em]">
                    <span className="text-muted">Overall score</span>
                    <span className={
                      perfScore >= 90 ? "text-success" : perfScore >= 50 ? "text-warning" : "text-danger"
                    }>{perfScore}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${perfScore}%`,
                        background: perfScore >= 90 ? "var(--theme-success)" : perfScore >= 50 ? "var(--theme-warning)" : "var(--theme-danger)",
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>

                {/* Core Web Vitals grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {obs.lcp !== undefined && (
                    <MetricCard label="LCP" value={(obs.lcp / 1000).toFixed(1)} unit="s" rating={lcpRating(obs.lcp)} />
                  )}
                  {obs.cls !== undefined && (
                    <MetricCard label="CLS" value={obs.cls.toFixed(2)} unit="" rating={clsRating(obs.cls)} />
                  )}
                  {obs.fcp !== undefined && (
                    <MetricCard label="FCP" value={(obs.fcp / 1000).toFixed(1)} unit="s" rating={fcpRating(obs.fcp)} />
                  )}
                  {obs.tbt !== undefined && (
                    <MetricCard label="TBT" value={String(Math.round(obs.tbt))} unit="ms" rating={tbtRating(obs.tbt)} />
                  )}
                </div>

                <p className="mt-3 text-[11px] leading-5 text-muted">
                  LCP (Largest Contentful Paint) · CLS (Cumulative Layout Shift) · FCP (First Contentful Paint) · TBT (Total Blocking Time).
                  Thresholds: LCP &lt;2.5s · CLS &lt;0.1 · FCP &lt;1.8s · TBT &lt;200ms.
                  Measured by Google PageSpeed Insights on mobile.
                </p>
              </CardContent>
            </Card>
          )}

          {/* 5 · Benchmark analysis ────────────────────────────────────── */}
          {benchmarkReferences.length > 0 && (
            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-accent" />
                    <CardTitle className="text-2xl font-semibold">Benchmark references</CardTitle>
                  </div>
                  <Badge variant="neutral">{selectionLabel}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">
                  These industry-leading sites were selected for comparison. Their patterns and measured scores informed the findings and recommendations in this report.
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {benchmarkReferences.map((ref) => (
                    <div
                      className="space-y-3 rounded-xl border border-border/60 bg-background-alt/40 p-4"
                      key={ref.id}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{ref.name}</p>
                          <p className="truncate text-xs text-muted">{ref.url}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <Badge variant="neutral" className="capitalize">{ref.tier}</Badge>
                          {(ref.measuredScore ?? ref.targetScore) > 0 && (
                            <p className="text-xs font-semibold tabular-nums text-foreground">
                              {(ref.measuredScore ?? ref.targetScore).toFixed(1)} / 10
                            </p>
                          )}
                        </div>
                      </div>

                      {ref.bestFor && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Best for</p>
                          <p className="mt-0.5 text-xs leading-5 text-muted">{ref.bestFor}</p>
                        </div>
                      )}

                      {ref.strengths.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {ref.strengths.slice(0, 4).map((strength) => (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                              key={strength}
                              style={{
                                color: scoreCategoryPalette[strength],
                                backgroundColor: `${scoreCategoryPalette[strength]}1a`,
                                border: `1px solid ${scoreCategoryPalette[strength]}40`,
                              }}
                            >
                              {strength.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}

                      {ref.whatWorks.length > 0 && (
                        <ul className="space-y-1.5">
                          {ref.whatWorks.slice(0, 3).map((item, i) => (
                            <li className="flex items-start gap-2" key={i}>
                              <Check className="mt-0.5 size-3 shrink-0 text-success" />
                              <span className="text-xs leading-5 text-muted">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {ref.reusablePatterns.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Reusable patterns</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {ref.reusablePatterns.slice(0, 3).map((pattern, i) => (
                              <span
                                className="rounded border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] text-muted"
                                key={i}
                              >
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6 · Score derivation ──────────────────────────────────────── */}
          <Card>
            <CardHeader className="px-5 pb-3 pt-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-accent" />
                <CardTitle className="text-2xl font-semibold">Score derivation</CardTitle>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">
                How each of the seven category scores was calculated from observed page signals.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion collapsible type="single">
                {categoryScores.map((cat) => {
                  const color = scoreCategoryPalette[cat.key];
                  const Icon = scoreCategoryIcons[cat.key];
                  return (
                    <AccordionItem
                      className="border-border/60 last:border-0"
                      key={cat.key}
                      value={cat.key}
                    >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline">
                        <div className="flex w-full items-center gap-3 text-left">
                          <span
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              backgroundColor: `${color}1a`,
                              borderColor: `${color}40`,
                              color,
                            }}
                          >
                            <Icon className="size-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-foreground">{cat.label}</p>
                            <p className="text-[10px] text-muted">
                              weight {cat.weight === 1.25 ? "1.25×" : "1×"}
                            </p>
                          </div>
                          <p
                            className="mr-2 shrink-0 font-display text-[1.6rem] leading-none tracking-[-0.04em]"
                            style={{ color }}
                          >
                            {cat.score.toFixed(1)}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-5">
                        <div className="space-y-4 pl-11">
                          <p className="text-sm leading-6 text-muted">{cat.summary}</p>

                          {cat.details.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                                Signals used in scoring
                              </p>
                              <ul className="space-y-2">
                                {cat.details.map((detail, i) => (
                                  <li className="flex items-start gap-2.5 text-sm" key={i}>
                                    <span
                                      className="mt-2 size-1.5 shrink-0 rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="leading-6 text-muted">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                              <span>Score</span>
                              <span style={{ color }}>{cat.score.toFixed(1)} / 10</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-background/40">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${cat.score * 10}%`, backgroundColor: color, opacity: 0.7 }}
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
