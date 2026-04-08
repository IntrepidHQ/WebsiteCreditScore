import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  scoreCategoryIcons,
  scoreCategoryPalette,
} from "@/components/common/score-category-meta";
import { Button } from "@/components/ui/button";
import { PacketToolbar } from "@/features/audit/components/packet-toolbar";
import { applyProposalOffer } from "@/lib/utils/proposal-offers";
import { getBenchmarkReferenceScore } from "@/lib/mock/report-enhancements";
import type { AuditCategoryScore, AuditReport } from "@/lib/types/audit";
import {
  calculatePricingSummary,
  calculateProjectedScore,
  getDefaultSelectedIds,
} from "@/lib/utils/pricing";
import { describeScore, getScoreTone } from "@/lib/utils/scores";
import { createThemeTokens } from "@/lib/utils/theme";
import { lcpLabel, clsLabel, perfScoreTone } from "@/lib/utils/pagespeed";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PacketMetricCard({
  label,
  value,
  detail,
  accent = false,
  className = "",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "print-avoid-break rounded-[6px] border px-3 py-2.5 print:rounded-[4px] print:px-2.5 print:py-2",
        accent
          ? "border-[var(--packet-accent)]/30 bg-[var(--packet-accent)]/8 print:border-[var(--packet-accent)]/40 print:bg-[var(--packet-accent)]/10"
          : "border-border/70 bg-panel/72 print:border-slate-200 print:bg-slate-50",
        className,
      ].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:tracking-[0.06em] print:text-slate-500">
        {label}
      </p>
      <div className="mt-1.5">{value}</div>
      {detail ? (
        <div className="mt-1.5 text-xs leading-4 text-muted print:text-[11px] print:leading-4 print:text-slate-500">
          {detail}
        </div>
      ) : null}
    </div>
  );
}

function PacketFactCard({
  label,
  value,
  confidence,
}: {
  label: string;
  value: string;
  confidence: string;
}) {
  return (
    <div className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 px-3 py-2 print:rounded-[4px] print:border-slate-200 print:bg-white print:px-2.5 print:py-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:tracking-[0.06em] print:text-slate-500">
          {label}
        </p>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--packet-accent)] print:tracking-[0.05em]">
          {confidence}
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-5 text-foreground print:text-[12px] print:leading-4 print:text-slate-700">
        {value}
      </p>
    </div>
  );
}

function PacketCategoryCard({ item }: { item: AuditCategoryScore }) {
  const tone = getScoreTone(item.score);
  const toneClass =
    tone === "danger"
      ? "text-[var(--packet-danger)]"
      : tone === "warning"
        ? "text-[var(--packet-warning)]"
        : "text-[var(--packet-success)]";
  const Icon = scoreCategoryIcons[item.key];
  const color = scoreCategoryPalette[item.key];

  return (
    <div className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 px-2.5 py-2 print:rounded-[3px] print:border-slate-200 print:bg-white print:px-2 print:py-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] print:rounded-[3px]"
            style={{ backgroundColor: `${color}18`, color }}
          >
            <Icon className="size-3" />
          </span>
          <p className="text-[12px] font-semibold leading-tight text-foreground print:text-[11px] print:text-slate-700 truncate">
            {item.label}
          </p>
        </div>
        <p className={`font-display text-xl font-semibold leading-none shrink-0 print:text-[1.1rem] ${toneClass}`}>
          {item.score}
        </p>
      </div>
    </div>
  );
}

