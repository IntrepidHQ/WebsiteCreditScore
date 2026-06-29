import { NextRequest, NextResponse } from "next/server";
import { getFreeScanClaim, normalizeEmail } from "@/lib/db/free-scan-claims";
import { createAuthClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!email || !token) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
  }

  const existing = await getFreeScanClaim(email);
  if (existing) {
    return NextResponse.json(
      { error: "Free scan already claimed", reason: "claimed", scanId: existing.scan_id },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, email });
}
