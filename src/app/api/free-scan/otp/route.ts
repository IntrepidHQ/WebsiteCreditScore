import { NextRequest, NextResponse } from "next/server";
import { getFreeScanClaim, normalizeEmail } from "@/lib/db/free-scan-claims";
import { isDisposableEmail } from "@/lib/disposable-email";
import { createAuthClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : null;

  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  // Free scans cost real research credits. Disposable mailboxes let one person
  // farm unlimited free scans, so reject them before sending an OTP.
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      {
        error: "Please use a permanent email address — disposable inboxes aren't eligible for the free scan.",
        reason: "disposable_email",
      },
      { status: 400 }
    );
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
