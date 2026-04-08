import type { Metadata } from "next";

import { PublicBenchmarksPage } from "@/features/benchmarks/components/public-benchmarks-page";
import {
  buildBenchmarkReferencesForVertical,
  getBenchmarkDesignNotes,
  getBenchmarkRubric,
} from "@/lib/benchmarks/library";
import { mergeReferenceShowcase } from "@/lib/benchmarks/public-reference-showcase";
import { buildAuditReportById } from "@/lib/mock/report-builder";
import type { BenchmarkVertical } from "@/lib/types/audit";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";

export const metadata: Metadata = {
  title: "Benchmarks | WebsiteCreditScore.com",
  description:
    "Benchmark methodology for WebsiteCreditScore.com, including score thresholds, weighted categories, design principles, and benchmark examples.",
};

const benchmarkProfiles: Array<{
  id: BenchmarkVertical;
  label: string;
}> = [
  {
    id: "service-providers",
    label: "Home & service",
  },
  {
    id: "private-healthcare",
    label: "Private care",
  },
  {
    id: "product-saas",
    label: "Product & SaaS",
  },
  {
    id: "fintech",
    label: "Fintech",
  },
];

export default function BenchmarksPage() {
  const featuredAuditReport = buildAuditReportById("saunders-woodworks");

  if (!featuredAuditReport) {
    return null;
  }

  return (
    <PublicBenchmarksPage
      featuredAudit={{
        title: featuredAuditReport.title,
        summary: featuredAuditReport.executiveSummary,
        score: featuredAuditReport.overallScore,
        href: `/audit/${featuredAuditReport.id}`,
      }}
      featuredAuditBreakdown={featuredAuditReport.categoryScores}
      featuredExamples={mergeReferenceShowcase(
        benchmarkProfiles
          .map((item) =>
            buildBenchmarkReferencesForVertical(item.id).find(
              (reference) => reference.tier === "flagship",
            ) ?? buildBenchmarkReferencesForVertical(item.id)[0],
          )
          .filter(Boolean),
      )}
      featuredNotes={getBenchmarkDesignNotes("service-providers").slice(0, 3)}
      targetBreakdown={buildBenchmarkTargetCategoryScores(
        featuredAuditReport.categoryScores,
      )}
      verticals={benchmarkProfiles.map((item) => ({
        id: item.id,
        label: item.label,
        rubric: getBenchmarkRubric(item.id),
      }))}
    />
  );
}
