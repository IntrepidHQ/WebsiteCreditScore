import { notFound } from "next/navigation";

import { AuditHeroSection } from "@/features/audit/components/audit-hero-section";
import { BeforeAfterSection } from "@/features/audit/components/before-after-section";
import { ComparisonSection } from "@/features/audit/components/comparison-section";
import { FindingsSection } from "@/features/audit/components/findings-section";
import { PricingConfigurator } from "@/features/pricing/components/pricing-configurator";
import { ProposalActions } from "@/features/audit/components/proposal-actions";
import { RebuildStrategySection } from "@/features/audit/components/rebuild-strategy-section";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import { BenchmarkSection } from "@/features/audit/components/benchmark-section";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";
import type { FindingSection as FindingSectionKey } from "@/lib/types/audit";

const sectionOrder: FindingSectionKey[] = [
  "what-working",
  "costing-leads",
  "technical-seo",
  "security-posture",
];

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { id } = await params;
  const { url } = await searchParams;

  let report = null;

  if (url) {
    try {
      report = await buildLiveAuditReportFromUrl(url);
    } catch {
      return (
        <ReportEmptyState
          title="This URL needs a cleaner format"
          description="Use a valid public website URL to generate the audit. The report route itself is working, but the incoming URL was not parseable."
        />
      );
    }
  } else {
    report = await buildLiveAuditReportById(id);
  }

  if (!report) {
    notFound();
  }

  return (
    <main id="main-content">
      <AuditHeroSection report={report} />
      <ComparisonSection report={report} />
      <BenchmarkSection report={report} />
      {sectionOrder.map((section) => (
        <FindingsSection
          findings={report.findings.filter((finding) => finding.section === section)}
          key={section}
          section={section}
        />
      ))}
      <RebuildStrategySection report={report} />
      <BeforeAfterSection report={report} />
      <PricingConfigurator report={report} />
      <ProposalActions report={report} />
    </main>
  );
}
