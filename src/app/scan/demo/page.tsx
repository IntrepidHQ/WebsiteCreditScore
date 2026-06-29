import Link from "next/link";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { ReportContent } from "@/app/scan/[id]/live-report";
import { buildDepthMockReport } from "@/lib/fixtures/depth-mock";
import type { ScanDepthKey } from "@/lib/scan-depth";
import { SCAN_DEPTH_PROFILES } from "@/lib/scan-depth";

const DEPTHS: ScanDepthKey[] = ["aerial", "surface", "deep", "trench", "mantle", "core"];

export default async function ScanDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ depth?: string }>;
}) {
  const sp = await searchParams;
  const depth = DEPTHS.includes(sp.depth as ScanDepthKey) ? (sp.depth as ScanDepthKey) : "aerial";
  const enabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_SCAN_DEMOS === "true";
  if (!enabled) notFound();

  const report = buildDepthMockReport(depth);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />
      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
                Mock scan preview
              </p>
              <h1 className="mt-1 font-display text-3xl" style={{ color: "var(--theme-foreground)" }}>
                Apple demo · {SCAN_DEPTH_PROFILES[depth].label}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEPTHS.map((id) => (
                <Link
                  key={id}
                  href={`/scan/demo?depth=${id}`}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-85"
                  style={{
                    borderColor: id === depth ? "var(--theme-accent)" : "var(--theme-border)",
                    backgroundColor: id === depth ? "var(--theme-accent)" : "transparent",
                    color: id === depth ? "var(--theme-accent-foreground)" : "var(--theme-muted)",
                  }}
                >
                  {SCAN_DEPTH_PROFILES[id].label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="pb-12">
        <ReportContent report={report} depth={depth} />
      </div>
      <SiteFooter />
    </main>
  );
}
