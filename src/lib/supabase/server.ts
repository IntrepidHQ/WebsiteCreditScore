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

  return createServerClient(url, anonKey, {
    cookieOptions: getSupabaseCookieOptions(),
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
