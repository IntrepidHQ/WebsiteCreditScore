import { LandingHeroBackdrop } from "@/features/landing/components/landing-hero-backdrop";
import { LandingHeroEditorial } from "@/features/landing/components/landing-hero-editorial";
import type { AuditCategoryScore, SampleAuditCard } from "@/lib/types/audit";

export function LandingHeroSection({
  featuredAudit,
  featuredBreakdown,
}: {
  featuredAudit: SampleAuditCard;
  featuredBreakdown: AuditCategoryScore[];
}) {
  return (
    <section className="relative presentation-section pb-8 pt-10 sm:pt-14" id="generate">
      <LandingHeroBackdrop
        magnifierMirror={
          <LandingHeroEditorial
            featuredAudit={featuredAudit}
            featuredBreakdown={featuredBreakdown}
            variant="mirror"
          />
        }
      />
      <div className="relative z-10 isolate">
        <LandingHeroEditorial
          featuredAudit={featuredAudit}
          featuredBreakdown={featuredBreakdown}
          variant="interactive"
        />
      </div>
    </section>
  );
}
