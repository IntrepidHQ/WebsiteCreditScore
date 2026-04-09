import Link from "next/link";

import { AgentChatPanel } from "@/features/app/components/agent-chat-panel";
import { WorkspaceProposalSettings } from "@/features/app/components/workspace-proposal-settings";
import { SettingsPanel } from "@/features/theme/components/settings-panel";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function AppSettingsPage() {
  await getWorkspaceAppContext();

  return (
    <div className="space-y-10">
      <p className="rounded-xl border border-border/60 bg-panel/50 px-4 py-3 text-sm leading-6 text-muted">
        Theme preferences sync to this browser under your signed-in account. If workspace pages fail to load, open{" "}
        <Link className="font-medium text-accent underline underline-offset-2" href="/settings">
          /settings
        </Link>{" "}
        on the marketing site (anonymous scope, no sign-in required).
      </p>
      <div className="grid gap-10 xl:grid-cols-2 xl:items-start">
        <WorkspaceProposalSettings />
        <AgentChatPanel />
      </div>
      <SettingsPanel />
    </div>
  );
}
