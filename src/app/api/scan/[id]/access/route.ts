import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/db/scans";
import { scanAccessCookieName, verifyScanAccess } from "@/lib/scan-access";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");
  const scan = await getScan(id);
  if (!scan || !(await verifyScanAccess(id, token))) {
    return NextResponse.json({ error: "Invalid or expired scan access link." }, { status: 403 });
  }
  const res = NextResponse.redirect(new URL(`/scan/${id}`, req.url));
  res.cookies.set(scanAccessCookieName(id), token!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
