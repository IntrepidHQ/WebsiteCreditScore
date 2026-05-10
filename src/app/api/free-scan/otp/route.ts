import { NextRequest, NextResponse } from "next/server";
import { getFreeScanClaim, normalizeEmail } from "@/lib/db/free-scan-claims";
import { createAuthClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : null;

  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const existing = await getFreeScanClaim(email);
  if (existing) {
    return NextResponse.json(
      { error: "Free scan already claimed", reason: "claimed", scanId: existing.scan_id },
      { status: 409 }
    );
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[free-scan/otp]", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
