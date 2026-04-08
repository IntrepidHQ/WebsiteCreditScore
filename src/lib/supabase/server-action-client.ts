import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { mergeCookieHeaderWithStore } from "@/lib/supabase/merge-request-cookies";

/**
 * Supabase client for Server Actions: merges the inbound `Cookie` header with `cookies()`
 * so `getUser()` matches Route Handler behavior (avoids missing `sb-*` chunks on some POSTs).
 */
export const createSupabaseServerClientForServerAction = async () => {
  const cookieStore = await cookies();
  const headerList = await headers();
  const cookieHeader = headerList.get("cookie");
  const merged = mergeCookieHeaderWithStore(cookieHeader, cookieStore.getAll());
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return merged;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value ?? "", options);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
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
};
