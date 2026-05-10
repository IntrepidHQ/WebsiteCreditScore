import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — WebsiteCreditScore",
  description: "How WebsiteCreditScore.com collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      <article className="max-w-2xl mx-auto px-6 py-16 space-y-10 flex-1 w-full">
        <div className="space-y-2">
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", color: "var(--theme-foreground)" }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>Last updated: April 26, 2026</p>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
          WebsiteCreditScore.com (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates a pay-per-scan website intelligence service. This policy explains what data we collect, how we use it, and your rights. Questions? Email{" "}
          <a href="mailto:hello@websitecreditscore.com" className="underline underline-offset-2 hover:opacity-80" style={{ color: "var(--theme-accent)" }}>
            hello@websitecreditscore.com
          </a>.
        </p>

        {[
          {
            title: "1. What we collect",
            content: (
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>Scan data</p>
                  <p>When you submit a domain for scanning, we store the domain name, selected scan depth, the generated report, the number of sources analyzed, and the cost in cents. We do not collect any personal information about the person who owns the domain being scanned.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>Payment data</p>
                  <p>Payments are processed by Stripe. We receive a Stripe session ID and payment confirmation. We never see, store, or touch your card number, CVV, or full billing address — Stripe handles all of that under their PCI-DSS compliance program.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>Free scan verification</p>
                  <p>If you claim a free Aerial Scan, we collect and store your verified email address so we can enforce one free scan per person and prevent abuse. Paid scans do not require an account.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>Technical data</p>
                  <p>We store a hashed (non-reversible) version of your IP address and your browser&rsquo;s user agent string with each scan request. This is used solely for fraud prevention and abuse detection.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>Analytics</p>
                  <p>We use Vercel Analytics for aggregate, anonymized traffic data. No cookies are set for tracking. No cross-site tracking.</p>
                </div>
              </div>
            ),
          },
          {
            title: "2. What we don't collect",
            content: (
              <ul className="space-y-1.5 text-sm leading-relaxed list-disc list-inside" style={{ color: "var(--theme-muted)" }}>
                <li>No account is required for paid scans.</li>
                <li>Free Aerial Scans require verified email so they cannot be repeatedly claimed.</li>
                <li>No cookies beyond what Stripe needs for checkout.</li>
                <li>No marketing pixels or retargeting tags.</li>
                <li>No sale of your data to any third party, ever.</li>
              </ul>
            ),
          },
          {
            title: "3. How we use your data",
            content: (
              <ul className="space-y-1.5 text-sm leading-relaxed list-disc list-inside" style={{ color: "var(--theme-muted)" }}>
                <li>To deliver the scan report you paid for.</li>
                <li>To display the recent scans feed on the homepage (domain, grade, headline — no personal info).</li>
                <li>To detect and prevent fraudulent or abusive use of the service.</li>
                <li>To improve our scoring methodology using anonymized, aggregated data.</li>
              </ul>
            ),
          },
          {
            title: "4. Subprocessors",
            content: (
              <div className="space-y-2 text-sm" style={{ color: "var(--theme-muted)" }}>
                {[
                  ["Supabase", "Scan result storage and database"],
                  ["Stripe", "Payment processing"],
                  ["Vercel", "Hosting and analytics"],
                  ["Anthropic", "AI-powered report generation"],
                  ["Firecrawl / Tavily", "Live web search during scans"],
                ].map(([name, desc]) => (
                  <div key={name} className="flex gap-3">
                    <span className="font-semibold shrink-0" style={{ color: "var(--theme-foreground)", minWidth: "120px" }}>{name}</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "5. Data retention",
            content: (
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                Scan reports are retained indefinitely so that shareable report URLs remain valid. Hashed IP addresses are retained for 90 days. If you want a scan report deleted, email us with the report URL and we will remove it within 5 business days.
              </p>
            ),
          },
          {
            title: "6. International transfers",
            content: (
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                Our infrastructure is based in the United States. Subprocessors may store data in other countries. We rely on standard contractual clauses and equivalent safeguards where applicable.
              </p>
            ),
          },
          {
            title: "7. Your rights",
            content: (
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                You may request access to, correction of, or deletion of any data we hold that is associated with your scan. The easiest way to identify your data is to send us the report URL or the email used to claim a free scan. Email{" "}
                <a href="mailto:hello@websitecreditscore.com" className="underline underline-offset-2 hover:opacity-80" style={{ color: "var(--theme-accent)" }}>
                  hello@websitecreditscore.com
                </a>
                {" "}and we will respond within 30 days.
              </p>
            ),
          },
          {
            title: "8. Children",
            content: (
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                This service is not intended for children under 16. We do not knowingly collect data from anyone under 16. If you believe a minor has submitted a scan, please contact us and we will delete it.
              </p>
            ),
          },
          {
            title: "9. Changes to this policy",
            content: (
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                We will post any material changes here and update the &ldquo;last updated&rdquo; date. Continued use of the service after changes means you accept the updated policy.
              </p>
            ),
          },
        ].map(({ title, content }) => (
          <section key={title} className="space-y-3">
            <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>{title}</h2>
            <div style={{ borderTop: "1px solid var(--theme-border)" }} className="pt-3">
              {content}
            </div>
          </section>
        ))}
      </article>

      <SiteFooter />
    </main>
  );
}
