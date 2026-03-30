import { SettingsPanel } from "@/features/theme/components/settings-panel";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function AppSettingsPage() {
  await getWorkspaceAppContext();

  return <SettingsPanel />;
}
