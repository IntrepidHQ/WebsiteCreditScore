import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/db/scans";
import { isAdminRequest } from "@/lib/admin/auth";
import { deriveClientSlug, signAndPostToSP, spWebhookConfigured, type SPTier } from "@/lib/sp-webhook";
import type { WCSReport } from "@/lib/schema";

export const runtime = "nodejs";

/**
 * Admin-only: push a completed WCS scan into StrategyPresentation Studio.
 *
 * POST /api/sp/handoff  { scanId, clientName?, tier?, gatePassword? }
 *
 * Gated behind the same admin auth as /admin so a random visitor can't
 * fan WCS scans into the SP pipeline.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!spWebhookConfigured()) {
    return NextResponse.json(
      { error: "SP_WEBHOOK_SECRET is not configured on this deployment" },
      { status: 503 }
    );
  }

  let body: { scanId?: unknown; clientName?: unknown; tier?: unknown; gatePassword?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const scanId = typeof body.scanId === "string" ? body.scanId : null;
  if (!scanId) {
    return NextResponse.json({ error: "scanId is required" }, { status: 400 });
  }

  const scan = await getScan(scanId);
  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  if (scan.status !== "done" || !scan.result) {
    return NextResponse.json(
      { error: "Scan is not complete — only finished scans can be handed off" },
      { status: 409 }
    );
  }

  const report = scan.result as WCSReport;
  const clientName =
    typeof body.clientName === "string" && body.clientName.trim()
      ? body.clientName.trim()
      : report.company_name || scan.domain;
  const tier: SPTier = body.tier === "nonprofit" ? "nonprofit" : "standard";
  const gatePassword =
    typeof body.gatePassword === "string" && body.gatePassword.trim()
      ? body.gatePassword.trim()
      : undefined;

  const result = await signAndPostToSP({
    wcsReport: report,
    clientName,
    clientSlug: deriveClientSlug(scan.domain),
    tier,
    gatePassword,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "SP handoff failed", httpStatus: result.httpStatus },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    strategyId: result.strategyId,
    status: result.status,
    isNew: result.isNew,
    studioUrl: result.strategyId
      ? `https://studio.strategypresentation.com/studio/${result.strategyId}`
      : null,
  });
}
