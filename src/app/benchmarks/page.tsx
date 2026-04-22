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
  title: "Website Benchmark Standards — What Does a High-Scoring Site Look Like?",
  description:
    "Explore the benchmark scoring criteria behind WebsiteCreditScore.com. See how visual design, UX, mobile experience, trust, SEO, and accessibility are weighted.",
  openGraph: {
    title: "Website Benchmark Standards",
    description:
      "The scoring rubric behind every website audit — weighted criteria, industry standards, and what separates 8+ score sites from 5-score sites.",
  },
};

const benchmarkProfiles: Array<{
  id: BenchmarkVertical;
  label: string;
}> = [
  { id: "service-providers", label: "Home & service" },
  { id: "private-healthcare", label: "Private care" },
  { id: "product-saas", label: "Product & SaaS" },
  { id: "fintech", label: "Fintech" },
  { id: "legal", label: "Law firms" },
  { id: "real-estate", label: "Real estate" },
  { id: "fitness", label: "Fitness & studios" },
  { id: "beauty-wellness", label: "Beauty & wellness" },
  { id: "construction-trades", label: "Construction & trades" },
  { id: "restaurant-hospitality", label: "Restaurants" },
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
