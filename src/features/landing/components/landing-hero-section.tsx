import Link from "next/link";
import { ArrowRight, Clock3, FileText, ScanSearch } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { ScoreDial } from "@/components/common/score-dial";
import { BlurText } from "@/components/ui/blur-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LandingHeroBackdrop } from "@/features/landing/components/landing-hero-backdrop";
import { LandingHeroEyebrowBadge } from "@/features/landing/components/landing-hero-eyebrow-badge";
import { LandingForm } from "@/features/landing/components/landing-form";
import type { AuditCategoryScore, SampleAuditCard } from "@/lib/types/audit";

const featuredKeys = new Set([
  "visual-design",
  "ux-conversion",
  "mobile-experience",
  "trust-credibility",
]);

export function LandingHeroSection({
  featuredAudit,
  featuredBreakdown,
}: {
  featuredAudit: SampleAuditCard;
  featuredBreakdown: AuditCategoryScore[];
}) {
  const heroBreakdown = featuredBreakdown.filter((item) => featuredKeys.has(item.key));

  return (
    <section className="presentation-section pb-8 pt-10 sm:pt-14" id="generate">
      {/* Aurora extends above the section boundary into the header zone, eliminating the gradient seam */}
      <LandingHeroBackdrop />
      <div className="mx-auto w-full max-w-[min(100%,96rem)] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
          <div className="space-y-6">
            <LandingHeroEyebrowBadge />
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                For business owners who want a site that earns more trust
              </p>
              <h1 className="theme-display-title-marketing max-w-[min(100%,58rem)] font-display leading-[0.92] tracking-[-0.055em] text-foreground">
                <BlurText
                  text="Turn your website into a stronger case for more business."
                  delay={60}
                  animateBy="words"
                  direction="top"
                  className="theme-display-title-marketing font-display leading-[0.92] tracking-[-0.055em]"
                />
              </h1>
              <p className="max-w-3xl text-[1.08rem] leading-8 text-muted sm:text-[1.2rem] sm:leading-9">
                Score the live site, see where it is leaking trust or momentum,
                and get a clearer plan for what to improve first.
              </p>
            </div>

            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <LandingForm />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="secondary">
                <Link href="/benchmarks">
                  See the scoring method
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/examples">
                  Browse examples
                  <FileText className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[20px] border border-border/60 bg-panel/40 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <Badge variant="accent">Launch window</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  Use code <span className="font-semibold text-accent">FIFTEEN</span> for a
                  restrained 15% launch discount.
                </p>
              </div>
              <div className="rounded-[20px] border border-border/60 bg-panel/40 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <Clock3 className="size-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                    Rush delivery
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  24-hour turnaround is available when you need answers before the week is gone.
                </p>
              </div>
            </div>
          </div>

          <div className="editorial-shell overflow-hidden rounded-[30px]">
            <PreviewImage
              alt={`${featuredAudit.title} live sample preview`}
              className="aspect-[16/10]"
              fallbackSrc={featuredAudit.fallbackPreviewImage}
              imageClassName="transition duration-500 hover:scale-[1.015]"
              loadingLabel="Capturing live example"
              src={featuredAudit.previewImage}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
            </PreviewImage>

            <div className="grid gap-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Live proof
                  </p>
                  <h2 className="theme-display-title-marketing-secondary mt-2 font-display leading-[0.95] tracking-[-0.05em] text-foreground">
                    {featuredAudit.title}
                  </h2>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/audit/${featuredAudit.id}`}>
                    Open sample audit
                    <ScanSearch className="size-4" />
                  </Link>
                </Button>
              </div>

              <p className="text-sm leading-7 text-muted">{featuredAudit.summary}</p>

              <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center">
                <ScoreDial label="Current score" score={featuredAudit.score ?? 0} />
                <ScoreBreakdownBars items={heroBreakdown} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
