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
    const designElementScores = buildDesignElementScores(observation, measuredCategoryScores);
    const designPrincipleScores = buildDesignPrincipleScores(observation, measuredCategoryScores);
    const animationScore = calculateAnimationScore(observation);
    const desktopPreview = createWebsiteScreenshotUrl(observation.finalUrl || reference.url, "desktop");
    const mobilePreview = createWebsiteScreenshotUrl(observation.finalUrl || reference.url, "mobile");

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

export async function buildBenchmarkLibrarySnapshot(verticals: BenchmarkVertical[]) {
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
