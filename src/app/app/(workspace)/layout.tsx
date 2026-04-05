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
  // Ensures session + workspace; recoverable DB/auth errors redirect via context.
  await getWorkspaceAppContext();

  return (
    <AppShell>{children}</AppShell>
  );
}
