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
    // Table doesn't exist yet (migration not run) or DB connectivity issue.
    // Redirect to login with a readable error rather than showing a 500.
    if (
      msg.includes("relation") ||
      msg.includes("does not exist") ||
      msg.includes("undefined") ||
      msg.includes("42P01") // PostgreSQL: undefined_table
    ) {
      redirect("/app/login?error=db-not-ready");
    }
    // Re-throw everything else so it surfaces properly.
    throw err;
  }

  return (
    <AppShell>{children}</AppShell>
  );
}
