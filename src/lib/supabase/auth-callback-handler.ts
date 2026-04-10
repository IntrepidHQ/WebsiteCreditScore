import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

/** Matches GoTrue `EmailOtpType` (declared in `@supabase/auth-js`, not a direct dependency). */
type EmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

const parseEmailOtpType = (raw: string): EmailOtpType | null => {
  return (EMAIL_OTP_TYPES as readonly string[]).includes(raw) ? (raw as EmailOtpType) : null;
};

/**
 * Shared handler for GET `/auth/callback` and `/auth/confirm`.
 * Email links must land here with either `?code=` (PKCE) or `?token_hash=&type=`
 * (`signup`, `magiclink`, `recovery`, `email`, etc.).
 */
export const handleSupabaseAuthCallback = async (request: Request): Promise<NextResponse> => {
  const url = new URL(request.url);
  const next = sanitizeInternalNextPath(url.searchParams.get("next"));

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login", url));
  }

  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    const description = url.searchParams.get("error_description") ?? "";
    console.error("[wcs-auth-callback] URL error param:", oauthError, description.slice(0, 200));
    return NextResponse.redirect(new URL(`/app/login?error=callback-failed`, url));
  }

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);

  let sessionError: { message: string } | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) sessionError = error;
  } else if (tokenHash && typeRaw) {
    const otpType = parseEmailOtpType(typeRaw);
    if (!otpType) {
      console.error("[wcs-auth-callback] invalid email OTP type", typeRaw);
      return NextResponse.redirect(new URL("/app/login?error=callback-failed", url));
    }
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) sessionError = error;
  } else {
    console.error("[wcs-auth-callback] missing code/token_hash", {
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      type: typeRaw,
      path: url.pathname,
    });
    return NextResponse.redirect(new URL("/app/login?error=missing-code", url));
  }

  if (sessionError) {
    console.error("[wcs-auth-callback] session error:", sessionError.message);
    return NextResponse.redirect(new URL("/app/login?error=callback-failed", url));
  }

  const redirectTarget = new URL(next, url.origin);
  const response = applyCookiesToResponse(NextResponse.redirect(redirectTarget));

  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
};
