import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { mergeCookieStoreThenRequestHeader } from "@/lib/supabase/merge-request-cookies-prefer-header";

/**
 * Supabase browser for **Route Handlers** (`POST`/`GET` with a `Request`).
 * Prefer the incoming `Cookie` header over `cookies().getAll()` so `fetch("/api/...")`
 * sessions match what Server Components see.
 */
export async function createSupabaseServerClientForRoute(request: Request) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const { url, anonKey } = getSupabaseEnv();

  const forwardedHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || headerList.get("host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";
  const cookieOptions =
    host && process.env.NODE_ENV === "production"
      ? getSupabaseCookieOptions(new Request(`${proto}://${host}/`))
      : getSupabaseCookieOptions();

  const requestCookieHeader = request.headers.get("cookie");

  return createServerClient(url, anonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return mergeCookieStoreThenRequestHeader(cookieStore.getAll(), requestCookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (
              /Cookies can only be modified in a Server Action or Route Handler/i.test(message) ||
              /Dynamic server usage/i.test(message)
            ) {
              return;
            }
            throw err;
          }
        });
      },
    },
  });
}
