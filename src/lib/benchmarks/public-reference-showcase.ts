import { getBenchmarkVerticalForProfile } from "@/lib/benchmarks/library";
import { buildAuditReportById } from "@/lib/mock/report-builder";
import { sampleAudits } from "@/lib/mock/sample-audits";
import type {
  AuditCategoryKey,
  AuditReport,
  BenchmarkReference,
  SampleAuditCard,
} from "@/lib/types/audit";

/** Only audits at or above this overall score appear in the public “reference showcase” strip. */
export const PUBLIC_REFERENCE_MIN_OVERALL = 8.8;

const canonicalSiteHost = (raw: string): string => {
  try {
    const u = raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw)
      : new URL(`https://${raw}`);
    return u.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/\/$/, "")
      .replace(/^www\./i, "")
      .toLowerCase();
  }
};

const topStrengthKeys = (report: AuditReport, limit: number): AuditCategoryKey[] => {
  return [...report.categoryScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((c) => c.key);
};

const referenceFromSample = (sample: SampleAuditCard, report: AuditReport): BenchmarkReference => {
  const vertical = getBenchmarkVerticalForProfile(sample.profile);

  return {
    id: `public-scan-${sample.id}`,
    siteId: `public-scan-${sample.id}`,
    vertical,
    tier: "reference",
    name: report.title,
    url: sample.url,
    sourceLabel: "Public audit showcase",
    note: sample?.summary ?? report.executiveSummary.slice(0, 220),
    previewImage: report.previewSet.current.desktop,
    mobilePreviewImage: report.previewSet.current.mobile,
    targetScore: 9,
    measuredScore: report.overallScore,
    scoreSource: "measured",
    strengths: topStrengthKeys(report, 4),
    whatWorks: sample?.highlights ?? [],
    bestFor: "Teams comparing their site to a scored, real-world example in this vertical.",
    reusablePatterns: [],
  };
};

/** High-scoring saved audits (sample / public scan library) suitable for the reference gallery. */
export const listHighScorePublicScanReferences = (): BenchmarkReference[] => {
  const out: BenchmarkReference[] = [];

  for (const sample of sampleAudits) {
    const report = buildAuditReportById(sample.id);
    if (!report || report.overallScore < PUBLIC_REFERENCE_MIN_OVERALL) {
      continue;
    }
    out.push(referenceFromSample(sample, report));
  }

  return out.sort((a, b) => (b.measuredScore ?? 0) - (a.measuredScore ?? 0));
};

/**
 * Curated library picks first, then high-score public scans not already represented by URL.
 * This set is intended to grow as more samples are added to `sampleAudits` above the threshold.
 */
export const mergeReferenceShowcase = (curated: BenchmarkReference[]): BenchmarkReference[] => {
  const extra = listHighScorePublicScanReferences();
  const seenHost = new Set(curated.map((r) => canonicalSiteHost(r.url)));
  const merged = [...curated];

  for (const ref of extra) {
    const host = canonicalSiteHost(ref.url);
    if (seenHost.has(host)) {
      continue;
    }
    seenHost.add(host);
    merged.push(ref);
  }

  return merged;
};
