import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-client";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const next = sanitizeInternalNextPath(url.searchParams.get("next"), "/app");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login", url));
  }

  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/app/login?error=missing-code", url));
  }

  const redirectTarget = new URL(next, url.origin);
  const response = NextResponse.redirect(redirectTarget);
  const supabase = createSupabaseRouteHandlerClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/app/login?error=callback-failed", url));
  }

  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
};
