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
    <section
      className="relative presentation-section pb-8 pt-10 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[5] after:h-20 after:bg-gradient-to-t after:from-[var(--theme-background)] after:via-[color-mix(in_srgb,var(--theme-background)_55%,transparent)] after:to-transparent sm:pt-14"
      id="generate"
    >
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
