import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/common/section-heading";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";
import { getSampleAuditCards } from "@/lib/mock/report-builder";

export function LandingRecentReportsSection() {
  const samples = getSampleAuditCards();
  const scoredSamples = samples.filter((sample) => typeof sample.score === "number");
  const averageScore = scoredSamples.length
    ? (
        scoredSamples.reduce((sum, sample) => sum + (sample.score ?? 0), 0) /
        scoredSamples.length
      ).toFixed(1)
    : "0.0";
  const profileCount = new Set(samples.map((sample) => sample.profile)).size;
  const statCards = [
    { label: "Public samples", value: String(samples.length) },
    { label: "Average score", value: averageScore },
    { label: "Profiles", value: String(profileCount) },
  ] as const;

  return (
    <section className="presentation-section py-8" id="reports">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="editorial-shell relative overflow-hidden rounded-[30px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="signal-grid absolute inset-0 opacity-20" />
          <div className="relative space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <SectionHeading
                eyebrow="Recent scans"
                title="Real examples from the scan catalog"
                description="Open a scored example, read the evidence, and see how the recommendation turns into a stronger redesign story."
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {statCards.map((card) => (
                  <div
                    className="rounded-[20px] border border-border/60 bg-background/28 px-4 py-4"
                    key={card.label}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      {card.label}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <p className="font-display text-[2.4rem] leading-none tracking-[-0.05em] text-foreground">
                        {card.value}
                      </p>
                      <Badge variant="neutral">catalog</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div aria-label="Recent reports" className="horizontal-rail gap-5" tabIndex={0}>
              {samples.map((audit) => (
                <SampleAuditCard audit={audit} key={audit.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
