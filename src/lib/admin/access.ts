import { redirect } from "next/navigation";

import { isDemoWorkspaceAllowed } from "@/lib/auth/demo-flag";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import type { WorkspaceSession } from "@/lib/types/product";

const DEFAULT_ALLOWLIST = ["admin@websitecreditscore.com"];

const readAllowlist = (): string[] => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const parsed = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ALLOWLIST;
};

export const isAdminEmail = (email: string | undefined | null): boolean => {
  if (!email) {
    return false;
  }
  return readAllowlist().includes(email.trim().toLowerCase());
};

/**
 * Server-side admin gate. Redirects to login when no session, or to a 404
 * for signed-in-but-not-admin users (don't reveal admin exists).
 */
export const requireAdminSession = async (): Promise<WorkspaceSession> => {
  const session = await getOptionalWorkspaceSession();
  if (!session) {
    redirect("/app/login?next=%2Fadmin");
  }
  // Dev ergonomics: when Supabase isn't configured and demo mode is permitted,
  // let the demo owner session reach the admin surface. Production paths still
  // require an email match (isDemoWorkspaceAllowed defaults false in prod).
  const demoUnlocked = session.mode === "demo" && isDemoWorkspaceAllowed();
  if (!demoUnlocked && !isAdminEmail(session.email)) {
    redirect("/");
  }
  return session;
};
