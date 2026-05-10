import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getScan } from "@/lib/db/scans";
import { triggerStrategyPresentation, slugFromDomain } from "@/lib/sp-webhook";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { scanId?: string; tier?: "standard" | "nonprofit"; clientName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.scanId) {
    return NextResponse.json({ error: "scanId required" }, { status: 400 });
  }

  const scan = await getScan(body.scanId);
  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  if (scan.status !== "done" || !scan.result) {
    return NextResponse.json({ error: "Scan is not complete" }, { status: 409 });
  }
  if (scan.result.error) {
    return NextResponse.json({ error: "Scan ended in error" }, { status: 409 });
  }

  const tier = body.tier ?? "standard";
  const slug = slugFromDomain(scan.domain);
  const clientName = body.clientName ?? scan.result.company_name ?? scan.domain;

  const result = await triggerStrategyPresentation({
    wcsReport: scan.result,
    clientName,
    clientSlug: slug,
    tier,
    sourceScanId: scan.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    strategyId: result.strategyId,
    isNew: result.isNew,
    studioUrl: `http://localhost:3001/studio/${result.strategyId}`,
  });
}
