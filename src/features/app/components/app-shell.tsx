import Link from "next/link";
import { ArrowUpRight, LogOut, PlusCircle } from "lucide-react";

import { WebsiteCreditScoreLogo } from "@/components/common/website-credit-score-logo";
import { Button } from "@/components/ui/button";
import { AppShellNav } from "@/features/app/components/app-shell-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background" id="main-content">
      <section className="sticky top-0 z-50 border-b border-border/50 bg-background/82 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="min-w-0 shrink-0" href="/">
              <WebsiteCreditScoreLogo size="header" />
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
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pt-2 pb-8 sm:px-6 lg:px-8">
        {children}
      </div>
      <footer className="border-t border-border/60 bg-background/84 print:hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-2">
            <Link className="inline-flex" href="/">
              <WebsiteCreditScoreLogo compact />
            </Link>
            <p className="max-w-xl text-sm leading-6 text-muted">
              Score the site, see where it is losing trust, and keep the next step clear.
            </p>
          </div>
          <nav aria-label="Workspace footer" className="flex flex-wrap gap-3 text-sm text-foreground">
            <Link className="hover:text-accent" href="/app">
              Dashboard
            </Link>
            <Link className="hover:text-accent" href="/app/benchmarks">
              Benchmarks
            </Link>
            <Link className="hover:text-accent" href="/examples">
              Examples
            </Link>
            <Link className="hover:text-accent" href="/docs">
              Docs
            </Link>
            <Link className="hover:text-accent" href="/app/settings">
              Settings
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
