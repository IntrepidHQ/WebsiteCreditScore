import { LandingPageContent } from "@/features/landing/components/landing-page-content";
import { getDesignPatternNotesForProfile } from "@/lib/benchmarks/library";
import { buildAuditReportById, getPublicScanHistoryCards } from "@/lib/mock/report-builder";
import { getRecentScans } from "@/lib/utils/scan-cache";
import {
  createWebsiteScreenshotUrl,
  inferProfileType,
  normalizeUrl,
} from "@/lib/utils/url";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";
import type { SampleAuditCard } from "@/lib/types/audit";

export const dynamic = "force-dynamic";

export default async function Home() {
  const samples = getPublicScanHistoryCards();

  // Merge in real recent scans from the cache
  const recentScans = await getRecentScans();
  const existingUrls = new Set(samples.map((s) => s.url));
  const recentCards: SampleAuditCard[] = recentScans
    .filter((scan) => !existingUrls.has(scan.normalizedUrl))
    .slice(0, 6)
    .map((scan) => ({
      id: scan.reportId,
      title: scan.title,
      url: scan.normalizedUrl,
      profile: inferProfileType(scan.normalizedUrl),
      summary: scan.summary,
      previewImage:
        scan.previewImage ??
        createWebsiteScreenshotUrl(normalizeUrl(scan.normalizedUrl, { stripWww: false }), "desktop"),
      score: scan.score,
      scannedAt: scan.scannedAt,
    }));
  const allSamples = [...recentCards, ...samples];

  const featuredAudit = allSamples.find((sample) => sample.id === "saunders-woodworks") ?? allSamples[0];
  const featuredReport = featuredAudit ? buildAuditReportById(featuredAudit.id) : null;

  if (!featuredAudit || !featuredReport) {
    return null;
  }

  return (
    <LandingPageContent
      featuredAudit={featuredAudit}
      featuredBreakdown={featuredReport.categoryScores}
      notes={getDesignPatternNotesForProfile("local-service").slice(0, 3)}
      samples={allSamples}
      targetBreakdown={buildBenchmarkTargetCategoryScores(featuredReport.categoryScores)}
    />
  );
}
