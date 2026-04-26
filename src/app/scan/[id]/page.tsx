import { notFound } from "next/navigation";
import { getScan } from "@/lib/db/scans";
import { LiveReport } from "./live-report";
import type { WCSReport } from "@/lib/schema";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ScanPage({ params }: Props) {
  const { id } = await params;
  const scan = await getScan(id);

  if (!scan) notFound();

  if (!scan.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <div className="w-12 h-12 rounded-full border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center mx-auto">
            <span className="text-yellow-400 text-xl">⏳</span>
          </div>
          <h1 className="font-semibold text-white">Payment Pending</h1>
          <p className="text-sm text-zinc-400">
            Your payment is being confirmed. This page will automatically
            refresh once payment is complete.
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

  return (
    <LiveReport
      scanId={id}
      domain={scan.domain}
      initialStatus={scan.status}
      initialResult={scan.result as WCSReport | null}
    />
  );
}
