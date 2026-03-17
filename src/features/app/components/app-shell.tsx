import Link from "next/link";
import { ArrowUpRight, LogOut, PlusCircle } from "lucide-react";

import { CraydlLogo } from "@/components/common/craydl-logo";
import { Button } from "@/components/ui/button";
import type { WorkspaceRecord, WorkspaceSession } from "@/lib/types/product";
import { AppShellNav } from "@/features/app/components/app-shell-nav";

export function AppShell({
  children,
  session,
  workspace,
}: {
  children: React.ReactNode;
  session: WorkspaceSession;
  workspace: WorkspaceRecord;
}) {
  return (
    <main className="min-h-screen bg-background" id="main-content">
      <section className="sticky top-0 z-40 border-b border-border/70 bg-background/92 shadow-[0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Link className="shrink-0" href="/">
                <CraydlLogo compact />
              </Link>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Internal workspace
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-semibold text-foreground">
                    {workspace.name}
                  </p>
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                    {session.mode === "supabase" ? "Email sign-in" : "Local workspace"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm">
                <Link href="/app#new-lead">
                  <PlusCircle className="size-4" />
                  New audit
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/examples">
                  <ArrowUpRight className="size-4" />
                  Public examples
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/auth/logout">
                  <LogOut className="size-4" />
                  Log out
                </Link>
              </Button>
            </div>
          </div>
          <AppShellNav />
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
