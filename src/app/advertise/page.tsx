import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BrainCircuit, Clock3, Gavel, ShieldCheck } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Advertise with WebsiteCreditScore",
  description: "Apply for reviewed sponsorship placements in WebsiteCreditScore scan experiences.",
};

const placements = [
  { name: "Scan Intermission", detail: "A 30-second, skippable sponsor story while a report assembles.", audience: "Active scanners" },
  { name: "Rewarded Unlock", detail: "An opt-in 30-second sponsor preview that funds a public Aerial scan.", audience: "High-intent visitors" },
  { name: "Public Index", detail: "A quiet sponsor placement beside selected public score reports.", audience: "Researchers & buyers" },
];

export default function AdvertisePage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />
      <article className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>WCS sponsor inventory</p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)] lg:items-end">
          <div>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.92] sm:text-7xl" style={{ color: "var(--theme-foreground)" }}>
              Put a useful offer inside the moment a buyer is paying attention.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: "var(--theme-muted)" }}>
              WebsiteCreditScore is building a small, reviewed sponsor marketplace for tools that help businesses become more credible, capable, or visible. We will not fill reports with irrelevant ad-tech inventory.
            </p>
          </div>
          <div className="border p-6" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-panel)", borderRadius: 8 }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--theme-accent)" }}>Launch round</p>
            <p className="mt-3 font-display text-3xl leading-none" style={{ color: "var(--theme-foreground)" }}>One founding sponsor</p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>Brainztem is the first test partner. Future sponsors apply, are reviewed, and receive a proposed placement rather than buying their way into a report.</p>
            <a href="mailto:websitecreditscore@gmail.com?subject=WCS%20sponsor%20application" className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-bold" style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}>Apply to advertise <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </div>

        <section className="mt-20" aria-labelledby="inventory-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-accent)" }}>The inventory</p><h2 id="inventory-heading" className="mt-2 font-display text-4xl" style={{ color: "var(--theme-foreground)" }}>Small by design. Visible by context.</h2></div>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>The MacBook-lid auction works because every placement is finite and legible. WCS uses the same principle: named surfaces, clear context, no opaque auction mechanics.</p>
          </div>
          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {placements.map((placement, index) => <section key={placement.name} className="border p-5" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-panel)", borderRadius: 8 }}><span className="font-score text-3xl" style={{ color: "var(--theme-accent)" }}>0{index + 1}</span><h3 className="mt-8 text-lg font-semibold" style={{ color: "var(--theme-foreground)" }}>{placement.name}</h3><p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{placement.detail}</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "var(--theme-accent)" }}>{placement.audience}</p></section>)}
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          <div className="border p-5" style={{ borderColor: "var(--theme-border)", borderRadius: 8 }}><BadgeCheck className="h-5 w-5" style={{ color: "#82e2be" }} /><h2 className="mt-4 font-semibold" style={{ color: "var(--theme-foreground)" }}>Reviewed relevance</h2><p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>We accept products that make sense beside a credibility or operating-system decision.</p></div>
          <div className="border p-5" style={{ borderColor: "var(--theme-border)", borderRadius: 8 }}><Clock3 className="h-5 w-5" style={{ color: "var(--theme-accent)" }} /><h2 className="mt-4 font-semibold" style={{ color: "var(--theme-foreground)" }}>Bounded attention</h2><p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>Intermissions are skippable after 10 seconds and never exceed 30 seconds.</p></div>
          <div className="border p-5" style={{ borderColor: "var(--theme-border)", borderRadius: 8 }}><ShieldCheck className="h-5 w-5" style={{ color: "#7dd3fc" }} /><h2 className="mt-4 font-semibold" style={{ color: "var(--theme-foreground)" }}>No data brokerage</h2><p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>Placement is contextual. We do not sell scan data, build ad profiles, or let a sponsor influence a score.</p></div>
        </section>

        <div className="mt-20 border p-7 text-center" style={{ borderColor: "var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 72%, transparent)", borderRadius: 8 }}>
          <BrainCircuit className="mx-auto h-7 w-7" style={{ color: "var(--theme-accent)" }} />
          <h2 className="mt-4 font-display text-3xl" style={{ color: "var(--theme-foreground)" }}>Want to sponsor a scan?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>Tell us what you sell, who it helps, and which WCS surface fits. We will research the offer before responding with availability and terms.</p>
          <a href="mailto:websitecreditscore@gmail.com?subject=WCS%20sponsor%20application" className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--theme-accent)" }}>Start an application <Gavel className="h-4 w-4" /></a>
          <p className="mt-6 text-xs" style={{ color: "var(--theme-muted)" }}>Looking for a report instead? <Link href="/" className="font-semibold" style={{ color: "var(--theme-accent)" }}>Run a scan.</Link></p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
