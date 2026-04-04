import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/config";

/**
 * Supabase client for route handlers where session cookies must be written to a
 * specific NextResponse (e.g. OAuth callback redirect).
 */
export const createSupabaseRouteHandlerClient = (request: Request, response: NextResponse) => {
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("cookie") ?? "")
          .filter((row): row is { name: string; value: string } => row.value !== undefined);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
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
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("cookie") ?? "")
          .filter((row): row is { name: string; value: string } => row.value !== undefined);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pending.push({ name, value, options });
        });
      },
    },
  });

  const applyCookiesToResponse = (res: NextResponse) => {
    pending.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  };

  return { supabase, applyCookiesToResponse };
};
