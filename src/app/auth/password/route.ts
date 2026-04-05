import { NextResponse } from "next/server";

import { sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeInternalNextPath(String(formData.get("next") ?? "/app"), "/app");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login?error=supabase-not-configured", url));
  }

  if (!email || !password) {
    return NextResponse.redirect(new URL("/app/login?error=missing-credentials", url));
  }

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const code = error.message.toLowerCase().includes("invalid")
      ? "invalid-credentials"
      : "sign-in-failed";
    return NextResponse.redirect(
      new URL(`/app/login?error=${code}&email=${encodeURIComponent(email)}`, url),
    );
  }

  return applyCookiesToResponse(NextResponse.redirect(new URL(next, url)));
}
