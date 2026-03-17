import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/app").trim() || "/app";

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(
      new URL("/app/login?error=supabase-not-configured", url),
    );
  }

  if (!email) {
    return NextResponse.redirect(new URL("/app/login?error=missing-email", url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return NextResponse.redirect(new URL("/app/login?error=send-failed", url));
  }

  return NextResponse.redirect(new URL("/app/login?sent=1", url));
}
