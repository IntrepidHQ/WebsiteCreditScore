import Link from "next/link";
import { ArrowUpRight, LogOut, PlusCircle } from "lucide-react";

import { WebsiteCreditScoreLogo } from "@/components/common/website-credit-score-logo";
import { Button } from "@/components/ui/button";
import { AppShellNav } from "@/features/app/components/app-shell-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background" id="main-content">
      <section className="sticky top-0 z-40 bg-transparent print:hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="min-w-0 shrink-0" href="/">
              <WebsiteCreditScoreLogo />
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button asChild className="shrink-0" size="sm">
                <Link href="/app#new-lead">
                  <PlusCircle className="size-4" />
                  New audit
                </Link>
              </Button>
              <Button asChild className="shrink-0" size="sm" variant="secondary">
                <Link href="/examples">
                  <ArrowUpRight className="size-4" />
                  Public examples
                </Link>
              </Button>
              <Button asChild className="shrink-0" size="sm" variant="ghost">
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
