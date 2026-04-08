import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { WorkspaceSession } from "@/lib/types/product";
import { isDemoWorkspaceAllowed } from "@/lib/auth/demo-flag";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const DEMO_SESSION_COOKIE = "craydl-demo-session";

const isExpectedNoSessionError = (error: { message?: string; name?: string }) => {
  const msg = (error.message ?? "").toLowerCase();
  if (error.name === "AuthSessionMissingError") {
    return true;
  }
  return (
    msg.includes("invalid refresh token") ||
    msg.includes("refresh token not found") ||
    msg.includes("jwt expired") ||
    msg.includes("session missing") ||
    msg.includes("invalid jwt")
  );
};

/** Build workspace session from Supabase `User` (same shape as `getOptionalWorkspaceSession` for Supabase). */
export const workspaceSessionFromSupabaseUser = (user: User): WorkspaceSession => ({
  mode: "supabase",
  userId: user.id,
  email: user.email ?? "owner@example.com",
  name:
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Workspace owner",
  avatarUrl: user.user_metadata?.avatar_url,
});

/**
 * Validates the JWT and, when the access token is stale but a refresh token exists,
 * refreshes once (Server Components cannot always rely on middleware timing vs RSC).
 */
export const resolveSupabaseSessionUser = async (
  supabase: SupabaseClient,
): Promise<User | null> => {
  let {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user?.id) {
    return user;
  }

  if (!user) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.refresh_token) {
      await supabase.auth.refreshSession({
        refresh_token: sessionData.session.refresh_token,
      });
      ({
        data: { user },
        error,
      } = await supabase.auth.getUser());
    }
  }

  if (error) {
    if (!isExpectedNoSessionError(error)) {
      console.error("[auth] Supabase getUser failed:", error.message);
    }
    return null;
  }

  return user?.id ? user : null;
};

export const sanitizeInternalNextPath = (next: string | null | undefined, fallback = "/app") => {
  if (!next) {
    return fallback;
  }

  const trimmed = next.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
};

export const getOptionalWorkspaceSession = async (): Promise<WorkspaceSession | null> => {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const user = await resolveSupabaseSessionUser(supabase);

      if (user?.id) {
        return workspaceSessionFromSupabaseUser(user);
      }

      const cookieStore = await cookies();
      const hasDemoSession = cookieStore.get(DEMO_SESSION_COOKIE)?.value === "owner";

      if (hasDemoSession && isDemoWorkspaceAllowed()) {
        return {
          mode: "demo",
          userId: "demo-owner",
          email: "hello@websitecreditscore.com",
          name: "WebsiteCreditScore",
        };
      }

      return null;
    } catch (err) {
      // During Next.js build, static pre-rendering hits `cookies()` before
      // `force-dynamic` is applied on every route. Suppress those noisy logs.
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Dynamic server usage")) {
        console.error("[auth] Supabase session error:", err);
      }
      return null;
    }
  }

  const cookieStore = await cookies();
  const hasDemoSession = cookieStore.get(DEMO_SESSION_COOKIE)?.value === "owner";

  if (!hasDemoSession) {
    return null;
  }

  return {
    mode: "demo",
    userId: "demo-owner",
    email: "hello@websitecreditscore.com",
    name: "WebsiteCreditScore",
  };
};

export const requireWorkspaceSession = async () => {
  const session = await getOptionalWorkspaceSession();

  if (!session) {
    // Stable error so login does not immediately redirect back to /app when cookies recover next request.
    redirect("/app/login?error=session-required");
  }

  return session;
};
