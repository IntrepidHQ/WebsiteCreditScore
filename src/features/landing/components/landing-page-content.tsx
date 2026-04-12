import { LandingChatSection } from "@/features/landing/components/landing-chat-section";
import { LandingHeroSection } from "@/features/landing/components/landing-hero-section";
import { LandingRecentReportsSection } from "@/features/landing/components/landing-recent-reports-section";
import { LandingWorkflowSection } from "@/features/landing/components/landing-workflow-section";
import type { AuditCategoryScore, DesignPatternNote, SampleAuditCard } from "@/lib/types/audit";

export function LandingPageContent({
  featuredAudit,
  featuredBreakdown,
  targetBreakdown,
  notes,
  samples,
}: {
  featuredAudit: SampleAuditCard;
  featuredBreakdown: AuditCategoryScore[];
  targetBreakdown: AuditCategoryScore[];
  notes: DesignPatternNote[];
  samples: SampleAuditCard[];
}) {
  return (
    <main id="main-content">
      <LandingHeroSection
        featuredAudit={featuredAudit}
        featuredBreakdown={featuredBreakdown}
      />
      <LandingWorkflowSection
        currentBreakdown={featuredBreakdown}
        notes={notes}
        targetBreakdown={targetBreakdown}
      />
      <LandingRecentReportsSection samples={samples} />
      <LandingChatSection />
    </main>
  );
}
