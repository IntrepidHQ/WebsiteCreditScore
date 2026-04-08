import { AuditHeroSection } from "@/features/audit/components/audit-hero-section";
import { BeforeAfterSection } from "@/features/audit/components/before-after-section";
import { CompetitorResearchSection } from "@/features/audit/components/competitor-research-section";
import { FindingsSection } from "@/features/audit/components/findings-section";
import { PricingConfigurator } from "@/features/pricing/components/pricing-configurator";
import { ProposalActions } from "@/features/audit/components/proposal-actions";
import { RebuildStrategySection } from "@/features/audit/components/rebuild-strategy-section";
import { SignupPromptBanner } from "@/features/audit/components/signup-prompt-banner";
import type { AuditReport, FindingSection as FindingSectionKey } from "@/lib/types/audit";

const sectionOrder: FindingSectionKey[] = [
  "what-working",
  "costing-leads",
  "technical-seo",
  "security-posture",
];

export function AuditReportSections({
  report,
  isAuthenticated = false,
}: {
  report: AuditReport;
  isAuthenticated?: boolean;
}) {
  return (
    <>
      <AuditHeroSection report={report} />
      <CompetitorResearchSection report={report} />
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
      {!isAuthenticated && (
        <SignupPromptBanner
          reportTitle={report.title}
          returnPath={`/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}
        />
      )}
    </>
  );
}
