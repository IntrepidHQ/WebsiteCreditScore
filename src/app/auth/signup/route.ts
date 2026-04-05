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
    return NextResponse.redirect(
      new URL("/app/login?mode=signup&error=missing-credentials", url),
    );
  }

  if (password.length < 8) {
    return NextResponse.redirect(
      new URL(
        `/app/login?mode=signup&error=password-too-short&email=${encodeURIComponent(email)}`,
        url,
      ),
    );
  }

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    const code = msg.includes("already registered") || msg.includes("already exists")
      ? "already-registered"
      : "sign-up-failed";
    return NextResponse.redirect(
      new URL(
        `/app/login?mode=signup&error=${code}&email=${encodeURIComponent(email)}`,
        url,
      ),
    );
  }

  // Supabase email-enumeration protection: returns success with identities:[]
  // when the email is already registered rather than surfacing an error.
  // Redirect to the sign-in tab so the user can log in directly.
  if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
    return NextResponse.redirect(
      new URL(
        `/app/login?error=already-registered&email=${encodeURIComponent(email)}`,
        url,
      ),
    );
  }

  return applyCookiesToResponse(
    NextResponse.redirect(
      new URL(`/app/login?sent=confirm&email=${encodeURIComponent(email)}`, url),
    ),
  );
}
