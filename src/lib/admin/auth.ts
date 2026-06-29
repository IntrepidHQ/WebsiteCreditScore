import "server-only";
import { cookies } from "next/headers";
import { createAuthClient } from "@/lib/supabase/server";

/**
 * Admin access gate.
 *
 * Two supported modes (checked in order):
 *
 * 1. Supabase session whose email is in ADMIN_EMAILS (comma-separated).
 *    This is the preferred model once admin OAuth is wired.
 * 2. A shared ADMIN_TOKEN presented as the `wcs_admin` cookie. This is the
 *    pragmatic fallback for a sessionless app: visit `/admin?token=...` once
 *    and the token is stored in an httpOnly cookie.
 *
 * If NEITHER env var is configured, access is denied (fail-closed) in
 * production. In development with no config, access is allowed so the dashboard
 * is inspectable locally.
 */

const ADMIN_COOKIE = "wcs_admin";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminRequest(searchToken?: string): Promise<boolean> {
  const emails = adminEmails();
  const token = process.env.ADMIN_TOKEN;

  // 1. Supabase session email allowlist.
  if (emails.length) {
    try {
      const auth = await createAuthClient();
      const { data } = await auth.auth.getUser();
      const email = data.user?.email?.toLowerCase();
      if (email && emails.includes(email)) return true;
    } catch {
      // fall through to token check
    }
  }

  // 2. Shared token (cookie or ?token= query param).
  if (token) {
    if (searchToken && searchToken === token) return true;
    const cookieStore = await cookies();
    if (cookieStore.get(ADMIN_COOKIE)?.value === token) return true;
  }

  // 3. Fail-closed in prod, open in local dev when nothing is configured.
  if (!emails.length && !token) {
    return process.env.NODE_ENV !== "production";
  }

  return false;
}

export { ADMIN_COOKIE };
