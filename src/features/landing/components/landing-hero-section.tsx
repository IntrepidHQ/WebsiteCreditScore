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
              Built for agencies and website providers serving service businesses.
            </p>
          </div>
          <div className="max-w-4xl">
            <LandingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
