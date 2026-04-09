import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { mergeCookieHeaderWithStore } from "@/lib/supabase/merge-request-cookies";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const cookieHeader = headerList.get("cookie");
  const { url, anonKey } = getSupabaseEnv();

  const forwardedHost = headerList.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headerList.get("host");
  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";
  const cookieOptions =
    host && process.env.NODE_ENV === "production"
      ? getSupabaseCookieOptions(new Request(`${proto}://${host}/`))
      : getSupabaseCookieOptions();

  return createServerClient(url, anonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return mergeCookieHeaderWithStore(cookieHeader, cookieStore.getAll());
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            // Server Components cannot set cookies; middleware refreshes there.
            // Server Actions / Route Handlers must not swallow real failures.
            if (
              /Cookies can only be modified in a Server Action or Route Handler/i.test(
                message,
              ) ||
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
