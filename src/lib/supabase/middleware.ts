import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

/**
 * Refreshes the Supabase session and forwards updated auth cookies on the response.
 * See https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export const updateSupabaseSession = async (request: NextRequest) => {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser() validates the session and triggers a token refresh if needed.
  // The refreshed tokens are written back via setAll above.
  await supabase.auth.getUser();

  return supabaseResponse;
};
