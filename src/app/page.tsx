import { LandingPageContent } from "@/features/landing/components/landing-page-content";
import { getDesignPatternNotesForProfile } from "@/lib/benchmarks/library";
import { buildAuditReportById, getPublicScanHistoryCards } from "@/lib/mock/report-builder";
import { getRecentScans, MAX_RECENT_SCANS } from "@/lib/utils/scan-cache";
import {
  createWebsiteScreenshotUrl,
  inferProfileType,
  normalizeUrl,
} from "@/lib/utils/url";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";
import type { SampleAuditCard } from "@/lib/types/audit";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalogSamples = getPublicScanHistoryCards();

  // Hero + benchmark breakdown must use catalog IDs `buildAuditReportById` can resolve (sample audits).
  const featuredAudit =
    catalogSamples.find((sample) => sample.id === "saunders-woodworks") ?? catalogSamples[0];
  const featuredReport = featuredAudit ? buildAuditReportById(featuredAudit.id) : null;

  // Merge in real recent scans from the cache (dedupe by normalized URL vs catalog).
  const recentScans = await getRecentScans();
  const catalogUrlKeys = new Set(
    catalogSamples.map((s) => normalizeUrl(s.url, { stripWww: true })),
  );
  const seenRecentKeys = new Set<string>();
  const recentCards: SampleAuditCard[] = recentScans
    .filter((scan) => {
      const key = normalizeUrl(scan.normalizedUrl, { stripWww: true });
      if (catalogUrlKeys.has(key) || seenRecentKeys.has(key)) {
        return false;
      }
      seenRecentKeys.add(key);
      return true;
    })
    .slice(0, 9)
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
  // Fill up to 9 cards: real recent scans first, then catalog samples as fallback
  const seenInRecent = new Set(recentCards.map((c) => normalizeUrl(c.url ?? "", { stripWww: true })));
  const catalogFill = catalogSamples
    .filter((s) => !seenInRecent.has(normalizeUrl(s.url ?? "", { stripWww: true })))
    .slice(0, Math.max(0, 9 - recentCards.length));
  const displaySamples = [...recentCards, ...catalogFill].slice(0, 9);

  if (!featuredAudit || !featuredReport) {
    return null;
  }

  return (
    <LandingPageContent
      featuredAudit={featuredAudit}
      featuredBreakdown={featuredReport.categoryScores}
      notes={getDesignPatternNotesForProfile("local-service").slice(0, 3)}
      samples={displaySamples}
      targetBreakdown={buildBenchmarkTargetCategoryScores(featuredReport.categoryScores)}
    />
  );
}
