import type { Metadata } from "next";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Cookie Policy — WebsiteCreditScore",
  description:
    "Cookie policy for WebsiteCreditScore.com, including necessary checkout cookies, credit recovery cookies, Stripe cookies, and optional analytics.",
};

const rows = [
  {
    name: "wcs_wallet_id",
    purpose: "Stores your credit wallet so purchased scan credits can be used on this device.",
    duration: "1 year",
    setBy: "WebsiteCreditScore",
    category: "Strictly necessary",
  },
  {
    name: "wcs_cookie_consent",
    purpose: "Remembers whether you accepted optional analytics or chose necessary cookies only.",
    duration: "Until browser storage is cleared",
    setBy: "WebsiteCreditScore",
    category: "Strictly necessary",
  },
  {
    name: "__stripe_mid / __stripe_sid",
    purpose: "Fraud prevention and secure checkout session handling when you buy scans.",
    duration: "30 minutes to 1 year",
    setBy: "Stripe",
    category: "Strictly necessary for checkout",
  },
  {
    name: "Vercel Analytics",
    purpose: "Aggregate page view and performance analytics. Loaded only if you accept analytics.",
    duration: "No advertising profile; aggregate analytics only",
    setBy: "Vercel",
    category: "Optional analytics",
  },
];

export default function CookiesPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />
      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
            Legal
          </p>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--theme-foreground)", lineHeight: 1 }}
          >
            Cookie Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Last updated: May 15, 2026
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            WebsiteCreditScore.com uses a small number of cookies and browser-storage values to keep checkout,
            scan credits, and consent preferences working. We do not use advertising cookies, retargeting pixels,
            or cross-site tracking.
          </p>
        </div>

        <section className="mt-10 space-y-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            Cookies and storage we use
          </h2>
          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--theme-border)" }}>
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead style={{ backgroundColor: "var(--theme-panel)", color: "var(--theme-foreground)" }}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Set by</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} style={{ borderTop: "1px solid var(--theme-border)" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--theme-foreground)" }}>{row.name}</td>
                    <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{row.purpose}</td>
                    <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{row.duration}</td>
                    <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{row.setBy}</td>
                    <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{row.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            Managing consent
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            The cookie banner lets you choose “Necessary only” or “Accept analytics.” Necessary cookies support
            checkout, purchased credits, and your consent preference. Optional analytics are not loaded unless you
            accept them. You can reset your choice by clearing this site’s browser data.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            Contact
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Questions about cookies or privacy can be sent to{" "}
            <a href="mailto:websitecreditscore@gmail.com" className="underline underline-offset-2" style={{ color: "var(--theme-accent)" }}>
              websitecreditscore@gmail.com
            </a>
            .
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
