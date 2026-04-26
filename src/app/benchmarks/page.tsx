import type { Metadata } from "next";
import { getBenchmarkRubric } from "@/lib/benchmarks/library";
import type { BenchmarkVertical } from "@/lib/types/audit";

export const metadata: Metadata = {
  title: "Website Benchmark Standards — WebsiteCreditScore",
  description:
    "Explore the benchmark scoring criteria behind WebsiteCreditScore.com. See how legitimacy, reputation, technical health, and 5 other dimensions are weighted.",
  openGraph: {
    title: "Website Benchmark Standards",
    description:
      "The scoring rubric behind every website credibility report — see what separates A-grade sites from the rest.",
  },
};

const verticals: Array<{ id: BenchmarkVertical; label: string; emoji: string }> = [
  { id: "service-providers", label: "Home & Service", emoji: "🏠" },
  { id: "private-healthcare", label: "Private Care", emoji: "🏥" },
  { id: "product-saas", label: "Product & SaaS", emoji: "🖥️" },
  { id: "fintech", label: "Fintech", emoji: "💳" },
  { id: "legal", label: "Law Firms", emoji: "⚖️" },
  { id: "real-estate", label: "Real Estate", emoji: "🏡" },
  { id: "fitness", label: "Fitness & Studios", emoji: "🏋️" },
  { id: "beauty-wellness", label: "Beauty & Wellness", emoji: "💆" },
  { id: "construction-trades", label: "Construction & Trades", emoji: "🔨" },
  { id: "restaurant-hospitality", label: "Restaurants", emoji: "🍽️" },
  { id: "dental", label: "Dental Practices", emoji: "🦷" },
  { id: "retail-ecommerce", label: "Retail & E-commerce", emoji: "🛍️" },
];

const scoreTiers = [
  { range: "90–100", grade: "A+/A", label: "Exceptional", color: "#3dd598", description: "Sets the bar for the industry. Trust is immediate, evidence is deep, and the experience is friction-free." },
  { range: "75–89", grade: "A−/B+", label: "Strong", color: "#f7b21b", description: "Solid credibility signals with minor gaps. Converts well but leaves some trust on the table." },
  { range: "55–74", grade: "B/C", label: "Average", color: "#ffcf66", description: "Adequate presence but significant room for improvement in transparency or technical health." },
  { range: "Below 55", grade: "D/F", label: "At Risk", color: "#ff8b8b", description: "Red flags outweigh green signals. Visitors are likely to bounce before they commit." },
];

const dimensions = [
  { key: "legitimacy", label: "Legitimacy", weight: "25%", desc: "Business registration, contact information, physical presence, and verifiable identity signals." },
  { key: "reputation", label: "Reputation", weight: "20%", desc: "Review sentiment across Google, Trustpilot, BBB, Reddit, and industry-specific platforms." },
  { key: "longevity", label: "Longevity", weight: "12%", desc: "Domain age, business tenure, and stability signals over time." },
  { key: "transparency", label: "Transparency", weight: "12%", desc: "Clear pricing, terms, privacy policy, refund policy, and honest representation of the business." },
  { key: "technical", label: "Technical Health", weight: "10%", desc: "HTTPS, load speed, Core Web Vitals, uptime signals, and security headers." },
  { key: "content", label: "Content Quality", weight: "8%", desc: "Depth, accuracy, and evidence-backed claims vs. vague marketing copy." },
  { key: "social_presence", label: "Social Presence", weight: "8%", desc: "LinkedIn, X/Twitter, YouTube — active channels with real engagement vs. ghost accounts." },
  { key: "financial_signals", label: "Financial Signals", weight: "5%", desc: "Funding history, revenue signals, financial press coverage, and viability indicators." },
];

