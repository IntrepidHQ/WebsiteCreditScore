import { redirect } from "next/navigation";

import { AppShell } from "@/features/app/components/app-shell";
import { getWorkspaceAppContext } from "@/lib/product/context";

// All workspace routes read cookies for auth — force dynamic to prevent
// Next.js from attempting (and failing) static pre-rendering at build time.
export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await getWorkspaceAppContext();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code?: string }).code ?? "")
        : "";

    const isMissingTable =
      msg.includes("relation") ||
      msg.includes("does not exist") ||
      msg.includes("undefined") ||
      msg.includes("42P01");

    const isDuplicateKey =
      code === "23505" || msg.includes("23505") || msg.includes("duplicate key");

    const isRlsOrPermission =
      code === "42501" ||
      msg.includes("42501") ||
      /row-level security|violates row-level security|RLS/i.test(msg);

    // Table doesn't exist yet (migration not run), duplicate seed IDs across
    // workspaces (fixed in app, but old deploys may still throw), or RLS/JWT issues.
    if (isMissingTable) {
      redirect("/app/login?error=db-not-ready");
    }

    if (isDuplicateKey || isRlsOrPermission) {
      redirect("/app/login?error=workspace-unavailable");
    }

    throw err;
  }

  return (
    <AppShell>{children}</AppShell>
  );
}
