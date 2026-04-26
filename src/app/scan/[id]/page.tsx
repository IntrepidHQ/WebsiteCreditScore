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

  // Scan not found yet — webhook may still be in flight after Stripe redirect
  if (!scan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <div
            className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto"
            style={{ borderColor: "#f7b21b44", backgroundColor: "#f7b21b11" }}
          >
            <span style={{ color: "#f7b21b" }} className="text-xl">⏳</span>
          </div>
          <h1 className="font-semibold">Verifying Payment</h1>
          <p className="text-sm" style={{ color: "var(--theme-muted, #98a6ba)" }}>
            Your payment is being confirmed. This page will refresh automatically.
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

  if (!scan.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-3">
          <div
            className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto"
            style={{ borderColor: "#f7b21b44", backgroundColor: "#f7b21b11" }}
          >
            <span style={{ color: "#f7b21b" }} className="text-xl">⏳</span>
          </div>
          <h1 className="font-semibold">Payment Pending</h1>
          <p className="text-sm" style={{ color: "var(--theme-muted, #98a6ba)" }}>
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