export default function BenchmarksPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--theme-border)" }}
      >
        <a
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          style={{ color: "var(--theme-foreground)" }}
        >
          WebsiteCreditScore
        </a>
        <a
          href="/"
          className="text-xs hover:opacity-80 transition-opacity"
          style={{ color: "var(--theme-muted)" }}
        >
          ← Run a scan
        </a>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 text-center" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
            style={{
              border: "1px solid var(--theme-border)",
              backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)",
              color: "var(--theme-muted)",
            }}
          >
            Scoring methodology
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ color: "var(--theme-foreground)" }}
          >
            What Makes a Website
            <br />
            <span style={{ color: "var(--theme-accent)" }}>Earn an A+?</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--theme-muted)" }}>
            Every WebsiteCreditScore report grades a domain across 8 weighted dimensions using 8–10 live web searches.
            Here's exactly what we look for — by industry.
          </p>
        </div>
      </section>

      {/* Score tiers */}
      <section className="px-6 py-12" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--theme-foreground)" }}>
            Score Tiers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scoreTiers.map((tier) => (
              <div
                key={tier.grade}
                className="rounded-xl p-4 space-y-2"
                style={{
                  border: "1px solid var(--theme-border)",
                  backgroundColor: "var(--theme-panel)",
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono" style={{ color: tier.color }}>
                    {tier.grade}
                  </span>
                  <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                    {tier.range}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
                  {tier.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Dimensions */}
      <section
        className="px-6 py-12"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--theme-foreground)" }}>
            The 8 Scoring Dimensions
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--theme-muted)" }}>
            Claude AI uses up to 10 live web searches per scan to evaluate each dimension with cited evidence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dimensions.map((dim) => (
              <div
                key={dim.key}
                className="rounded-xl p-4"
                style={{
                  border: "1px solid var(--theme-border)",
                  backgroundColor: "var(--theme-panel)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                    {dim.label}
                  </p>
                  <span
                    className="text-xs font-mono font-semibold shrink-0 mt-0.5"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    {dim.weight}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry rubrics */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--theme-foreground)" }}>
            Industry-Specific Standards
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--theme-muted)" }}>
            Scores are calibrated to industry expectations. A dental practice and a SaaS startup
            face different trust signals — the rubric accounts for both.
          </p>

          <div className="space-y-4">
            {verticals.map(({ id, label, emoji }) => {
              const rubric = getBenchmarkRubric(id);
              if (!rubric) return null;
              return (
                <details
                  key={id}
                  className="group rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--theme-border)" }}
                >
                  <summary
                    className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none"
                    style={{ backgroundColor: "var(--theme-panel)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{emoji}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                          {label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--theme-muted)" }}>
                          {rubric.title}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs shrink-0 transition-transform group-open:rotate-180"
                      style={{ color: "var(--theme-muted)" }}
                    >
                      ▾
                    </span>
                  </summary>

                  <div
                    className="px-5 py-4 space-y-5"
                    style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                      {rubric.summary}
                    </p>

                    {rubric.fastLifts && rubric.fastLifts.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--theme-accent)" }}>
                          Fast improvements
                        </p>
                        <ul className="space-y-1">
                          {rubric.fastLifts.map((lift, i) => (
                            <li key={i} className="text-xs flex gap-2" style={{ color: "var(--theme-muted)" }}>
                              <span style={{ color: "var(--theme-accent)" }}>→</span>
                              {lift}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rubric.criteria.slice(0, 4).map((criterion) => (
                        <div
                          key={criterion.id}
                          className="rounded-lg p-3"
                          style={{
                            border: "1px solid var(--theme-border)",
                            backgroundColor: "var(--theme-panel)",
                          }}
                        >
                          <p className="text-xs font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>
                            {criterion.title}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                            {criterion.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 text-center"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold" style={{ color: "var(--theme-foreground)" }}>
            See how any site scores
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Our AI researches any domain across all 8 dimensions with live web evidence. Results in ~90 seconds.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--theme-accent)",
              color: "var(--theme-accent-foreground)",
            }}
          >
            Get a Report · $1
          </a>
        </div>
      </section>

      <footer
        className="px-6 py-6 text-center text-xs"
        style={{
          borderTop: "1px solid var(--theme-border)",
          color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)",
        }}
      >
        WebsiteCreditScore · Not financial advice · Reports reflect AI research at time of scan
      </footer>
    </main>
  );
}
