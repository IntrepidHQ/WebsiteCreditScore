import { NextResponse } from "next/server";

import { sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseOAuthRouteClient } from "@/lib/supabase/route-client";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const next = sanitizeInternalNextPath(url.searchParams.get("next"));

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/app/login?error=supabase-not-configured", url));
  }

  const { supabase, applyCookiesToResponse } = createSupabaseOAuthRouteClient(request);
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  const target = data.url ?? new URL("/app/login", url).toString();
  return applyCookiesToResponse(NextResponse.redirect(target));
};
