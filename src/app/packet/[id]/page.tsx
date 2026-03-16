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

const scoreBarClasses = {
  success: "bg-[var(--packet-success)]",
  warning: "bg-[var(--packet-warning)]",
  danger: "bg-[var(--packet-danger)]",
} as const;

export default async function PacketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; print?: string; accent?: string }>;
}) {
  const { id } = await params;
  const { url, print, accent } = await searchParams;

  let report = null;

  if (url) {
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
  const projectedScore = calculateProjectedScore(
    report.overallScore,
    summary.selectedPackageItems,
  );
  const positiveFindings = report.findings
    .filter((finding) => finding.section === "what-working")
    .slice(0, 2);
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
    .slice(0, 3);
  const packetPositives = positiveFindings.length
    ? positiveFindings
    : report.findings.filter((finding) => finding.section === "what-working").slice(0, 1);
  const packetIssues = topFindings.length
    ? topFindings
    : report.findings.filter((finding) => finding.section !== "what-working").slice(0, 3);
  const directionCards = report.opportunities.slice(0, 3);
  const verifiedFacts = report.siteObservation.verifiedFacts
    .filter((fact) => fact.type !== "about")
    .slice(0, 4);
  const benchmarkTargets = report.benchmarkReferences.map((item) => item.targetScore);
  const referenceFloor = benchmarkTargets.length ? Math.min(...benchmarkTargets) : 8.2;
  const referenceCeiling = benchmarkTargets.length ? Math.max(...benchmarkTargets) : 9.1;
  const referenceNames = report.benchmarkReferences.slice(0, 3).map((item) => item.name);
  const priorityCategories = [...report.categoryScores]
    .sort((left, right) => left.score - right.score)
    .slice(0, 3);
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
      className="min-h-screen bg-white px-2 py-4 text-slate-950 print:bg-white print:px-0"
      id="main-content"
      style={packetStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 pb-4 print:hidden">
        <Button asChild variant="secondary">
          <Link href={`/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}>
            <ArrowLeft className="size-4" />
            Back to workspace
          </Link>
        </Button>
      </div>
      <PacketToolbar
        autoPrint={print === "1"}
        emailBody={report.outreachEmail.body}
        emailSubject={report.outreachEmail.subject}
      />

      <div className="mx-auto w-full max-w-6xl space-y-4 print:max-w-none print:space-y-3">
        <section className="print-avoid-break break-after-page rounded-[8px] border border-slate-200 bg-white p-6 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--packet-accent)]">Website review and redesign direction</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">
                {report.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                A concise review of the current site, the strongest friction points, and the most sensible way to improve first impression, trust, and response quality.
              </p>
              <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-slate-50">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <Image
                    alt={`${report.title} current site preview`}
                    className="object-cover object-top"
                    fill
                    sizes="(min-width: 1024px) 900px, 100vw"
                    src={report.previewSet.current.desktop}
                    unoptimized
                  />
                </div>
                <div className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Executive summary</p>
                    <p className="mt-2 text-base leading-7 text-slate-700">{report.executiveSummary}</p>
                  </div>
                  {verifiedFacts.length ? (
                    <div className="grid gap-2 md:min-w-[16rem]">
                      {verifiedFacts.map((fact) => (
                        <div
                          className="print-avoid-break rounded-[6px] border border-slate-200 bg-white px-3 py-2"
                          key={fact.id}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{fact.label}</p>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--packet-accent)]">
                              {fact.confidence}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{fact.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current score</p>
              <p className="mt-3 font-display text-6xl font-semibold text-slate-950">
                {report.overallScore}
                <span className="text-2xl text-slate-500"> / 10</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {describeScore(report.overallScore)}
              </p>
              <div className="mt-5 grid gap-3">
                <div className="print-avoid-break rounded-[6px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Projected score</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                    {projectedScore}
                    <span className="text-lg text-slate-500"> / 10</span>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Based on the recommended scope below, not on inflated outcome claims.
                  </p>
                </div>
                <div className="print-avoid-break rounded-[6px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Strong reference range
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                    {referenceFloor.toFixed(1)} to {referenceCeiling.toFixed(1)}
                    <span className="text-lg text-slate-500"> / 10</span>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Strong sites in this category tend to feel clearer, more trusted, and easier to act on from the first screen onward.
                  </p>
                  {referenceNames.length ? (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Reference examples: {referenceNames.join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {report.categoryScores.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span>{item.label}</span>
                      <span>{item.score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${scoreBarClasses[getScoreTone(item.score)]}`}
                        style={{ width: `${item.score * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Priority areas</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {priorityCategories.map((item) => (
                    <span
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700"
                      key={item.key}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-xs leading-5 text-slate-500">
                Scored across design, conversion, mobile clarity, search readiness, accessibility, trust, and security posture.
              </p>
            </div>
          </div>
        </section>

        <section className="print-avoid-break break-after-page rounded-[8px] border border-slate-200 bg-white p-6 shadow-lg print:rounded-none print:shadow-none">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">What is already working</p>
              <div className="grid gap-3">
                {packetPositives.map((finding) => (
                  <div key={finding.id} className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                    <h2 className="font-display text-2xl font-semibold">{finding.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{finding.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--packet-accent)]">What is likely costing response now</p>
              <div className="grid gap-3">
                {packetIssues.map((finding) => (
                  <div key={finding.id} className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {finding.confidenceLevel === "detected" ? "Observed" : "Priority area"}
                      </p>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--packet-accent)]">
                        {finding.category.replace(/-/g, " ")}
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-3xl font-semibold">{finding.title}</h2>
                    <p className="mt-3 text-base leading-7 text-slate-700">{finding.summary}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-slate-950">Why it matters:</span>{" "}
                      {finding.businessImpact}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-950">What to change:</span>{" "}
                      {finding.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="print-avoid-break break-after-page rounded-[8px] border border-slate-200 bg-white p-6 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recommended direction</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {directionCards.map((opportunity) => (
              <div key={opportunity.id} className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--packet-accent)]">
                  {opportunity.impactLabel}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{opportunity.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{opportunity.futureState}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[8px] border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Suggested delivery path</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {report.rebuildPhases.slice(0, 3).map((phase) => (
                    <div key={phase.id} className="print-avoid-break rounded-[8px] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{phase.timeline}</p>
                      <p className="mt-2 font-semibold text-slate-950">{phase.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="print-avoid-break rounded-[8px] border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  What stronger sites do better
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  They make the offer clearer, place proof before the ask, and keep the next step obvious on every screen.
                </p>
                {referenceNames.length ? (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Examples used for reference: {referenceNames.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="print-avoid-break rounded-[8px] border border-slate-200 bg-white p-6 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scope and next step</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended starting scope</p>
                <p className="mt-3 font-display text-5xl font-semibold text-slate-950">
                  ${summary.total.toLocaleString()}
                </p>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  This range assumes the base rebuild plus the strategic additions most likely to improve clarity, trust, and response quality for this specific site.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The goal is not a cosmetic refresh. It is to move the experience closer to the reference range strong sites already occupy.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {summary.selectedPackageItems.map((item) => (
                  <div key={item.id} className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <span className="text-sm font-semibold text-slate-950">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.estimatedLiftLabel}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="print-avoid-break rounded-[8px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next step</p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                If the direction feels relevant, the next step is a short call to align on goals, priorities, timeline, and scope.
              </p>
              <div className="mt-5 rounded-[6px] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score movement</p>
                <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                  {report.overallScore} to {projectedScore}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This shows the expected quality lift from the recommended scope, not a guaranteed business result.
                </p>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
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
