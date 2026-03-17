import { AppShell } from "@/features/app/components/app-shell";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, workspace } = await getWorkspaceAppContext();

  return (
    <AppShell session={session} workspace={workspace}>
      {children}
    </AppShell>
  );
}
