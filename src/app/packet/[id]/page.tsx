import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PacketToolbar } from "@/features/audit/components/packet-toolbar";
import { Button } from "@/components/ui/button";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import { describeScore, getScoreMethodologyNotes, getScoreTone } from "@/lib/utils/scores";
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
          description="Use a valid public website URL or open the packet from an existing audit workspace."
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
  const topFindings = report.findings.filter((finding) => finding.severity === "high").slice(0, 3);
  const methodologyNote = getScoreMethodologyNotes()[0];
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

      <div className="mx-auto w-full max-w-6xl space-y-4">
        <section className="break-after-page rounded-[18px] border border-slate-200 bg-white p-8 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--packet-accent)]">Website opportunity packet</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-5">
              <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">
                {report.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                A short website review focused on clarity, conversion, trust, and where a redesign could produce a stronger first impression.
              </p>
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Executive summary</p>
                <p className="mt-3 text-base leading-7 text-slate-700">{report.executiveSummary}</p>
              </div>
            </div>
            <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Overall score</p>
              <p className="mt-3 font-display text-6xl font-semibold text-slate-950">
                {report.overallScore}
                <span className="text-2xl text-slate-500"> / 10</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {describeScore(report.overallScore)}
              </p>
              <div className="mt-6 space-y-3">
                {report.categoryScores.slice(0, 4).map((item) => (
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
              <p className="mt-5 text-xs leading-5 text-slate-500">{methodologyNote}</p>
            </div>
          </div>
        </section>

        <section className="break-after-page rounded-[18px] border border-slate-200 bg-white p-8 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">What stood out</p>
          <div className="mt-6 grid gap-4">
            {topFindings.map((finding) => (
              <div key={finding.id} className="rounded-[14px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {finding.confidenceLevel}
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{finding.title}</h2>
                <p className="mt-3 text-base leading-7 text-slate-700">{finding.summary}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  <span className="font-semibold text-slate-950">Why it matters:</span>{" "}
                  {finding.businessImpact}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="break-after-page rounded-[18px] border border-slate-200 bg-white p-8 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recommended direction</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {report.opportunities.map((opportunity) => (
              <div key={opportunity.id} className="rounded-[14px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {opportunity.impactLabel}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{opportunity.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{opportunity.futureState}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[16px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Suggested delivery path</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {report.rebuildPhases.slice(0, 3).map((phase) => (
                <div key={phase.id} className="rounded-[14px] border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{phase.timeline}</p>
                  <p className="mt-2 font-semibold text-slate-950">{phase.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-slate-200 bg-white p-8 shadow-lg print:rounded-none print:shadow-none">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scope and next step</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-5">
              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended starting scope</p>
                <p className="mt-3 font-display text-5xl font-semibold text-slate-950">
                  ${summary.total.toLocaleString()}
                </p>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  This range assumes the base rebuild plus the default strategic additions for the current site profile.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {summary.selectedAddOns.map((item) => (
                  <div key={item.id} className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.estimatedLiftLabel}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next step</p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                If the direction feels relevant, the next step is a short discovery call
                to align on goals, pages, timeline, and the brief that guides wireframes.
              </p>
              <div className="mt-6 space-y-3 text-sm leading-6 text-slate-700">
                <p>1. Review the packet.</p>
                <p>2. Confirm business goals and launch priorities.</p>
                <p>3. Approve the brief before design production starts.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
