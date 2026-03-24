import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      className={`print-avoid-break rounded-[6px] border px-3 py-3 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-white print:px-3 print:py-2.5 print:text-slate-950 ${accent ? "border-accent/25 bg-accent/8" : "border-border/70 bg-panel/72 print:bg-slate-50"} ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
        {label}
      </p>
      <div className="mt-2">{value}</div>
      {detail ? (
        <div className="mt-2 text-sm leading-5 text-muted print:text-[12.5px] print:leading-5 print:text-slate-600">
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
    <div className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 px-3 py-2.5 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-white print:text-slate-950">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted print:text-slate-500">
          {label}
        </p>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--packet-accent)]">
          {confidence}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-foreground print:text-[12.5px] print:leading-5 print:text-slate-700">
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

  return (
    <div className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 px-3 py-2.5 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-white print:text-slate-950">
      <p className="text-sm font-semibold leading-5 text-foreground print:text-slate-700">
        {item.label}
      </p>
      <p className={`mt-1.5 font-display text-2xl font-semibold leading-none ${toneClass}`}>
        {item.score}
      </p>
    </div>
  );
}

function PacketSection({
  eyebrow,
  children,
  breakAfter = false,
}: {
  eyebrow: string;
  children: ReactNode;
  breakAfter?: boolean;
}) {
  return (
    <section
      className={`rounded-[8px] border border-border/70 bg-panel/92 p-4 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:p-5 lg:p-6 print:rounded-none print:border-0 print:bg-white print:p-2.5 print:text-slate-950 print:shadow-none ${breakAfter ? "print:break-after-page" : ""}`}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-muted print:text-slate-500">
        {eyebrow}
      </p>
      <div className="mt-3 space-y-4 print:mt-2.5 print:space-y-3">{children}</div>
    </section>
  );
}

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
    .filter((finding) => finding.section === "what-working")
    .slice(0, 1);
  const topFindings = report.findings
    .filter(
      (finding) =>
        finding.section !== "what-working" &&
        finding.confidenceLevel !== "recommended",
    )
    .sort((left, right) => {
      const severityRank = { high: 0, medium: 1, low: 2 } as const;

      return severityRank[left.severity] - severityRank[right.severity];
    })
    .slice(0, 2);
  const packetPositives = positiveFindings.length
    ? positiveFindings
    : report.findings.filter((finding) => finding.section === "what-working").slice(0, 1);
  const packetIssues = topFindings.length
    ? topFindings
    : report.findings.filter((finding) => finding.section !== "what-working").slice(0, 3);
  const directionCards = report.opportunities.slice(0, 2);
  const verifiedFacts = report.siteObservation.verifiedFacts
    .filter((fact) => fact.type !== "about")
    .slice(0, 3);
  const benchmarkTargets = report.benchmarkReferences.map((item) =>
    getBenchmarkReferenceScore(item),
  );
  const referenceFloor = benchmarkTargets.length ? Math.min(...benchmarkTargets) : 8.2;
  const referenceCeiling = benchmarkTargets.length ? Math.max(...benchmarkTargets) : 9.1;
  const referenceNames = report.benchmarkReferences.slice(0, 3).map((item) => item.name);
  const priorityCategories = [...report.categoryScores]
    .sort((left, right) => left.score - right.score)
    .slice(0, 2);
  const packetScopeItems = [
    summary.baseItem,
    ...summary.selectedAddOns
      .slice()
      .sort((left, right) => right.estimatedScoreLift - left.estimatedScoreLift)
      .slice(0, 4),
  ];
  const hiddenScopeItemCount = Math.max(
    0,
    summary.selectedPackageItems.length - packetScopeItems.length,
  );
  const packetTheme = createThemeTokens({
    mode: "light",
    accentColor: accent || "#f7b21b",
  });
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
      className="min-h-screen bg-background px-3 py-5 text-foreground print:bg-white print:px-0 print:py-0"
      id="main-content"
      style={packetStyle}
    >
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

      <div className="mx-auto w-full max-w-6xl space-y-3 print:max-w-none print:space-y-1.5">
        <PacketSection breakAfter eyebrow="Website review and redesign direction">
          <div className="space-y-3 print:space-y-2.5">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl lg:text-[3.8rem] print:text-[2.5rem]">
              {report.title}
            </h1>
            <p className="max-w-4xl text-base leading-7 text-muted sm:text-lg print:max-w-none print:text-[14px] print:leading-6 print:text-slate-600">
              A concise review of the current site, the strongest friction points, and the most sensible way to improve first impression, trust, and response quality.
            </p>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-border/70 bg-elevated/80 print:rounded-[4px] print:border-slate-200 print:bg-slate-50">
            <div className="relative aspect-[16/8.2] overflow-hidden bg-background-alt print:aspect-[16/6.6] print:bg-slate-100">
              <Image
                alt={`${report.title} current site preview`}
                className="object-cover object-top"
                fill
                sizes="(min-width: 1024px) 1000px, 100vw"
                src={report.previewSet.current.desktop}
                unoptimized
              />
            </div>

            <div className="space-y-3 border-t border-border/70 p-4 print:space-y-2.5 print:border-slate-200 print:p-2.5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                  Executive summary
                </p>
                <p className="text-[15px] leading-7 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">
                  {report.executiveSummary}
                </p>
              </div>

              {verifiedFacts.length ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-1">
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

              <div className="grid gap-2 md:grid-cols-3 print:grid-cols-1">
                <PacketMetricCard
                  detail={describeScore(report.overallScore)}
                  label="Current score"
                  value={
                    <p className="font-display text-4xl font-semibold text-foreground print:text-[1.9rem] print:text-slate-950">
                      {report.overallScore}
                      <span className="text-lg text-muted print:text-slate-500"> / 10</span>
                    </p>
                  }
                />
                <PacketMetricCard
                  accent
                  detail="Based on the recommended scope below."
                  label="Projected"
                  value={
                    <p className="font-display text-4xl font-semibold text-foreground print:text-[1.9rem] print:text-slate-950">
                      {projectedScore}
                      <span className="text-lg text-muted print:text-slate-500"> / 10</span>
                    </p>
                  }
                />
                <PacketMetricCard
                  detail={
                    referenceNames.length ? referenceNames.join(", ") : undefined
                  }
                  label="Reference range"
                  value={
                    <p className="font-display text-3xl font-semibold text-foreground print:text-[1.65rem] print:text-slate-950">
                      {referenceFloor.toFixed(1)} to {referenceCeiling.toFixed(1)}
                    </p>
                  }
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-1">
                {report.categoryScores.map((item) => (
                  <PacketCategoryCard item={item} key={item.key} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {priorityCategories.map((item) => (
                  <span
                    className="rounded-full border border-border/70 bg-panel/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground print:border-slate-200 print:bg-white print:text-slate-700"
                    key={item.key}
                  >
                    Priority: {item.label}
                  </span>
                ))}
              </div>

              {report.proposalOffer ? (
                <div className="rounded-[6px] border border-accent/25 bg-accent/10 px-3 py-3 print:rounded-[4px] print:border-[var(--packet-border)] print:bg-white print:px-3 print:py-2.5">
                  <p className="text-xs uppercase tracking-[0.18em] text-accent">
                    {report.proposalOffer.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-muted print:text-[12.5px] print:leading-5 print:text-slate-700">
                    {report.proposalOffer.reason}
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-foreground print:text-slate-950">
                    ${offerSummary.finalTotal.toLocaleString()}
                    {offerSummary.savings ? (
                      <span className="ml-2 text-sm font-normal text-muted print:text-slate-600">
                        from ${offerSummary.originalTotal.toLocaleString()}
                      </span>
                    ) : null}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </PacketSection>

        <PacketSection eyebrow="What is already working and what is likely costing response now">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] print:grid-cols-1">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                What is already working
              </p>
              {packetPositives.map((finding) => (
                <div
                  className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5 print:text-slate-950"
                  key={finding.id}
                >
                  <h2 className="font-display text-2xl font-semibold print:text-[1.45rem]">
                    {finding.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-foreground print:text-[12.5px] print:leading-5 print:text-slate-700">
                    {finding.summary}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--packet-accent)]">
                What is likely costing response now
              </p>
              {packetIssues.map((finding) => (
                <div
                  className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5 print:text-slate-950"
                  key={finding.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted print:text-slate-500">
                      {finding.confidenceLevel === "detected" ? "Observed" : "Priority area"}
                    </p>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--packet-accent)]">
                      {finding.category.replace(/-/g, " ")}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-[1.9rem] font-semibold leading-[0.98] print:text-[1.55rem]">
                    {finding.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">
                    {finding.summary}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted print:text-[12.5px] print:leading-5 print:text-slate-600">
                    <span className="font-semibold text-foreground print:text-slate-950">
                      Why it matters:
                    </span>{" "}
                    {finding.businessImpact}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-foreground print:text-[12.5px] print:leading-5 print:text-slate-700">
                    <span className="font-semibold text-foreground print:text-slate-950">
                      What to change:
                    </span>{" "}
                    {finding.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PacketSection>

        <PacketSection eyebrow="Recommended direction">
          <div className="grid gap-3 md:grid-cols-2 print:grid-cols-1">
            {directionCards.map((opportunity) => (
              <div
                key={opportunity.id}
                className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5 print:text-slate-950"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--packet-accent)]">
                  {opportunity.impactLabel}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold print:text-[1.45rem]">
                  {opportunity.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-foreground print:text-[12.5px] print:leading-5 print:text-slate-700">
                  {opportunity.futureState}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[6px] border border-border/70 bg-elevated/80 p-4 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem] print:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                  Suggested delivery path
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 print:grid-cols-1">
                  {report.rebuildPhases.slice(0, 2).map((phase) => (
                    <div
                      className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 p-3 print:rounded-[4px] print:border-slate-200 print:bg-white print:p-2.5"
                      key={phase.id}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                        {phase.timeline}
                      </p>
                      <p className="mt-1.5 font-semibold text-foreground print:text-slate-950">
                        {phase.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted print:text-[12.5px] print:leading-5 print:text-slate-600">
                        {phase.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="print-avoid-break rounded-[6px] border border-border/70 bg-panel/72 p-3 print:rounded-[4px] print:border-slate-200 print:bg-white print:p-2.5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                  What stronger sites do better
                </p>
                <p className="mt-1.5 text-sm leading-6 text-foreground print:text-[12.5px] print:leading-5 print:text-slate-700">
                  They make the offer clearer, place proof before the ask, and keep the next step obvious on every screen.
                </p>
                {referenceNames.length ? (
                  <p className="mt-2 text-xs leading-5 text-muted print:text-slate-500">
                    Examples used for reference: {referenceNames.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </PacketSection>

        <PacketSection eyebrow="Scope and next step">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_17rem] print:grid-cols-1">
            <div className="space-y-3">
              <div className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                  Recommended starting scope
                </p>
                <p className="mt-2 font-display text-5xl font-semibold text-foreground print:text-[2.2rem] print:text-slate-950">
                  ${offerSummary.finalTotal.toLocaleString()}
                </p>
                {offerSummary.savings ? (
                  <p className="mt-2 text-sm leading-6 text-muted print:text-[12.5px] print:leading-5 print:text-slate-600">
                    From ${offerSummary.originalTotal.toLocaleString()} with the current offer applied.
                  </p>
                ) : null}
                <p className="mt-2 text-[15px] leading-7 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">
                  This range assumes the base rebuild plus the strategic additions most likely to improve clarity, trust, and response quality for this specific site.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 print:grid-cols-1">
                {packetScopeItems.map((item) => (
                  <div
                    className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5"
                    key={item.id}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-foreground print:text-slate-950">
                        {item.title}
                      </p>
                      <span className="text-sm font-semibold text-foreground print:text-slate-950">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted print:text-[12.5px] print:leading-5 print:text-slate-600">
                      {item.estimatedLiftLabel}
                    </p>
                  </div>
                ))}
              </div>

              {hiddenScopeItemCount ? (
                <p className="text-xs leading-5 text-muted print:text-slate-500">
                  Plus {hiddenScopeItemCount} supporting workstream{hiddenScopeItemCount > 1 ? "s" : ""} covered in the full scope.
                </p>
              ) : null}
            </div>

            <div className="print-avoid-break rounded-[6px] border border-border/70 bg-elevated/80 p-3.5 print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-2.5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                Next step
              </p>
              <p className="mt-2 text-[15px] leading-7 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">
                If the direction feels relevant, the next step is a short call to align on goals, priorities, timeline, and scope.
              </p>
              <PacketMetricCard
                className="mt-3"
                detail="This shows the expected quality lift from the recommended scope, not a guaranteed business result."
                label="Score movement"
                value={
                  <p className="font-display text-3xl font-semibold text-foreground print:text-[1.7rem] print:text-slate-950">
                    {report.overallScore} to {projectedScore}
                  </p>
                }
              />
              <div className="mt-3 space-y-1.5 text-sm leading-6 text-foreground print:text-[12.5px] print:leading-5 print:text-slate-700">
                <p>1. Review the packet.</p>
                <p>2. Confirm business goals and launch priorities.</p>
                <p>3. Approve scope and move into design.</p>
              </div>
            </div>
          </div>
        </PacketSection>
      </div>
    </main>
  );
}
