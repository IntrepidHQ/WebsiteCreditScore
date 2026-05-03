import type { Grade, WCSReport } from "@/lib/schema";
import { buildStrategyCallCalendlyUrl, buildStrategyPresentationUrl } from "@/lib/strategy-call";

export type ScanObservedFact = {
  label: string;
  value: string;
  detail: string;
};

const severityRank: Record<WCSReport["red_flags"][number]["severity"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function safeScanHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function formatScanDate(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

export function getStrongestCategories(report: WCSReport, count = 3) {
  return [...report.dimensions]
    .sort((left, right) => right.score - left.score)
    .slice(0, count);
}

export function getWeakestCategories(report: WCSReport, count = 3) {
  return [...report.dimensions]
    .sort((left, right) => left.score - right.score)
    .slice(0, count);
}

export function getPriorityFindings(report: WCSReport, count = 3) {
  return [...report.red_flags]
    .sort((left, right) => {
      const severityDelta = severityRank[right.severity] - severityRank[left.severity];
      if (severityDelta !== 0) return severityDelta;
      return left.title.localeCompare(right.title);
    })
    .slice(0, count);
}

export function getSourceDomains(report: WCSReport, count = 4) {
  return Array.from(
    new Set(
      report.sources
        .map((source) => source.domain || safeScanHostname(source.url))
        .filter(Boolean)
    )
  ).slice(0, count);
}

function gradeNarrative(report: WCSReport) {
  const lowCount = report.dimensions.filter((dim) => dim.score < 70).length;
  const highCount = report.dimensions.filter((dim) => dim.score >= 90).length;

  if (report.overall.score >= 90) {
    return `${highCount} dimensions are operating at benchmark level. The remaining work is mostly about selective trust and conversion polish.`;
  }

  if (report.overall.score >= 75) {
    return `${highCount} dimensions are already strong, but ${lowCount || "a few"} weaker signals are keeping the site from feeling fully proven.`;
  }

  return `${lowCount || "Several"} dimensions need visible repair before the site reads as dependable to a skeptical visitor.`;
}

function observedFacts(report: WCSReport): ScanObservedFact[] {
  const domains = getSourceDomains(report);
  const topFinding = getPriorityFindings(report, 1)[0];
  const strongest = getStrongestCategories(report, 1)[0];
  const weakest = getWeakestCategories(report, 1)[0];

  return [
    {
      label: "Dimensions",
      value: `${report.dimensions.length} graded angles`,
      detail:
        strongest && weakest
          ? `Strongest: ${strongest.label}. Biggest gap: ${weakest.label}.`
          : "The scan compares design, trust, UX, technical health, content, reputation, and proof signals.",
    },
    {
      label: "Evidence trail",
      value: `${report.sources.length} cited source${report.sources.length === 1 ? "" : "s"}`,
      detail: domains.length ? domains.join(" · ") : "Cited public evidence appears here when sources are available.",
    },
    {
      label: "Risk signals",
      value: `${report.red_flags.length} red flag${report.red_flags.length === 1 ? "" : "s"}`,
      detail: topFinding?.title ?? "No major red flags were detected in the public evidence set.",
    },
    {
      label: "Proof signals",
      value: `${report.green_flags.length} green flag${report.green_flags.length === 1 ? "" : "s"}`,
      detail: report.green_flags[0]?.title ?? "No specific proof signals were isolated yet.",
    },
  ];
}

export function buildScanResultSummary(report: WCSReport) {
  const strongestCategories = getStrongestCategories(report);
  const weakestCategories = getWeakestCategories(report);
  const priorityFindings = getPriorityFindings(report);
  const sourceDomains = getSourceDomains(report);
  const benchmarkDelta = Math.max(0, 90 - report.overall.score);

  return {
    strongestCategories,
    weakestCategories,
    priorityFindings,
    observedFacts: observedFacts(report),
    ctaSignals: report.green_flags
      .filter((flag) => /cta|call|book|buy|contact|demo|trial|quote/i.test(`${flag.title} ${flag.detail}`))
      .slice(0, 3),
    benchmarkDelta,
    benchmarkTarget:
      benchmarkDelta === 0
        ? "Already benchmark-ready"
        : `${benchmarkDelta} points from a benchmark-ready 90`,
    gradeNarrative: gradeNarrative(report),
    previewAssets: {
      faviconUrl: `https://www.google.com/s2/favicons?domain=${report.domain}&sz=64`,
    },
    sourceDomains,
    scannedAtLabel: formatScanDate(report.scanned_at),
    actionHrefs: {
      strategyCall: buildStrategyCallCalendlyUrl({ medium: "scan_report", content: report.domain }),
      strategyPresentation: buildStrategyPresentationUrl({ medium: "scan_report", content: report.domain }),
    },
  };
}

export type ScanResultSummaryViewModel = ReturnType<typeof buildScanResultSummary>;
export type ScanSummaryDimension = ScanResultSummaryViewModel["strongestCategories"][number] & {
  grade: Grade;
};
