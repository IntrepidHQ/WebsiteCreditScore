import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How It Works — WebsiteCreditScore",
  description:
    "Learn how WebsiteCreditScore grades websites across 8 dimensions using live AI research. Understand the methodology, scoring, and what every report includes.",
  openGraph: {
    title: "How WebsiteCreditScore Works",
    description:
      "AI-powered website trust scoring across 8 weighted dimensions — methodology, grading, and what each report includes.",
  },
};

const dimensions = [
  {
    key: "legitimacy",
    label: "Business Legitimacy",
    weight: "25%",
    color: "#3dd598",
    desc: "Is this a real, registered business? We check state filings, physical addresses, verifiable phone numbers, BBB registration, and whether contact information is consistent across sources.",
    signals: ["Business registration records", "BBB accreditation status", "Address verification", "Phone & email consistency"],
  },
  {
    key: "reputation",
    label: "Online Reputation",
    weight: "20%",
    color: "#38bdf8",
    desc: "What do customers actually say? We search Google Reviews, Trustpilot, Reddit, Yelp, and industry-specific review platforms — looking at sentiment, recency, and response patterns.",
    signals: ["Google review sentiment", "Trustpilot profile", "Reddit mentions", "BBB complaint history"],
  },
  {
    key: "transparency",
    label: "Transparency & Disclosure",
    weight: "12%",
    color: "#a78bfa",
    desc: "Does the site tell you what it is? We look for clear pricing, refund policies, terms of service, privacy policies, and honest representation of the company and its owners.",
    signals: ["Pricing clarity", "Refund / cancellation policy", "Privacy policy", "Terms of service"],
  },
  {
    key: "financial",
    label: "Financial Signals",
    weight: "12%",
    color: "#f7b21b",
    desc: "Is there evidence of real financial activity? We look at funding history, Crunchbase records, press coverage of revenue milestones, and signals of financial stability or distress.",
    signals: ["Funding rounds", "Crunchbase profile", "Revenue press coverage", "Financial distress signals"],
  },
  {
    key: "technical",
    label: "Technical Health",
    weight: "10%",
    color: "#34d399",
    desc: "Does the site operate like a legitimate business? HTTPS enforcement, page speed, uptime history, security headers, and basic infrastructure quality are all evaluated.",
    signals: ["HTTPS & TLS validity", "Page load performance", "Security headers", "Uptime history"],
  },
  {
    key: "longevity",
    label: "Domain & Company Longevity",
    weight: "10%",
    color: "#fb923c",
    desc: "How long has this site and company existed? Domain age, Wayback Machine history, and consistent business presence over time all indicate lower scam risk.",
    signals: ["Domain registration age", "Wayback Machine history", "Business founding date", "Consistent presence"],
  },
  {
    key: "content",
    label: "Content Quality",
    weight: "10%",
    color: "#f472b6",
    desc: "Does the content reflect a real expert operation? We look for depth, original research, author credentials, and evidence-backed claims — versus thin, copy-pasted, or AI-spun filler.",
    signals: ["Content depth & originality", "Author expertise signals", "Cited sources", "Accuracy indicators"],
  },
  {
    key: "social",
    label: "Social & Press Presence",
    weight: "10%",
    color: "#60a5fa",
    desc: "Is there a real community around this brand? We check LinkedIn, X/Twitter, YouTube, and press mentions — distinguishing genuine engagement from ghost accounts or purchased followers.",
    signals: ["LinkedIn company page", "X/Twitter activity", "YouTube presence", "Press & news mentions"],
  },
];

const faqItems = [
  {
    q: "How long does a scan take?",
    a: "Most scans complete in 60–120 seconds. Claude AI runs 8–10 live web searches in parallel, then synthesizes the results into a graded report. Complex or obscure domains may take slightly longer.",
  },
  {
    q: "Is the $1 charge refundable?",
    a: "Yes — if the scan fails to produce a report, you are automatically refunded in full within a few business days. We do not offer refunds for completed reports, as the AI research has already been performed.",
  },
  {
    q: "How is the overall score calculated?",
    a: "Each of the 8 dimensions is scored 0–100 and then multiplied by its weight. The weighted sum produces the overall score (also 0–100). The letter grade (A+ to F) maps to score tiers: A+ ≥ 95, A ≥ 90, B+ ≥ 85, and so on.",
  },
  {
    q: "Can I run a scan on any website?",
    a: "Yes — any publicly accessible domain. Government sites, personal blogs, major platforms, local businesses, and new startups all work. The quality of the report depends on how much public information exists about the domain.",
  },
  {
    q: "Is the report stored? Can I share it?",
    a: "Your report is stored at a permanent URL tied to your scan ID. Anyone with the link can view it. Reports are not indexed by search engines by default.",
  },
  {
    q: "Does a low score mean the site is a scam?",
    a: "Not necessarily. Low scores often reflect thin online presence, young domains, or missing transparency signals — common for new businesses that haven't yet built up a track record. A high score indicates strong trust signals, not a guarantee.",
  },
];

