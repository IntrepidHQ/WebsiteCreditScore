import { LandingPageContent } from "@/features/landing/components/landing-page-content";
import { getDesignPatternNotesForProfile } from "@/lib/benchmarks/library";
import { FORTUNE_500_HERO_CANDIDATE_IDS } from "@/lib/mock/fortune-500-sample-audits";
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

const HOME_RECENT_SCAN_LIMIT = Math.min(20, MAX_RECENT_SCANS);

export default async function Home() {
  const catalogSamples = getPublicScanHistoryCards();

  const fortuneHeroPool = catalogSamples.filter((sample) =>
    FORTUNE_500_HERO_CANDIDATE_IDS.includes(sample.id),
  );
  // Hero + benchmark breakdown must use catalog IDs `buildAuditReportById` can resolve (sample audits).
  const featuredAudit = (() => {
    if (!fortuneHeroPool.length) {
      return catalogSamples[0]!;
    }
    const [head, ...tail] = fortuneHeroPool;
    return tail.reduce(
      (best, current) => ((current.score ?? 0) > (best.score ?? 0) ? current : best),
      head,
    );
  })();
  const featuredReport = featuredAudit ? buildAuditReportById(featuredAudit.id) : null;

  // Merge in recent public scans (seeded JSON in dev, Supabase in production). Dedupe by report id.
  const recentScans = await getRecentScans();
  const seenReportIds = new Set<string>();
  const recentCards: SampleAuditCard[] = [];
  for (const scan of recentScans) {
    if (seenReportIds.has(scan.reportId)) {
      continue;
    }
    seenReportIds.add(scan.reportId);
    recentCards.push({
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
    });
    if (recentCards.length >= HOME_RECENT_SCAN_LIMIT) {
      break;
    }
  }
  // Fill remaining slots with catalog samples not already shown (keeps the grid lively in dev).
  const catalogFill = catalogSamples
    .filter((s) => !seenReportIds.has(s.id))
    .slice(0, Math.max(0, HOME_RECENT_SCAN_LIMIT - recentCards.length));
  const displaySamples = [...recentCards, ...catalogFill].slice(0, HOME_RECENT_SCAN_LIMIT);

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
