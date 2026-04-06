import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv } from "@/lib/supabase/config";

const getAllCookiesFromRequest = (request: Request) => {
  const withCookies = request as Request & {
    cookies?: { getAll: () => { name: string; value: string }[] };
  };
  if (typeof withCookies.cookies?.getAll === "function") {
    return withCookies.cookies.getAll();
  }
  return parseCookieHeader(request.headers.get("cookie") ?? "")
    .filter((row): row is { name: string; value: string } => row.value !== undefined);
};

/**
 * Supabase client for route handlers where session cookies must be written to a
 * specific NextResponse (e.g. OAuth callback redirect).
 */
export const createSupabaseRouteHandlerClient = (request: Request, response: NextResponse) => {
  const { url, anonKey } = getSupabaseEnv();
  const defaults = getSupabaseCookieOptions(request);

  return createServerClient(url, anonKey, {
    cookieOptions: defaults,
    cookies: {
      getAll() {
        return getAllCookiesFromRequest(request);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, { ...defaults, ...options });
        });
      },
    },
  });
};

/**
 * OAuth / OTP routes: redirect URL is unknown until after auth.* call; collect
 * Set-Cookie operations and apply them to the final redirect response.
 */
export const createSupabaseOAuthRouteClient = (request: Request) => {
  const { url, anonKey } = getSupabaseEnv();
  const pending: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: getSupabaseCookieOptions(request),
    cookies: {
      getAll() {
        return getAllCookiesFromRequest(request);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pending.push({ name, value, options });
        });
      },
    },
  });

  const applyCookiesToResponse = (res: NextResponse) => {
    const defaults = getSupabaseCookieOptions(request);
    pending.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, { ...defaults, ...options });
    });
    return res;
  };

  return { supabase, applyCookiesToResponse };
};