export default function DocsPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

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
            Methodology & FAQ
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl"
            style={{ color: "var(--theme-foreground)" }}
          >
            How it works
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--theme-muted)" }}>
            Every report is powered by Claude AI running 8–10 live web searches per domain.
            Here's exactly what we look for, how we weight it, and what you get back.
          </p>
        </div>
      </section>

      {/* How a scan works */}
      <section
        className="px-6 py-14"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-8" style={{ color: "var(--theme-foreground)" }}>
            What happens when you scan a domain
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Enter domain", body: "You type any domain (e.g. acmeplumbing.com). No account needed." },
              { step: "02", title: "Pay $1", body: "Stripe processes the payment securely. We never store card details." },
              { step: "03", title: "AI researches", body: "Claude AI runs 8–10 live searches: reviews, filings, Reddit, press, technical checks, and more." },
              { step: "04", title: "Get your report", body: "8 graded dimensions, red/green flags, cited sources, and an overall A–F letter grade." },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-xl p-5 space-y-2"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <span className="font-mono text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>
                  {step}
                </span>
                <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                  {title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Dimensions */}
      <section className="px-6 py-14" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--theme-foreground)" }}>
            The 8 scoring dimensions
          </h2>
          <p className="text-sm mb-10" style={{ color: "var(--theme-muted)" }}>
            Each dimension is weighted independently. The weighted average produces the overall 0–100 score.
          </p>
          <div className="space-y-4">
            {dimensions.map((dim) => (
              <div
                key={dim.key}
                className="rounded-xl p-5"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dim.color, opacity: 0.6 }}
                    />
                    <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                      {dim.label}
                    </p>
                  </div>
                  <span
                    className="text-sm font-mono font-bold flex-shrink-0"
                    style={{ color: dim.color }}
                  >
                    {dim.weight}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-3 pl-5" style={{ color: "var(--theme-muted)" }}>
                  {dim.desc}
                </p>
                <div className="flex flex-wrap gap-2 pl-5">
                  {dim.signals.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        border: "1px solid var(--theme-border)",
                        color: "var(--theme-muted)",
                        backgroundColor: "color-mix(in srgb, var(--theme-background-alt) 60%, transparent)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grading scale */}
      <section
        className="px-6 py-14"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-8" style={{ color: "var(--theme-foreground)" }}>
            What each grade means
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { grade: "A+ / A", range: "90–100", label: "Exceptional", color: "#3dd598", desc: "Strong trust signals across almost every dimension. Very low risk." },
              { grade: "A− / B+", range: "75–89", label: "Strong", color: "#60a5fa", desc: "Solid credibility with minor gaps. Converts well but some signals missing." },
              { grade: "B / C", range: "55–74", label: "Average", color: "#f7b21b", desc: "Adequate presence but gaps in transparency, reputation, or technical health." },
              { grade: "D / F", range: "Below 55", label: "At Risk", color: "#f87171", desc: "Red flags outweigh green signals. High caution warranted before engaging." },
            ].map((tier) => (
              <div
                key={tier.grade}
                className="rounded-xl p-4 space-y-2"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono" style={{ color: tier.color }}>
                    {tier.grade}
                  </span>
                  <span className="text-xs" style={{ color: "var(--theme-muted)" }}>{tier.range}</span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>{tier.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-8" style={{ color: "var(--theme-foreground)" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqItems.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl p-5 space-y-2"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 text-center"
        style={{ backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-xl mx-auto space-y-6">
          <h2
            className="font-display text-3xl"
            style={{ color: "var(--theme-foreground)" }}
          >
            Ready to run your first scan?
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Any domain · $1 · No account · Results in ~90 seconds
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

      <SiteFooter />
    </main>
  );
}
