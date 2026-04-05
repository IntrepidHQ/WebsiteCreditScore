import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

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

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${url.origin}/auth/callback?next=/app`,
  });

  // Always show success — never reveal whether an account exists for this email
  return applyCookiesToResponse(NextResponse.redirect(new URL("/app/login?sent=reset", url)));
}
