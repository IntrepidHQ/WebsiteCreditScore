import { LandingHeroSection } from "@/features/landing/components/landing-hero-section";
import { LandingRecentReportsSection } from "@/features/landing/components/landing-recent-reports-section";
import { LandingWorkflowSection } from "@/features/landing/components/landing-workflow-section";

export function LandingPageContent() {
  return (
    <main id="main-content">
      <LandingHeroSection />
      <LandingRecentReportsSection />
      <LandingWorkflowSection />
    </main>
  );
}
