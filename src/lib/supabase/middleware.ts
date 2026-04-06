import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

const buildRequestCookieHeader = (jar: Map<string, string>): string | null => {
  if (jar.size === 0) {
    return null;
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
};

/**
 * Refreshes the Supabase session and forwards updated auth cookies on the response.
 * Uses an in-memory cookie jar for getAll/setAll so refreshed tokens are injected into
 * the outgoing `Cookie` request header. That way Server Components and Route Handlers
 * in the same request see the same session the middleware just refreshed (avoids
 * "Auth session missing" / refresh races when request.cookies is read-only).
 *
 * @see https://github.com/supabase/supabase/issues/26400
 */
export const updateSupabaseSession = async (request: NextRequest) => {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();
  const cookieOpts = getSupabaseCookieOptions(request);

  const cookieJar = new Map<string, string>(
    request.cookies.getAll().map((row) => [row.name, row.value]),
  );

  const middlewareResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: cookieOpts,
    cookies: {
      getAll() {
        return [...cookieJar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (value) {
            cookieJar.set(name, value);
          } else {
            cookieJar.delete(name);
          }
          middlewareResponse.cookies.set(name, value ?? "", {
            ...cookieOpts,
            ...options,
          });
          try {
            request.cookies.set(name, value);
          } catch {
            // Request cookies can be read-only in some runtimes; header override below covers it.
          }
        });
      },
    },
  });

  await supabase.auth.getUser();

  const requestHeaders = new Headers(request.headers);
  const cookieHeader = buildRequestCookieHeader(cookieJar);
  if (cookieHeader) {
    requestHeaders.set("cookie", cookieHeader);
  } else {
    requestHeaders.delete("cookie");
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const c of middlewareResponse.cookies.getAll()) {
    response.cookies.set(c);
  }

  return response;
};
