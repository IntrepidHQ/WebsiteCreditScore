import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "About — WebsiteCreditScore",
  description:
    "About WebsiteCreditScore.com, the operator, methodology, support contact, and transparency commitments behind the website trust report tool.",
};

const facts = [
  ["Operator", "Hans Turner"],
  ["Location", "Mount Pleasant / Charleston, South Carolina"],
  ["Support", "websitecreditscore@gmail.com"],
  ["Service", "AI-powered website credibility reports using live public web research"],
  ["Pricing", "Free Aerial Scan during the current launch window; paid deeper scans and bundles are listed on the pricing page"],
  ["Refunds", "Failed scans are refunded automatically; completed reports are not refunded because research compute has already run"],
];

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      <article className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
          Company
        </p>
        <h1
          className="font-display mt-3"
          style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "var(--theme-foreground)", lineHeight: 0.95 }}
        >
          WebsiteCreditScore is a trust report tool for the public web.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
          WebsiteCreditScore.com scores live websites across ten credibility dimensions: legitimacy, reputation,
          design, UX, transparency, technical health, content depth, social presence, longevity, and financial
          signals. The product exists to turn scattered public evidence into a practical report that business owners,
          buyers, agencies, and operators can act on.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>
                {label}
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed" style={{ color: "var(--theme-foreground)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12 space-y-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            Who operates it
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            The site is operated by{" "}
            <a href="https://hansturner.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "var(--theme-accent)" }}>
              Hans Turner
            </a>
            , a web strategist based in the Charleston, South Carolina area. Public support is handled at{" "}
            <a href="mailto:websitecreditscore@gmail.com" className="underline underline-offset-2" style={{ color: "var(--theme-accent)" }}>
              websitecreditscore@gmail.com
            </a>
            .
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Portfolio", "https://hansturner.com"],
              ["LinkedIn", "https://www.linkedin.com/in/hans-turner-01155448/"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}
              >
                {label} →
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            What is public and verifiable
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Methodology", "/docs"],
              ["Pricing", "/pricing"],
              ["Privacy policy", "/privacy"],
              ["Cookie policy", "/cookies"],
              ["Terms of service", "/terms"],
              ["Refund policy", "/refunds"],
              ["Example report", "/scan/demo"],
              ["Public source repo", "https://github.com/IntrepidHQ/WebsiteCreditScore"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}
              >
                {label} →
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl p-6" style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            Improvement log
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            WebsiteCreditScore is also used on itself. After a low self-scan exposed missing public proof, the site
            added a cookie consent flow, production cookie policy, robots.txt, sitemap.xml, structured data, operator
            proof, clearer support contact, a refund page, security.txt, and a stronger scanner prompt that inspects
            the live homepage before scoring design and UX.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
