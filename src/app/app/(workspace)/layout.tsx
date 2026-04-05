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

  // #region agent log
  fetch("http://127.0.0.1:7460/ingest/f3e69962-c2ab-4d8a-81a8-8fb4ae2a364a", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8c27eb" },
    body: JSON.stringify({
      sessionId: "8c27eb",
      hypothesisId: "H-B",
      location: "layout.tsx:after_getWorkspaceAppContext",
      message: "workspace layout context ready",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  console.error(
    JSON.stringify({
      tag: "WCS_PHASE",
      phase: "workspace_layout_ok",
      timestamp: Date.now(),
    }),
  );

  return (
    <AppShell>{children}</AppShell>
  );
}
