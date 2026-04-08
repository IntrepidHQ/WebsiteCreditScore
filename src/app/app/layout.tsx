import { WorkspaceSessionRefresher } from "@/features/app/components/workspace-session-refresher";

/**
 * All `/app/*` routes (login + workspace) share this shell. Session refresher runs
 * here once so returning to the tab revalidates RSC auth after middleware refresh.
 * Marketing routes under `/` do not mount this — they only use optional session in the root layout.
 */
export const dynamic = "force-dynamic";

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorkspaceSessionRefresher />
      {children}
    </>
  );
}
