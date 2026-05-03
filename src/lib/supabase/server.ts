import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Admin client — uses the service role key via @supabase/supabase-js directly.
 * This properly sets Authorization: Bearer <service_role_jwt> on every request,
 * which bypasses RLS. Use this for all server-side DB reads and writes.
 *
 * Do NOT use createServerClient (from @supabase/ssr) for admin operations —
 * it is designed for cookie-based user auth and can override the service role
 * JWT with a user session from cookies, causing RLS to block writes.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Cookie-aware client for user-facing auth flows (login, session refresh).
 * Not used for DB operations — use createClient() instead.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — cookie writes are ignored
          }
        },
      },
    }
  );
}
