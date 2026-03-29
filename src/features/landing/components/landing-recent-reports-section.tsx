import { SectionHeading } from "@/components/common/section-heading";
import { getSampleAuditCards } from "@/lib/mock/report-builder";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";

export function LandingRecentReportsSection() {
  const samples = getSampleAuditCards();

  return (
    <section className="presentation-section py-8" id="reports">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Recent scans"
          title="Live examples from the scan catalog"
          description="Open a few recent sites and see the score, the evidence, and the next step."
        />
        <div aria-label="Recent reports" className="horizontal-rail gap-5" tabIndex={0}>
          {samples.map((audit) => (
            <SampleAuditCard audit={audit} key={audit.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
