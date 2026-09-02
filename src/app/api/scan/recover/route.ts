import { NextRequest, NextResponse } from "next/server";
import { recoverStaleScanRuns } from "@/lib/db/scans";

export const runtime = "nodejs";

function authorized(req: NextRequest) {
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get("authorization") === `Bearer ${secret}`);
}

/** Recovery hook for a scheduler or operator. It only makes abandoned leased
 * scans retryable; it never starts another worker. */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const recovered = await recoverStaleScanRuns();
    return NextResponse.json({ ok: true, recovered });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Recovery failed" },
      { status: 500 },
    );
  }
}
