import { NextRequest, NextResponse } from "next/server";
import { getScan, setScanPublicExample } from "@/lib/db/scans";

/**
 * Operator-only curation for marketing examples. This is deliberately separate
 * from checkout and report access: a paid customer scan stays private unless an
 * operator explicitly publishes it with the configured comp code.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  let body: { compCode?: unknown; isPublicExample?: unknown };
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

  await setScanPublicExample(id, body.isPublicExample);
  return NextResponse.json({ id, isPublicExample: body.isPublicExample });
}
