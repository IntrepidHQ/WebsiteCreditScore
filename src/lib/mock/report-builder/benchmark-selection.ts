import type { BenchmarkReference, ReportProfileType } from "@/lib/types/audit";
import { REPORT_COMPETITOR_REFERENCE_LIMIT } from "@/lib/benchmarks/report-limits";
import { measureBenchmarkReferences, rankMeasuredBenchmarkReferences } from "@/lib/benchmarks/scans";
import { getBenchmarkReferenceScore } from "@/lib/mock/report-enhancements";

export const selectBenchmarkReferencesForReport = (
  currentUrl: string,
  currentOverallScore: number,
  references: BenchmarkReference[],
) => {
  const ranked = rankMeasuredBenchmarkReferences(currentUrl, currentOverallScore, references);
  const highScoring = ranked.filter(
    (reference) => getBenchmarkReferenceScore(reference) >= Math.max(9, currentOverallScore),
  );

  return (highScoring.length ? highScoring : ranked).slice(0, REPORT_COMPETITOR_REFERENCE_LIMIT);
};

export const enrichBenchmarkReferences = async (
  currentUrl: string,
  currentOverallScore: number,
  profile: ReportProfileType,
) => {
  const { references } = await measureBenchmarkReferences(profile);

  return selectBenchmarkReferencesForReport(currentUrl, currentOverallScore, references);
};

/** Broader ranked pool for Claude reranking (still only library-measured sites). */
export const listRankedBenchmarkCandidates = (
  currentUrl: string,
  currentOverallScore: number,
  references: BenchmarkReference[],
  limit = 24,
) => {
  const ranked = rankMeasuredBenchmarkReferences(currentUrl, currentOverallScore, references);
  return ranked.slice(0, limit);
};
