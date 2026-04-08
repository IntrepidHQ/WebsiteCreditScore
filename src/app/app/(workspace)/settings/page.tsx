import Link from "next/link";

import { SettingsPanel } from "@/features/theme/components/settings-panel";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function AppSettingsPage() {
  await getWorkspaceAppContext();

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-border/60 bg-panel/50 px-4 py-3 text-sm leading-6 text-muted">
        Theme preferences sync to this browser under your signed-in account. If workspace pages fail to load, open{" "}
        <Link className="font-medium text-accent underline underline-offset-2" href="/settings">
          /settings
        </Link>{" "}
        on the marketing site (anonymous scope, no sign-in required).
      </p>
      <SettingsPanel />
    </div>
  );
}
