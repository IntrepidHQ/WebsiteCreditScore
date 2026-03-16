import Link from "next/link";
import { ScanSearch, Settings } from "lucide-react";

import { CraydlLogo } from "@/components/common/craydl-logo";
import { Button } from "@/components/ui/button";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/platform", label: "Platform" },
  { href: "/examples", label: "Examples" },
  { href: "/audit/mark-deford-md", label: "Sample Audit" },
];

const workspaceLinks = [
  { href: "/brief/mark-deford-md", label: "Discovery Brief" },
  { href: "/settings", label: "Theme Settings" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/78 print:hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:px-8">
        <div className="space-y-5">
          <Link href="/" className="inline-flex">
            <CraydlLogo compact />
          </Link>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Craydl helps web product providers audit service-business sites, package the
            opportunity, and move into approved discovery.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link href="/audit/mark-deford-md">
                <ScanSearch className="size-4" />
                Open sample audit
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/settings">
                <Settings className="size-4" />
                Theme settings
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Navigation
            </p>
            <nav aria-label="Footer primary">
              <ul className="space-y-3 text-sm text-foreground">
                {primaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link className="inline-flex items-center gap-2 hover:text-accent" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Workspace
            </p>
            <nav aria-label="Footer workspace">
              <ul className="space-y-3 text-sm text-foreground">
                {workspaceLinks.map((link) => (
                  <li key={link.href}>
                    <Link className="inline-flex items-center gap-2 hover:text-accent" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
