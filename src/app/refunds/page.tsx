import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Refund Policy — WebsiteCreditScore",
  description:
    "Refund policy for WebsiteCreditScore.com scans, failed report generation, unused credits, and support contact.",
};

export default function RefundsPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
          Policy
        </p>
        <h1
          className="font-display mt-3"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--theme-foreground)", lineHeight: 1 }}
        >
          Refund Policy
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--theme-muted)" }}>
          Last updated: May 15, 2026
        </p>

        <div className="mt-10 space-y-8">
          {[
            {
              title: "Failed scans",
              body: "If a scan fails because of a server error, timeout, provider outage, or invalid AI response, we refund that scan automatically through Stripe within 5 business days.",
            },
            {
              title: "Completed reports",
              body: "Completed reports are not refunded by default because the live web searches and AI research have already run. If a report is clearly broken or attached to the wrong domain, email support and we will review it.",
            },
            {
              title: "Unused credits",
              body: "Unused bundle credits do not expire. If you lose browser cookies or switch devices, use the Restore credits page with the Stripe session ID from your receipt.",
            },
            {
              title: "Support contact",
              body: "For refund questions, send the scan URL or Stripe receipt to websitecreditscore@gmail.com. We respond as quickly as possible and use the report URL to locate the relevant scan.",
            },
          ].map((item) => (
            <section key={item.title} className="rounded-2xl p-5" style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
              <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{item.body}</p>
            </section>
          ))}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
