import { Badge } from "@/components/ui/badge";
import { LandingForm } from "@/features/landing/components/landing-form";

export function LandingHeroSection() {
  return (
    <section className="presentation-section pb-8 pt-12 sm:pt-16" id="generate">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <Badge variant="accent">Craydl for designers, developers, and web product providers</Badge>
          <div className="space-y-6">
            <h1 className="max-w-5xl font-display text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-7xl">
              Turn a live website into a{" "}
              <span className="gradient-type">
                sendable audit and scoped <span className="whitespace-nowrap">web deal.</span>
              </span>
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
              Built for business owners who want a clearer score, a better plan, and a site that sells itself faster.
            </p>
          </div>
          <div className="max-w-4xl">
            <LandingForm />
          </div>
          <div className="grid gap-3 rounded-[calc(var(--theme-radius-lg))] border border-accent/20 bg-accent/8 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Launch offer</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Use code <span className="font-semibold text-accent">FIFTEEN</span> for 15% off your first build. 100 redemptions total.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Claim now or request changes later. The preview stays familiar by pulling from your existing site and brand assets.
              </p>
            </div>
            <Badge className="w-fit" variant="accent">
              15% off
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