function PacketSection({
  eyebrow,
  children,
  breakAfter = false,
  noPrint = false,
}: {
  eyebrow: string;
  children: ReactNode;
  breakAfter?: boolean;
  noPrint?: boolean;
}) {
  if (noPrint) {
    return (
      <section className="print:hidden rounded-[8px] border border-border/70 bg-panel/92 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
        <div className="mt-3 space-y-4">{children}</div>
      </section>
    );
  }

  return (
    <section
      className={[
        "rounded-[8px] border border-border/70 bg-panel/92 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:p-5 lg:p-6",
        "print:rounded-none print:border-0 print:border-b print:border-b-slate-200 print:bg-white print:p-0 print:pb-3 print:shadow-none",
        breakAfter ? "print:break-after-page" : "",
      ].join(" ")}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-muted print:mb-2 print:text-[9px] print:tracking-[0.08em] print:text-slate-500">
        {eyebrow}
      </p>
      <div className="mt-3 space-y-4 print:mt-0 print:space-y-2.5">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main document
// ---------------------------------------------------------------------------

export function PacketDocument({
  report,
  accent,
  autoPrint = false,
}: {
  report: AuditReport;
  accent?: string;
  autoPrint?: boolean;
}) {
  const summary = calculatePricingSummary(
    report.pricingBundle,
    getDefaultSelectedIds(report.pricingBundle),
  );
  const offerSummary = applyProposalOffer(summary.total, report.proposalOffer);
  const projectedScore = calculateProjectedScore(
    report.overallScore,
    summary.selectedPackageItems,
  );
  const positiveFindings = report.findings
    .filter((f) => f.section === "what-working")
    .slice(0, 1);
  const topFindings = report.findings
    .filter((f) => f.section !== "what-working" && f.confidenceLevel !== "recommended")
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 } as const)[a.severity] - ({ high: 0, medium: 1, low: 2 } as const)[b.severity])
    .slice(0, 2);
  const packetPositives = positiveFindings.length
    ? positiveFindings
    : report.findings.filter((f) => f.section === "what-working").slice(0, 1);
  const packetIssues = topFindings.length
    ? topFindings
    : report.findings.filter((f) => f.section !== "what-working").slice(0, 2);
  const directionCards = report.opportunities.slice(0, 2);
  const verifiedFacts = report.siteObservation.verifiedFacts
    .filter((f) => f.type !== "about")
    .slice(0, 3);
  const benchmarkTargets = report.benchmarkReferences.map((i) => getBenchmarkReferenceScore(i));
  const referenceFloor = benchmarkTargets.length ? Math.min(...benchmarkTargets) : 8.2;
  const referenceCeiling = benchmarkTargets.length ? Math.max(...benchmarkTargets) : 9.1;
  const referenceNames = report.benchmarkReferences.slice(0, 3).map((i) => i.name);
  const priorityCategories = [...report.categoryScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
  const packetScopeItems = [
    summary.baseItem,
    ...summary.selectedAddOns
      .slice()
      .sort((a, b) => b.estimatedScoreLift - a.estimatedScoreLift)
      .slice(0, 3),
  ];
  const hiddenScopeItemCount = Math.max(0, summary.selectedPackageItems.length - packetScopeItems.length);

  // Performance metrics
  const obs = report.siteObservation;
  const hasPerfMetrics = obs.performanceScore != null;

  const packetTheme = createThemeTokens({ mode: "light", accentColor: accent || "#f7b21b" });
  const packetStyle = {
    "--packet-accent": packetTheme.surfaces.accent,
    "--packet-accent-soft": packetTheme.surfaces.accentSoft,
    "--packet-accent-foreground": packetTheme.surfaces.accentForeground,
    "--packet-success": packetTheme.surfaces.success,
    "--packet-warning": packetTheme.surfaces.warning,
    "--packet-danger": packetTheme.surfaces.danger,
    "--packet-border": packetTheme.surfaces.border,
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-background px-3 py-5 text-foreground print:bg-white print:px-0 print:py-0 print:text-slate-950"
      id="main-content"
      style={packetStyle}
    >
      {/* Screen-only navigation */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Button asChild variant="secondary">
          <Link href={`/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}>
            <ArrowLeft className="size-4" />
            Back to workspace
          </Link>
        </Button>
        <PacketToolbar
          autoPrint={autoPrint}
          emailBody={report.outreachEmail.body}
          emailSubject={report.outreachEmail.subject}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-3 print:max-w-none print:space-y-3">

        {/* ── PAGE 1: Website review ── */}
        <PacketSection breakAfter eyebrow="Website review · redesign direction">

          {/* Title row */}
          <div className="print:mb-2">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl lg:text-[3.6rem] print:text-[2rem] print:leading-[1.08] print:text-slate-950">
              {report.title}
            </h1>
            <p className="mt-1.5 text-base leading-6 text-muted print:mt-1 print:text-[12px] print:leading-5 print:text-slate-500">
              {report.normalizedUrl} · Website trust, clarity, and conversion audit
            </p>
          </div>

          {/* Screenshot — tighter crop in print */}
          <div className="overflow-hidden rounded-[6px] border border-border/70 bg-elevated/80 print:rounded-[4px] print:border-slate-300">
            <div className="relative aspect-[16/7] overflow-hidden bg-background-alt print:aspect-[16/5]">
              <Image
                alt={`${report.title} current site`}
                className="object-cover object-top"
                fill
                priority
                sizes="(min-width: 1024px) 1000px, 100vw"
                src={report.previewSet.current.desktop}
                unoptimized
              />
            </div>
          </div>

          {/* Executive summary */}
          <div className="rounded-[6px] border border-border/70 bg-elevated/80 p-3 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:tracking-[0.06em] print:text-slate-500">
                Executive summary
              </p>
              {report.provenance.narrativeSource === "claude" ? (
                <p className="text-[9px] font-medium uppercase tracking-[0.06em] text-muted print:text-slate-500">
                  Claude-assisted narrative
                </p>
              ) : null}
            </div>
            <p className="mt-1.5 text-[15px] leading-7 text-foreground print:mt-1 print:text-[12.5px] print:leading-[1.55] print:text-slate-700">
              {report.executiveSummary}
            </p>
          </div>

          {/* Verified facts — 3 cols in print */}
          {verifiedFacts.length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-1.5">
              {verifiedFacts.map((fact) => (
                <PacketFactCard
                  confidence={fact.confidence}
                  key={fact.id}
                  label={fact.label}
                  value={fact.value}
                />
              ))}
            </div>
          ) : null}

          {/* Score metrics row — 3 cols always */}
          <div className="grid gap-2 grid-cols-3 print:gap-1.5">
            <PacketMetricCard
              detail={describeScore(report.overallScore)}
              label="Current score"
              value={
                <p className="font-display text-3xl font-semibold text-foreground print:text-[1.6rem] print:text-slate-950">
                  {report.overallScore}
                  <span className="text-base text-muted print:text-slate-400"> /10</span>
                </p>
              }
            />
            <PacketMetricCard
              accent
              detail="Based on the recommended scope."
              label="Projected"
              value={
                <p className="font-display text-3xl font-semibold text-foreground print:text-[1.6rem] print:text-slate-950">
                  {projectedScore}
                  <span className="text-base text-muted print:text-slate-400"> /10</span>
                </p>
              }
            />
            <PacketMetricCard
              detail={referenceNames.length ? referenceNames.join(", ") : undefined}
              label="Reference range"
              value={
                <p className="font-display text-2xl font-semibold text-foreground print:text-[1.4rem] print:text-slate-950">
                  {referenceFloor.toFixed(1)}–{referenceCeiling.toFixed(1)}
                </p>
              }
            />
          </div>

          {/* PageSpeed metrics row — only rendered when available */}
          {hasPerfMetrics ? (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 print:grid-cols-4 print:gap-1.5">
              <PacketMetricCard
                label="Mobile perf score"
                value={
                  <p className={[
                    "font-display text-2xl font-semibold print:text-[1.3rem]",
                    perfScoreTone(obs.performanceScore ?? 0) === "good"
                      ? "text-[var(--packet-success)]"
                      : perfScoreTone(obs.performanceScore ?? 0) === "needs-improvement"
                        ? "text-[var(--packet-warning)]"
                        : "text-[var(--packet-danger)]",
                  ].join(" ")}>
                    {obs.performanceScore}
                    <span className="text-sm text-muted print:text-slate-400">/100</span>
                  </p>
                }
              />
              {obs.lcp ? (
                <PacketMetricCard
                  label="LCP (load speed)"
                  value={
                    <p className="font-display text-2xl font-semibold text-foreground print:text-[1.3rem] print:text-slate-950">
                      {lcpLabel(obs.lcp)}
                    </p>
                  }
                />
              ) : null}
              {obs.cls != null ? (
                <PacketMetricCard
                  label="CLS (layout shift)"
                  value={
                    <p className="font-display text-2xl font-semibold text-foreground print:text-[1.3rem] print:text-slate-950">
                      {clsLabel(obs.cls)}
                    </p>
                  }
                />
              ) : null}
              {obs.fcp ? (
                <PacketMetricCard
                  label="FCP (first paint)"
                  value={
                    <p className="font-display text-2xl font-semibold text-foreground print:text-[1.3rem] print:text-slate-950">
                      {(obs.fcp / 1000).toFixed(1)}s
                    </p>
                  }
                />
              ) : null}
            </div>
          ) : null}

          {/* Category scores — 2-col grid in print for density */}
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4 print:gap-1.5">
            {report.categoryScores.map((item) => (
              <PacketCategoryCard item={item} key={item.key} />
            ))}
          </div>

          {/* Priority tags + offer — inline row */}
          <div className="flex flex-wrap items-center gap-2 print:gap-1.5">
            {priorityCategories.map((item) => (
              <span
                className="rounded-full border border-border/70 bg-panel/72 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground print:border-slate-300 print:bg-white print:text-[9px] print:text-slate-600"
                key={item.key}
              >
                Priority: {item.label}
              </span>
            ))}
            {report.proposalOffer ? (
              <span className="rounded-full border border-[var(--packet-accent)]/30 bg-[var(--packet-accent)]/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--packet-accent)] print:border-[var(--packet-accent)]/50 print:text-[9px]">
                {report.proposalOffer.label} · ${offerSummary.finalTotal.toLocaleString()}
              </span>
            ) : null}
          </div>
        </PacketSection>

        {/* ── PAGE 2: Findings + Direction ── */}
        <PacketSection eyebrow="What is working · what is costing response">
          {/* Two columns preserved in print */}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] print:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] print:gap-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:tracking-[0.06em] print:text-slate-500">
                What is already working
              </p>
              {packetPositives.map((finding) => (
                <div
                  className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-l-[3px] print:border-l-emerald-500 print:border-slate-200 print:bg-slate-50 print:p-2"
                  key={finding.id}
                >
                  <h2 className="font-display text-xl font-semibold print:text-[1.1rem] print:text-slate-950">
                    {finding.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-6 text-foreground print:mt-1 print:text-[11.5px] print:leading-[1.5] print:text-slate-700">
                    {finding.summary}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--packet-accent)] print:tracking-[0.06em]">
                What is costing response now
              </p>
              {packetIssues.map((finding) => (
                <div
                  className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-l-[3px] print:border-l-[var(--packet-accent)] print:border-slate-200 print:bg-slate-50 print:p-2"
                  key={finding.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted print:text-slate-400">
                      {finding.confidenceLevel === "detected" ? "Observed" : "Priority area"}
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--packet-accent)]">
                      {finding.category.replace(/-/g, " ")}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display text-[1.65rem] font-semibold leading-[1] print:text-[1.2rem] print:text-slate-950">
                    {finding.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-6 text-foreground print:mt-1 print:text-[11.5px] print:leading-[1.5] print:text-slate-700">
                    {finding.summary}
                  </p>
                  <p className="mt-2 text-[12.5px] leading-5 text-muted print:mt-1 print:text-[11px] print:leading-[1.4] print:text-slate-500">
                    <span className="font-semibold text-foreground print:font-semibold print:text-slate-800">
                      Why it matters:{" "}
                    </span>
                    {finding.businessImpact}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-5 text-foreground print:text-[11px] print:leading-[1.4] print:text-slate-700">
                    <span className="font-semibold print:text-slate-800">Fix: </span>
                    {finding.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PacketSection>

        <PacketSection eyebrow="Recommended direction">
          <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2 print:gap-2">
            {directionCards.map((opportunity) => (
              <div
                key={opportunity.id}
                className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--packet-accent)]">
                  {opportunity.impactLabel}
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold print:text-[1.1rem] print:text-slate-950">
                  {opportunity.title}
                </h2>
                <p className="mt-1.5 text-[13px] leading-6 text-foreground print:text-[11.5px] print:leading-[1.5] print:text-slate-700">
                  {opportunity.futureState}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery path — 2 col in print */}
          <div className="rounded-[6px] border border-border/70 bg-elevated/80 p-4 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem] print:grid-cols-[minmax(0,1fr)_12rem] print:gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:text-slate-400">
                  Suggested delivery path
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 print:grid-cols-2 print:gap-1.5">
                  {report.rebuildPhases.slice(0, 2).map((phase) => (
                    <div
                      className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 p-3 print:rounded-[4px] print:border-slate-200 print:bg-white print:p-1.5"
                      key={phase.id}
                    >
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted print:text-slate-400">
                        {phase.timeline}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-foreground print:text-[11.5px] print:text-slate-800">
                        {phase.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-muted print:text-[11px] print:leading-[1.4] print:text-slate-500">
                        {phase.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 p-3 print:rounded-[4px] print:border-slate-200 print:bg-white print:p-1.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:text-slate-400">
                  What stronger sites do better
                </p>
                <p className="mt-1.5 text-[13px] leading-6 text-foreground print:text-[11.5px] print:leading-[1.4] print:text-slate-700">
                  Clearer offer, proof before the ask, and an obvious next step on every screen.
                </p>
                {referenceNames.length ? (
                  <p className="mt-1.5 text-[11px] leading-4 text-muted print:text-[10px] print:text-slate-400">
                    References: {referenceNames.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </PacketSection>

        {/* ── Scope and next steps ── */}
        <PacketSection eyebrow="Scope and next step">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_17rem] print:grid-cols-[minmax(0,1.18fr)_14rem] print:gap-3">
            <div className="space-y-2">
              <div className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:text-slate-400">
                  Recommended starting scope
                </p>
                <p className="mt-1.5 font-display text-4xl font-semibold text-foreground print:text-[2rem] print:text-slate-950">
                  ${offerSummary.finalTotal.toLocaleString()}
                </p>
                {offerSummary.savings ? (
                  <p className="mt-1 text-[12.5px] leading-5 text-muted print:text-[11px] print:text-slate-500">
                    From ${offerSummary.originalTotal.toLocaleString()} with offer applied.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 print:grid-cols-2 print:gap-1.5">
                {packetScopeItems.map((item) => (
                  <div
                    className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3 print:rounded-[4px] print:border-slate-200 print:bg-white print:p-1.5"
                    key={item.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-foreground print:text-[11.5px] print:text-slate-800">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[13px] font-semibold text-foreground print:text-[11.5px] print:text-slate-950">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-5 text-muted print:text-[10.5px] print:leading-4 print:text-slate-500">
                      {item.estimatedLiftLabel}
                    </p>
                  </div>
                ))}
              </div>

              {hiddenScopeItemCount ? (
                <p className="text-[11px] text-muted print:text-[10px] print:text-slate-400">
                  + {hiddenScopeItemCount} supporting workstream{hiddenScopeItemCount > 1 ? "s" : ""} in full scope.
                </p>
              ) : null}
            </div>

            <div className="print-avoid-break space-y-2">
              <div className="rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:text-slate-400">
                  Score movement
                </p>
                <p className="mt-1.5 font-display text-2xl font-semibold text-foreground print:text-[1.3rem] print:text-slate-950">
                  {report.overallScore} → {projectedScore}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-muted print:text-[10.5px] print:leading-4 print:text-slate-500">
                  Expected quality lift from recommended scope.
                </p>
              </div>

              <div className="rounded-[6px] border border-[var(--packet-accent)]/25 bg-[var(--packet-accent)]/8 p-3.5 print:rounded-[4px] print:border-[var(--packet-accent)]/40 print:bg-white print:p-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted print:text-slate-400">
                  Next step
                </p>
                <div className="mt-1.5 space-y-1 text-[13px] leading-6 text-foreground print:text-[11.5px] print:leading-[1.5] print:text-slate-700">
                  <p>1. Review this packet.</p>
                  <p>2. Confirm goals and launch priorities.</p>
                  <p>3. Approve scope and move into design.</p>
                </div>
              </div>
            </div>
          </div>
        </PacketSection>

      </div>
    </main>
  );
}
