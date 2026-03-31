import type {
  BenchmarkReference,
  BenchmarkScan,
  BenchmarkVertical,
  ReportProfileType,
} from "@/lib/types/audit";
import {
  buildDesignElementScores,
  buildDesignPrincipleScores,
  calculateDesignScore,
} from "@/lib/benchmarks/design-score";
import { calculateAnimationScore } from "@/lib/benchmarks/motion";
import { buildObservedCategoryScores } from "@/lib/mock/report-enhancements";
import {
  buildBenchmarkReferencesForProfile,
  getBenchmarkRubric,
  getBenchmarkSites,
  getBenchmarkVerticalForProfile,
} from "@/lib/benchmarks/library";
import { inspectWebsite } from "@/lib/utils/site-observation";
import { aggregateOverallScore } from "@/lib/utils/scores";
import { createWebsiteScreenshotUrl, inferProfileType } from "@/lib/utils/url";

function scoreReference(reference: BenchmarkReference, profile: ReportProfileType) {
  return async () => {
    const observation = await inspectWebsite(reference.url);

    if (!observation.fetchSucceeded) {
      return {
        reference: {
          ...reference,
          scoreSource: "reference" as const,
          measuredAnimationScore: 0,
          benchmarkScanId: `${reference.id}-reference`,
        },
        scan: {
          id: `${reference.id}-reference`,
          siteId: reference.siteId,
          vertical: reference.vertical,
          overallScore: reference.targetScore,
          designScore: reference.targetScore,
          animationScore: 0,
          designElementScores: [],
          designPrincipleScores: [],
          categoryScores: [],
          scannedAt: new Date().toISOString(),
          previewImages: {
            desktop: reference.previewImage,
            mobile: reference.mobilePreviewImage,
          },
          note: reference.note,
          tier: reference.tier,
          scoreSource: "reference" as const,
        } satisfies BenchmarkScan,
      };
    }

    const measuredCategoryScores = buildObservedCategoryScores(
      inferProfileType(observation.finalUrl || reference.url) || profile,
      observation,
    );
    const measuredScore = aggregateOverallScore(measuredCategoryScores);
    const designElementScores = buildDesignElementScores(
      observation,
      measuredCategoryScores,
    );
    const designPrincipleScores = buildDesignPrincipleScores(
      observation,
      measuredCategoryScores,
    );
    const animationScore = calculateAnimationScore(observation);
    const desktopPreview = createWebsiteScreenshotUrl(
      observation.finalUrl || reference.url,
      "desktop",
    );
    const mobilePreview = createWebsiteScreenshotUrl(
      observation.finalUrl || reference.url,
      "mobile",
    );

    return {
      reference: {
        ...reference,
        previewImage: desktopPreview,
        mobilePreviewImage: mobilePreview,
        measuredCategoryScores,
        measuredScore,
        measuredAnimationScore: animationScore,
        scoreSource: "measured" as const,
        benchmarkScanId: `${reference.id}-measured`,
      },
      scan: {
        id: `${reference.id}-measured`,
        siteId: reference.siteId,
        vertical: reference.vertical,
        overallScore: measuredScore,
        designScore: calculateDesignScore(designElementScores, designPrincipleScores, animationScore),
        animationScore,
        designElementScores,
        designPrincipleScores,
        categoryScores: measuredCategoryScores,
        scannedAt: observation.fetchedAt,
        previewImages: {
          desktop: desktopPreview,
          mobile: mobilePreview,
        },
        note: reference.note,
        tier: reference.tier,
        scoreSource: "measured" as const,
      } satisfies BenchmarkScan,
    };
  };
}

export async function measureBenchmarkReferences(profile: ReportProfileType) {
  const references = buildBenchmarkReferencesForProfile(profile);
  const measured = await Promise.all(references.map((reference) => scoreReference(reference, profile)()));

  return {
    references: measured.map((item) => item.reference),
    scans: measured.map((item) => item.scan),
  };
}

export async function buildBenchmarkLibrarySnapshot(
  verticals: BenchmarkVertical[],
) {
  const snapshots = await Promise.all(
    verticals.map(async (vertical) => {
      const profile: ReportProfileType =
        vertical === "private-healthcare"
          ? "healthcare"
          : vertical === "service-providers"
            ? "local-service"
            : vertical === "fintech"
              ? "saas"
            : "saas";
      const { references, scans } = await measureBenchmarkReferences(profile);

      return {
        vertical,
        rubric: getBenchmarkRubric(vertical),
        sites: getBenchmarkSites(vertical),
        references,
        scans,
      };
    }),
  );

  return snapshots;
}

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
