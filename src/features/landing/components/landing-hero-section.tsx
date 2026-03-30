import { Badge } from "@/components/ui/badge";
import { LandingForm } from "@/features/landing/components/landing-form";

export function LandingHeroSection() {
  return (
    <section className="presentation-section pb-8 pt-12 sm:pt-16" id="generate">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <Badge variant="accent">Website Audits, Reviews, and Redesigns</Badge>
          <div className="space-y-6">
            <h1 className="max-w-5xl font-display text-[clamp(4.4rem,3rem+4.8vw,8.6rem)] font-semibold tracking-[-0.06em] text-foreground">
              A clear score for your website—backed by what actually matters.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
              Quality and performance ratings you can trust, grounded in consistent benchmarks.
            </p>
          </div>
          <div className="max-w-4xl">
            <LandingForm />
          </div>
          <div className="grid gap-3 rounded-[calc(var(--theme-radius-lg))] border border-accent/20 bg-accent/8 p-4 sm:grid-cols-2">
            <div className="rounded-[10px] border border-border/70 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Launch coupon</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Use code <span className="font-semibold text-accent">FIFTEEN</span> for 15% off.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">100 redemptions total.</p>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Additional offer</p>
              <p className="mt-2 text-sm leading-6 text-foreground">24-Hour Turnaround</p>
              <p className="mt-1 text-sm leading-6 text-muted">$250 fee.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
