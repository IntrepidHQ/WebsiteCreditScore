import type { ReactNode } from "react";
import { getScan } from "@/lib/db/scans";
import { LiveReport } from "./live-report";
import type { WCSReport } from "@/lib/schema";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { verifyAndUpsertPaidScanFromSession } from "@/lib/verify-scan-payment";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createScanOwnerToken, scanAccessCookieName, scanRequiresAccess, verifyScanAccess } from "@/lib/scan-access";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string; source?: string; access_token?: string }>;
}

export const dynamic = "force-dynamic";

export default async function ScanPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { session_id, access_token } = await searchParams;
  let scan = await getScan(id);

  // Self-heal: on the Stripe return the row may not exist yet (webhook slow or
  // misconfigured). If Stripe confirms this session paid for this scan, create
  // it right here so the user never gets stuck waiting on the webhook.
  if ((!scan || !scan.paid) && session_id) {
    const ok = await verifyAndUpsertPaidScanFromSession(session_id, id);
    if (ok) scan = await getScan(id);
  }

  // Exchange bearer links for an HttpOnly cookie, then remove the token from
  // the address bar and browser history.
  if (scan && access_token) {
    redirect(`/api/scan/${id}/access?token=${encodeURIComponent(access_token)}`);
  }

  if (scan && scanRequiresAccess(scan)) {
    const jar = await cookies();
    const ownerToken = jar.get(scanAccessCookieName(id))?.value;
    const hasAccess = await verifyScanAccess(id, ownerToken);
    if (!hasAccess && session_id && scan.paid) {
      const token = await createScanOwnerToken(id);
      redirect(`/api/scan/${id}/access?token=${encodeURIComponent(token)}`);
    }
    if (!hasAccess) {
      return (
        <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
          <NavBar />
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-md space-y-3 text-center">
              <h1 className="font-semibold" style={{ color: "var(--theme-foreground)" }}>Private scan</h1>
              <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
                This report is private. Open the owner link or a valid share link to continue.
              </p>
            </div>
          </div>
          <SiteFooter />
        </main>
      );
    }
  }

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

  // Stripe redirect can land here before the webhook marks the scan paid.
  if (!scan.paid) {
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
            Verifying Payment
          </h1>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
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
