import { LandingPageContent } from "@/features/landing/components/landing-page-content";
import { getDesignPatternNotesForProfile } from "@/lib/benchmarks/library";
import { buildAuditReportById, getPublicScanHistoryCards } from "@/lib/mock/report-builder";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";

export default function Home() {
  const samples = getPublicScanHistoryCards();
  const featuredAudit = samples.find((sample) => sample.id === "saunders-woodworks") ?? samples[0];
  const featuredReport = featuredAudit ? buildAuditReportById(featuredAudit.id) : null;

  if (!featuredAudit || !featuredReport) {
    return null;
  }

  return (
    <LandingPageContent
      featuredAudit={featuredAudit}
      featuredBreakdown={featuredReport.categoryScores}
      notes={getDesignPatternNotesForProfile("local-service").slice(0, 3)}
      samples={samples}
      targetBreakdown={buildBenchmarkTargetCategoryScores(featuredReport.categoryScores)}
    />
  );
}
