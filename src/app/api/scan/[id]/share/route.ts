import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/db/scans";
import { createScanAccessToken, revokeScanShareToken, scanAccessCookieName, verifyScanAccess } from "@/lib/scan-access";

export const runtime = "nodejs";

async function owner(req: NextRequest, id: string) {
  const token = req.cookies.get(scanAccessCookieName(id))?.value;
  return verifyScanAccess(id, token, "owner");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await getScan(id);
  if (!scan || !(await owner(req, id))) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await req.json().catch(() => ({})) as { label?: unknown };
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const share = await createScanAccessToken(id, "share", {
    label: typeof body.label === "string" ? body.label.slice(0, 80) : "share link",
    expiresAt,
  });
  const url = new URL(`/scan/${id}`, req.url);
  url.searchParams.set("access_token", share.token);
  return NextResponse.json({ shareUrl: url.toString(), tokenId: share.id, expiresAt });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await owner(req, id))) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = await req.json().catch(() => ({})) as { tokenId?: unknown };
  if (typeof body.tokenId !== "string") return NextResponse.json({ error: "tokenId is required." }, { status: 400 });
  await revokeScanShareToken(id, body.tokenId);
  return NextResponse.json({ ok: true });
}
