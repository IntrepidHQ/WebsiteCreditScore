"use client";

import Link from "next/link";
import { ScanSearch, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { StripeWordmark } from "@/components/common/stripe-wordmark";
import { WebsiteCreditScoreLogo } from "@/components/common/website-credit-score-logo";
import { Button } from "@/components/ui/button";

const primaryLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/examples", label: "Examples" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/audit/mark-deford-md", label: "Sample Audit" },
];

export function SiteFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  const toolLinks = [
    { href: "/brief/mark-deford-md", label: "Discovery Brief" },
    { href: "/settings", label: "Theme" },
    isAuthenticated
      ? { href: "/app", label: "Workspace" }
      : { href: "/app/login", label: "Sign in" },
  ];

  if (pathname.startsWith("/app")) {
    return null;
  }

  return (
    <footer className="border-t border-border/60 bg-background/78 print:hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:px-8">
        <div className="space-y-5">
          <Link href="/" className="inline-flex">
            <WebsiteCreditScoreLogo compact />
          </Link>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Audit the live site, see what is costing trust, and decide what to fix first.
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-panel/45 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Payments by
            </span>
            <StripeWordmark className="h-5" />
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Button asChild className="w-full sm:w-auto" size="sm">
              <Link href="/audit/mark-deford-md">
                <ScanSearch className="size-4" />
                Open sample audit
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto" size="sm" variant="secondary">
              <Link href="/docs">
                <BookOpen className="size-4" />
                Docs
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
              Tools
            </p>
            <nav aria-label="Footer tools">
              <ul className="space-y-3 text-sm text-foreground">
                {toolLinks.map((link) => (
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
