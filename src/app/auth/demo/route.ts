import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/app";
  const response = NextResponse.redirect(new URL(next, url));

  response.cookies.set(DEMO_SESSION_COOKIE, "owner", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
