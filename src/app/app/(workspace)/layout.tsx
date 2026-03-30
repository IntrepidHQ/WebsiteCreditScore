import { AppShell } from "@/features/app/components/app-shell";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getWorkspaceAppContext();

  return (
    <AppShell>{children}</AppShell>
  );
}
