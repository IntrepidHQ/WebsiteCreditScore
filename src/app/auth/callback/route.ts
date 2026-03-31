import { NextResponse } from "next/server";

import { sanitizeInternalNextPath } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = sanitizeInternalNextPath(url.searchParams.get("next"), "/app");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login", url));
  }

  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/app/login?error=callback-failed", url));
    }
  } else {
    return NextResponse.redirect(new URL("/app/login?error=missing-code", url));
  }

  return NextResponse.redirect(new URL(next, url));
}
