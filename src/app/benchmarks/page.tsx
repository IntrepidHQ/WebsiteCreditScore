import type { Metadata } from "next";

import { PublicBenchmarksPage } from "@/features/benchmarks/components/public-benchmarks-page";
import {
  buildBenchmarkReferencesForProfile,
  getBenchmarkRubricForProfile,
  getDesignPatternNotesForProfile,
} from "@/lib/benchmarks/library";
import { buildAuditReportById } from "@/lib/mock/report-builder";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";

export const metadata: Metadata = {
  title: "Benchmarks | WebsiteCreditScore.com",
  description:
    "Public benchmark methodology for WebsiteCreditScore.com, including score thresholds, weighted categories, design principles, and benchmark examples.",
};

const benchmarkProfiles = [
  {
    id: "service-providers",
    label: "Home & service",
    profile: "local-service" as const,
  },
  {
    id: "private-healthcare",
    label: "Private care",
    profile: "healthcare" as const,
  },
  {
    id: "product-saas",
    label: "Product & SaaS",
    profile: "saas" as const,
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
      featuredExamples={benchmarkProfiles
        .map((item) =>
          buildBenchmarkReferencesForProfile(item.profile).find(
            (reference) => reference.tier === "flagship",
          ) ?? buildBenchmarkReferencesForProfile(item.profile)[0],
        )
        .filter(Boolean)}
      featuredNotes={getDesignPatternNotesForProfile("local-service").slice(0, 3)}
      targetBreakdown={buildBenchmarkTargetCategoryScores(
        featuredAuditReport.categoryScores,
      )}
      verticals={benchmarkProfiles.map((item) => ({
        id: item.id,
        label: item.label,
        rubric: getBenchmarkRubricForProfile(item.profile),
      }))}
    />
  );
}
