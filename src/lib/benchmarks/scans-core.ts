import type {
  BenchmarkReference,
  BenchmarkScan,
  BenchmarkVertical,
  ReportProfileType,
} from "@/lib/types/audit";
import { getBenchmarkRubric, getBenchmarkVerticalForProfile } from "@/lib/benchmarks/library";

export function getMeasuredBenchmarkScore(reference: BenchmarkReference) {
  return reference.measuredScore ?? reference.targetScore;
}

export function rankMeasuredBenchmarkReferences(
  currentUrl: string,
  currentOverallScore: number,
  references: BenchmarkReference[],
) {
  const currentHostname = new URL(currentUrl).hostname.replace(/^www\./, "");

  return [...references]
    .filter(
      (reference) =>
        new URL(reference.url).hostname.replace(/^www\./, "") !== currentHostname,
    )
    .sort((left, right) => {
      const leftScore = getMeasuredBenchmarkScore(left);
      const rightScore = getMeasuredBenchmarkScore(right);
      const leftRubricBonus = left.measuredCategoryScores?.length
        ? left.measuredCategoryScores.filter((item) => item.score >= 8).length * 0.05
        : 0;
      const rightRubricBonus = right.measuredCategoryScores?.length
        ? right.measuredCategoryScores.filter((item) => item.score >= 8).length * 0.05
        : 0;
      const leftIsStronger = leftScore > currentOverallScore;
      const rightIsStronger = rightScore > currentOverallScore;

      if (leftIsStronger !== rightIsStronger) {
        return leftIsStronger ? -1 : 1;
      }

      return rightScore + rightRubricBonus - (leftScore + leftRubricBonus);
    });
}

export function getBenchmarkReferenceRange(references: BenchmarkReference[]) {
  const scores = references.map((item) => getMeasuredBenchmarkScore(item));

  return {
    floor: scores.length ? Math.min(...scores) : 8.2,
    ceiling: scores.length ? Math.max(...scores) : 9.1,
  };
}

export function sortBenchmarkReferencesByScore(
  references: BenchmarkReference[],
  scans: BenchmarkScan[],
) {
  const scanMap = new Map(scans.map((scan) => [scan.siteId, scan]));

  return [...references].sort((left, right) => {
    const leftScore =
      scanMap.get(left.siteId)?.overallScore ?? getMeasuredBenchmarkScore(left);
    const rightScore =
      scanMap.get(right.siteId)?.overallScore ?? getMeasuredBenchmarkScore(right);

    return rightScore - leftScore;
  });
}

export function sortBenchmarkReferencesByRecentScan(
  references: BenchmarkReference[],
  scans: BenchmarkScan[],
) {
  const scanMap = new Map(scans.map((scan) => [scan.siteId, scan]));

  return [...references].sort((left, right) => {
    const leftScan = scanMap.get(left.siteId);
    const rightScan = scanMap.get(right.siteId);
    const leftTime = leftScan?.scannedAt ? new Date(leftScan.scannedAt).getTime() : 0;
    const rightTime = rightScan?.scannedAt ? new Date(rightScan.scannedAt).getTime() : 0;

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    const leftScore = leftScan?.overallScore ?? getMeasuredBenchmarkScore(left);
    const rightScore = rightScan?.overallScore ?? getMeasuredBenchmarkScore(right);

    return rightScore - leftScore;
  });
}

export function selectFeaturedBenchmarkReferences(
  references: BenchmarkReference[],
  scans: BenchmarkScan[],
  options?: {
    limit?: number;
    minScore?: number;
    focusArea?: NonNullable<BenchmarkReference["focusArea"]>;
  },
) {
  const limit = options?.limit ?? 3;
  const minScore = options?.minScore ?? 9;
  const scanMap = new Map(scans.map((scan) => [scan.siteId, scan]));

  return sortBenchmarkReferencesByScore(references, scans)
    .filter((reference) =>
      options?.focusArea ? reference.focusArea === options.focusArea : true,
    )
    .filter((reference) => {
      const scanScore =
        scanMap.get(reference.siteId)?.overallScore ?? getMeasuredBenchmarkScore(reference);

      return scanScore >= minScore;
    })
    .slice(0, limit);
}

export function buildBenchmarkFocusSummary(vertical: BenchmarkVertical) {
  const rubric = getBenchmarkRubric(vertical);

  return rubric.criteria.slice(0, 3).map((criterion) => criterion.title);
}

export function getBenchmarkVerticalLabel(vertical: BenchmarkVertical) {
  return getBenchmarkRubric(vertical).title;
}

export function getPrimaryAuditBenchmarkVertical(profile: ReportProfileType) {
  return getBenchmarkVerticalForProfile(profile);
}
