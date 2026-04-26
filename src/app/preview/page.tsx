import { ReportContent } from "@/app/scan/[id]/live-report";
import fixture from "@/lib/fixtures/wcs-mock.json";
import type { WCSReport } from "@/lib/schema";

export default function PreviewPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-mono text-sm font-semibold tracking-tight text-white">
          WebsiteCreditScore
        </a>
        <span className="text-xs text-zinc-600 font-mono">preview · mock data</span>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ReportContent report={fixture as WCSReport} />
      </div>
    </div>
  );
}
