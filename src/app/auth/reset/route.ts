import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login?error=supabase-not-configured", url));
  }

  if (!email) {
    return NextResponse.redirect(new URL("/app/login?mode=reset&error=missing-email", url));
  }

  const supabase = await createSupabaseServerClient();
  // Always redirects to callback which logs user in, then they can set a new password
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${url.origin}/auth/callback?next=/app`,
  });

  // Always show success — never reveal whether the email exists
  return NextResponse.redirect(new URL("/app/login?sent=reset", url));
}
