import { NextRequest, NextResponse } from "next/server";
import { getScan, setScanPublicExample } from "@/lib/db/scans";
import { highRiskFlags } from "@/lib/publication-policy";
import type { WCSReport } from "@/lib/schema";

/**
 * Operator-only editorial curation for marketing examples. This is deliberately
 * separate from access: paid reports stay private and free reports stay public.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  let body: { compCode?: unknown; isPublicExample?: unknown; reviewedHighRiskClaims?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!process.env.WCS_COMP_CODE || body.compCode !== process.env.WCS_COMP_CODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (typeof body.isPublicExample !== "boolean") {
    return NextResponse.json({ error: "isPublicExample must be a boolean" }, { status: 400 });
  }

  const scan = await getScan(id);
  if (!scan) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (scan.status !== "done") {
    return NextResponse.json({ error: "Only completed scans can be curated" }, { status: 409 });
  }

  const risky = highRiskFlags(scan.result as WCSReport);
  if (body.isPublicExample === true && risky.length > 0 && body.reviewedHighRiskClaims !== true) {
    return NextResponse.json(
      {
        error: "This report contains high-risk claims and requires explicit review before publication.",
        requiresHighRiskReview: true,
        flags: risky.map(({ title, severity }) => ({ title, severity })),
      },
      { status: 409 },
    );
  }

  await setScanPublicExample(id, body.isPublicExample);
  return NextResponse.json({ id, isPublicExample: body.isPublicExample });
}
