import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PacketToolbar } from "@/features/audit/components/packet-toolbar";
import { Button } from "@/components/ui/button";
import {
  calculatePricingSummary,
  calculateProjectedScore,
  getDefaultSelectedIds,
} from "@/lib/utils/pricing";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import { describeScore, getScoreTone } from "@/lib/utils/scores";
import { createThemeTokens } from "@/lib/utils/theme";
import { getProductRepository } from "@/lib/product/repository";
import { applyProposalOffer } from "@/lib/utils/proposal-offers";

export default async function PacketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; print?: string; accent?: string; share?: string }>;
}) {
  const { id } = await params;
  const { url, print, accent, share } = await searchParams;

  let report = null;

  if (share) {
    const shared = await getProductRepository().resolvePublicShare("packet", id, share);

    if (shared) {
      report = shared.savedReport.reportSnapshot;
    }
  } else if (url) {
    try {
      report = await buildLiveAuditReportFromUrl(url);
    } catch {
      return (
        <ReportEmptyState
          title="The client packet could not be prepared"
          description="Use a valid public website URL or open the packet from an existing review."
        />
      );
    }
  } else {
    report = await buildLiveAuditReportById(id);
  }

  if (!report) {
    notFound();
  }

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
  const benchmarkTargets = report.benchmarkReferences.map((item) => item.targetScore);
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
  const packetSheetClass =
    "rounded-[8px] border border-border bg-panel p-4 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.18)] print:rounded-none print:border-0 print:bg-white print:p-3 print:text-slate-950 print:shadow-none";
  const packetCardClass =
    "print-avoid-break rounded-[6px] border border-border bg-elevated p-3 text-foreground print:rounded-[4px] print:border-slate-200 print:bg-slate-50 print:p-[10px] print:text-slate-950";
  const packetInsetClass =
    "rounded-[4px] border border-border bg-panel text-foreground print:border-slate-200 print:bg-white print:text-slate-950";

  return (
    <main
      className="min-h-screen bg-background px-3 py-5 text-foreground print:bg-white print:px-0 print:py-0"
      id="main-content"
      style={packetStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 pb-4 print:hidden">
        <Button asChild variant="secondary">
          <Link href={`/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}>
            <ArrowLeft className="size-4" />
            Back to workspace
          </Link>
        </Button>
        <PacketToolbar
          autoPrint={print === "1"}
          emailBody={report.outreachEmail.body}
          emailSubject={report.outreachEmail.subject}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-4 print:max-w-none print:space-y-1.5">
        <section className={`print:break-after-page ${packetSheetClass}`}>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--packet-accent)]">Website review and redesign direction</p>
          <div className="mt-4 grid gap-5 print:grid-cols-[minmax(0,1fr)_14rem] print:gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="space-y-3 print:space-y-2">
              <h1 className="font-display text-5xl font-semibold tracking-[-0.05em] print:text-[2.8rem]">
                {report.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted print:text-[15px] print:leading-7 print:text-slate-600">
                A concise review of the current site, the strongest friction points, and the most sensible way to improve first impression, trust, and response quality.
              </p>
              <div className="overflow-hidden rounded-[6px] border border-border bg-elevated print:border-slate-200 print:bg-slate-50">
                <div className="relative aspect-[16/8] overflow-hidden bg-background-alt print:aspect-[16/6.4] print:bg-slate-100">
                  <Image
                    alt={`${report.title} current site preview`}
                    className="object-cover object-top"
                    fill
                    sizes="(min-width: 1024px) 900px, 100vw"
                    src={report.previewSet.current.desktop}
                    unoptimized
                  />
                </div>
                <div className="grid gap-3 border-t border-border p-4 print:grid-cols-[minmax(0,1fr)_13rem] print:gap-2 print:border-slate-200 print:p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Executive summary</p>
                    <p className="mt-2 text-[15px] leading-7 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">{report.executiveSummary}</p>
                  </div>
                  {verifiedFacts.length ? (
                    <div className="grid gap-2 md:min-w-[15rem]">
                      {verifiedFacts.map((fact) => (
                        <div
                          className={`print-avoid-break px-3 py-2 ${packetInsetClass}`}
                          key={fact.id}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted print:text-slate-500">{fact.label}</p>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--packet-accent)]">
                              {fact.confidence}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">{fact.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="print-avoid-break rounded-[6px] border border-border bg-elevated p-4 print:border-slate-200 print:bg-slate-50 print:p-3">
              <div className="grid gap-2">
                <div className={`${packetInsetClass} flex flex-col gap-2 px-3 py-3 print:px-3 print:py-2`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Current score</p>
                  <p className="font-display text-4xl font-semibold text-foreground print:text-[2rem] print:text-slate-950">
                    {report.overallScore}
                    <span className="text-lg text-muted print:text-slate-500"> / 10</span>
                  </p>
                  <p className="text-sm leading-5 text-muted print:text-slate-600">{describeScore(report.overallScore)}</p>
                </div>
                <div className={`${packetInsetClass} flex flex-col gap-2 px-3 py-3 print:px-3 print:py-2`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Projected</p>
                  <p className="font-display text-4xl font-semibold text-foreground print:text-[2rem] print:text-slate-950">
                    {projectedScore}
                    <span className="text-lg text-muted print:text-slate-500"> / 10</span>
                  </p>
                  <p className="text-sm leading-5 text-muted print:text-slate-600">Based on the recommended scope below.</p>
                </div>
                <div className={`${packetInsetClass} flex flex-col gap-2 px-3 py-3 print:px-3 print:py-2`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Reference range</p>
                  <p className="font-display text-3xl font-semibold text-foreground print:text-[1.8rem] print:text-slate-950">
                    {referenceFloor.toFixed(1)} to {referenceCeiling.toFixed(1)}
                  </p>
                  {referenceNames.length ? (
                    <p className="text-sm leading-5 text-muted print:text-slate-600">{referenceNames.join(", ")}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {report.categoryScores.map((item) => (
                  <div
                    className={`${packetInsetClass} flex flex-col items-start gap-1 px-3 py-2 text-sm print:text-[12.5px]`}
                    key={item.key}
                  >
                    <span className="text-foreground print:text-slate-700">{item.label}</span>
                    <span className={`font-semibold ${getScoreTone(item.score) === "danger" ? "text-[var(--packet-danger)]" : getScoreTone(item.score) === "warning" ? "text-[var(--packet-warning)]" : "text-[var(--packet-success)]"}`}>
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {priorityCategories.map((item) => (
                  <span
                    className="rounded-full border border-border bg-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground print:border-slate-200 print:bg-white print:text-slate-700"
                    key={item.key}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              {report.proposalOffer ? (
                <div className="mt-3 rounded-[6px] border border-accent/25 bg-accent/10 p-3 print:border-[var(--packet-border)] print:bg-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-accent">
                    {report.proposalOffer.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted print:text-slate-700">
                    {report.proposalOffer.reason}
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground print:text-slate-950">
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
        </section>

        <section className={packetSheetClass}>
          <div className="grid gap-5 print:grid-cols-2 print:gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted print:text-slate-500">What is already working</p>
              <div className="grid gap-3">
                {packetPositives.map((finding) => (
                  <div key={finding.id} className={packetCardClass}>
                    <h2 className="font-display text-2xl font-semibold print:text-[1.55rem]">{finding.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">{finding.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--packet-accent)]">What is likely costing response now</p>
              <div className="grid gap-3">
                {packetIssues.map((finding) => (
                  <div key={finding.id} className={packetCardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted print:text-slate-500">
                        {finding.confidenceLevel === "detected" ? "Observed" : "Priority area"}
                      </p>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--packet-accent)]">
                        {finding.category.replace(/-/g, " ")}
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-3xl font-semibold print:text-[1.8rem]">{finding.title}</h2>
                    <p className="mt-2 text-base leading-7 text-foreground print:text-[14px] print:leading-6 print:text-slate-700">{finding.summary}</p>
                    <p className="mt-3 text-sm leading-6 text-muted print:text-[13px] print:leading-5 print:text-slate-600">
                      <span className="font-semibold text-foreground print:text-slate-950">Why it matters:</span>{" "}
                      {finding.businessImpact}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">
                      <span className="font-semibold text-foreground print:text-slate-950">What to change:</span>{" "}
                      {finding.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={packetSheetClass}>
          <p className="text-xs uppercase tracking-[0.24em] text-muted print:text-slate-500">Recommended direction</p>
          <div className="mt-4 grid gap-3 print:mt-3 print:grid-cols-2 md:grid-cols-2">
            {directionCards.map((opportunity) => (
              <div key={opportunity.id} className={packetCardClass}>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--packet-accent)]">
                  {opportunity.impactLabel}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold print:text-[1.5rem]">{opportunity.title}</h2>
                <p className="mt-2 text-sm leading-6 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">{opportunity.futureState}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[6px] border border-border bg-elevated p-4 print:mt-4 print:border-slate-200 print:bg-slate-50 print:p-3">
            <div className="grid gap-4 print:gap-3 lg:grid-cols-[minmax(0,1fr)_15rem]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Suggested delivery path</p>
                <div className="mt-3 grid gap-3 print:grid-cols-2 md:grid-cols-2">
                  {report.rebuildPhases.slice(0, 2).map((phase) => (
                    <div key={phase.id} className={`print-avoid-break p-3 ${packetInsetClass}`}>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">{phase.timeline}</p>
                      <p className="mt-2 font-semibold text-foreground print:text-slate-950">{phase.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted print:text-[13px] print:leading-5 print:text-slate-600">{phase.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`print-avoid-break p-3 ${packetInsetClass}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">
                  What stronger sites do better
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground print:text-[13px] print:leading-5 print:text-slate-700">
                  They make the offer clearer, place proof before the ask, and keep the next step obvious on every screen.
                </p>
                {referenceNames.length ? (
                  <p className="mt-3 text-xs leading-5 text-muted print:text-slate-500">
                    Examples used for reference: {referenceNames.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className={packetSheetClass}>
          <p className="text-xs uppercase tracking-[0.24em] text-muted print:text-slate-500">Scope and next step</p>
          <div className="mt-4 grid gap-5 print:grid-cols-[minmax(0,1fr)_14rem] print:gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <div className="print-avoid-break rounded-[6px] border border-border bg-elevated p-4 print:border-slate-200 print:bg-slate-50 print:p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Recommended starting scope</p>
                <p className="mt-2 font-display text-5xl font-semibold text-foreground print:text-4xl print:text-slate-950">
                  ${offerSummary.finalTotal.toLocaleString()}
                </p>
                {offerSummary.savings ? (
                  <p className="mt-2 text-sm leading-6 text-muted print:text-[13px] print:leading-5 print:text-slate-600">
                    From ${offerSummary.originalTotal.toLocaleString()} with the current offer applied.
                  </p>
                ) : null}
                <p className="mt-2 text-base leading-7 text-foreground print:text-[14px] print:leading-6 print:text-slate-700">
                  This range assumes the base rebuild plus the strategic additions most likely to improve clarity, trust, and response quality for this specific site.
                </p>
              </div>
              <div className="grid gap-3 print:grid-cols-2 md:grid-cols-2">
                {packetScopeItems.map((item) => (
                  <div key={item.id} className="print-avoid-break rounded-[6px] border border-border bg-elevated p-3 print:border-slate-200 print:bg-slate-50">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-foreground print:text-slate-950">{item.title}</p>
                      <span className="text-sm font-semibold text-foreground print:text-slate-950">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted print:text-[13px] print:leading-5 print:text-slate-600">{item.estimatedLiftLabel}</p>
                  </div>
                ))}
              </div>
              {hiddenScopeItemCount ? (
                <p className="text-xs leading-5 text-muted print:text-slate-500">
                  Plus {hiddenScopeItemCount} supporting workstream{hiddenScopeItemCount > 1 ? "s" : ""} covered in the full scope.
                </p>
              ) : null}
            </div>
            <div className="print-avoid-break rounded-[6px] border border-border bg-elevated p-4 print:border-slate-200 print:bg-slate-50 print:p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Next step</p>
              <p className="mt-2 text-base leading-7 text-foreground print:text-[14px] print:leading-6 print:text-slate-700">
                If the direction feels relevant, the next step is a short call to align on goals, priorities, timeline, and scope.
              </p>
              <div className={`mt-4 px-3 py-3 print:mt-3 print:px-3 print:py-2 ${packetInsetClass}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-muted print:text-slate-500">Score movement</p>
                <p className="mt-2 font-display text-3xl font-semibold text-foreground print:text-slate-950">
                  {report.overallScore} to {projectedScore}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted print:text-[13px] print:leading-5 print:text-slate-600">
                  This shows the expected quality lift from the recommended scope, not a guaranteed business result.
                </p>
              </div>
              <div className="mt-4 space-y-2 text-sm leading-6 text-foreground print:mt-3 print:space-y-1.5 print:text-[13px] print:leading-5 print:text-slate-700">
                <p>1. Review the packet.</p>
                <p>2. Confirm business goals and launch priorities.</p>
                <p>3. Approve scope and move into design.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
