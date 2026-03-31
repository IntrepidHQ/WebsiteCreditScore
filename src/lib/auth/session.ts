import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { WorkspaceSession } from "@/lib/types/product";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const DEMO_SESSION_COOKIE = "craydl-demo-session";

export function sanitizeInternalNextPath(next: string | null | undefined, fallback = "/app") {
  if (!next) {
    return fallback;
  }

  const trimmed = next.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}

export async function getOptionalWorkspaceSession(): Promise<WorkspaceSession | null> {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
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
    } catch {
      // fall through to demo session
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
}

export async function requireWorkspaceSession() {
  const session = await getOptionalWorkspaceSession();

  if (!session) {
    redirect("/app/login");
  }

  return session;
}
