import { NextResponse } from "next/server";

import { sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

export const POST = async (request: Request) => {
  const url = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const next = sanitizeInternalNextPath(String(formData.get("next") ?? "/app"), "/app");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(
      new URL("/app/login?error=supabase-not-configured", url),
    );
  }

  if (!email) {
    return NextResponse.redirect(new URL("/app/login?error=missing-email", url));
  }

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return applyCookiesToResponse(
      NextResponse.redirect(new URL("/app/login?error=send-failed", url)),
    );
  }

  return applyCookiesToResponse(NextResponse.redirect(new URL("/app/login?sent=1", url)));
};
