import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const next = sanitizeInternalNextPath(url.searchParams.get("next"), "/app");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login", url));
  }

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "recovery" | "email" | "signup" | null;

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);

  let authError: string | null = null;

  if (tokenHash && type) {
    // Password reset and email confirmation arrive as token_hash links
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) authError = "callback-failed";
  } else if (code) {
    // OAuth / PKCE magic-link flow
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) authError = "callback-failed";
  } else {
    authError = "missing-code";
  }

  if (authError) {
    return NextResponse.redirect(new URL(`/app/login?error=${authError}`, url));
  }

  const redirectTarget = new URL(next, url.origin);
  const response = applyCookiesToResponse(NextResponse.redirect(redirectTarget));

  // Clear any demo session cookie on real auth
  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
};
