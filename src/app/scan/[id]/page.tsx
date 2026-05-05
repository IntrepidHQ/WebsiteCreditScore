import type { ReactNode } from "react";
import { getScan } from "@/lib/db/scans";
import { LiveReport } from "./live-report";
import type { WCSReport } from "@/lib/schema";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ScanPage({ params }: Props) {
  const { id } = await params;
  const scan = await getScan(id);

  const shell = (inner: ReactNode) => (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />
      <div className="flex flex-1 flex-col">{inner}</div>
      <SiteFooter />
    </main>
  );

  if (!scan) {
    return shell(
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <div
            className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto"
            style={{ borderColor: "#f7b21b44", backgroundColor: "#f7b21b11" }}
          >
            <span style={{ color: "#f7b21b" }} className="text-xl">
              ⏳
            </span>
          </div>
          <h1 className="font-semibold" style={{ color: "var(--theme-foreground)" }}>
            Scan Starting
          </h1>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Your scan is being initialized. This page will refresh automatically.
          </p>
          <script
            dangerouslySetInnerHTML={{
              __html: `setTimeout(() => window.location.reload(), 3000)`,
            }}
          />
        </div>
      </div>
    );
  }

  return shell(
    <div className="w-full flex-1">
      <LiveReport
        scanId={id}
        domain={scan.domain}
        initialStatus={scan.status}
        initialResult={scan.result as WCSReport | null}
      />
    </div>
  );
}
