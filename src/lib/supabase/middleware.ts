import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

/**
 * Refreshes the Supabase session and forwards updated auth cookies on the response.
 * Single `NextResponse.next({ request })` — do not rebuild the raw `Cookie` header manually;
 * that can break chunked `sb-*-auth-token` values and drop the session on the next hop.
 *
 * Marketing pages (`/`) and workspace (`/app/*`) share the same Supabase cookies (path `/`).
 * Workspace access is enforced in RSC via `requireWorkspaceSession()`, not by splitting cookies.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export const updateSupabaseSession = async (request: NextRequest) => {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();
  const cookieOpts = getSupabaseCookieOptions(request);

  const response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: cookieOpts,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value ?? "", { ...cookieOpts, ...options });
          try {
            request.cookies.set(name, value);
          } catch {
            // Read-only request cookies in some runtimes; Set-Cookie on `response` still persists for the client.
          }
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
};
