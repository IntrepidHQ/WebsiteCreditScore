import { ReportContent } from "@/app/scan/[id]/live-report";
import fixture from "@/lib/fixtures/wcs-mock.json";
import type { WCSReport } from "@/lib/schema";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function PreviewPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-xs" style={{ color: "var(--theme-muted)" }}>
          Preview · mock data — same layout as a live report
        </p>
        <ReportContent report={fixture as WCSReport} />
      </div>
      <SiteFooter />
    </main>
  );
}
