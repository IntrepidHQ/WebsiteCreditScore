import { NextResponse } from "next/server";

import { isDemoWorkspaceAllowed } from "@/lib/auth/demo-flag";
import { DEMO_SESSION_COOKIE, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const GET = async (request: Request) => {
  const url = new URL(request.url);

  if (hasSupabaseEnv() && !isDemoWorkspaceAllowed()) {
    return NextResponse.redirect(new URL("/app/login", url));
  }

  const next = sanitizeInternalNextPath(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, url));

  response.cookies.set(DEMO_SESSION_COOKIE, "owner", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
};
