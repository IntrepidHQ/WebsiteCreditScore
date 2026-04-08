import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user?.id) {
        return {
          mode: "supabase",
          userId: user.id,
          email: user.email ?? "owner@example.com",
          name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "Workspace owner",
          avatarUrl: user.user_metadata?.avatar_url,
        };
      }

      if (error && !isExpectedNoSessionError(error)) {
        console.error("[auth] Supabase getUser failed:", error.message);
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
    redirect("/app/login");
  }

  return session;
};
