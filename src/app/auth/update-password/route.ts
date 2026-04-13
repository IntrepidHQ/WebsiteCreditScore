import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login?error=supabase-not-configured", url));
  }

  if (!password || password.length < 8) {
    return NextResponse.redirect(
      new URL("/app/update-password?error=password-too-short", url),
    );
  }

  if (password !== confirm) {
    return NextResponse.redirect(
      new URL("/app/update-password?error=passwords-do-not-match", url),
    );
  }

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.redirect(
      new URL("/app/update-password?error=update-failed", url),
    );
  }

  return applyCookiesToResponse(NextResponse.redirect(new URL("/app", url)));
}
