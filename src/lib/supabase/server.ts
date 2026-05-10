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
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function getSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.STORAGE_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_STORAGE_SUPABASE_URL, SUPABASE_URL, or STORAGE_SUPABASE_URL.");
  }

  return url;
}

function getSupabaseSecretKey(): string {
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.STORAGE_SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Missing Supabase secret key. Set SUPABASE_SECRET_KEY, STORAGE_SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, or STORAGE_SUPABASE_SERVICE_ROLE_KEY.");
  }

  return key;
}

function getSupabasePublicKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.STORAGE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.STORAGE_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, or NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY."
    );
  }

  return key;
}

/**
 * Cookie-aware client for user-facing auth flows (login, session refresh).
 * Not used for DB operations — use createClient() instead.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublicKey(),
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
