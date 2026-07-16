import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/db/scans";

// GET /api/scan/{id}
// Public, read-only view of a scan's status + report. This lets sister
// products (StrategyPresentation) resolve a scan over HTTP without sharing
// WCS's database — WCS answers from whichever Supabase project it is
// configured for, so the caller always sees the real, current data.
// Only the report payload is exposed (already public on /scan/{id}); no
// wallet, IP, or session data.
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "cache-control": "no-store",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400, headers: CORS });
  }
  const scan = await getScan(id);
  if (!scan) {
    return NextResponse.json({ error: "not found" }, { status: 404, headers: CORS });
  }
  return NextResponse.json(
    {
      id: scan.id,
      domain: scan.domain,
      status: scan.status,
      result: scan.status === "done" ? scan.result : null,
      completedAt: (scan as { completed_at?: string | null }).completed_at ?? scan.created_at ?? null,
    },
    { headers: CORS },
  );
}
