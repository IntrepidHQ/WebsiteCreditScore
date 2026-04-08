import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-client";

const buildLogoutResponse = async (request: Request) => {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url));

  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  if (hasSupabaseEnv()) {
    try {
      const supabase = createSupabaseRouteHandlerClient(request, response);
      await supabase.auth.signOut();
    } catch {
      // Without env or client creation, demo cookie clear still signs out local demo.
    }
  }

  return response;
};

export async function GET(request: Request) {
  return await buildLogoutResponse(request);
}

export async function POST(request: Request) {
  return await buildLogoutResponse(request);
}
