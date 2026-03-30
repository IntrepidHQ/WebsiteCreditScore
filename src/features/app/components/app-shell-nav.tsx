"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/benchmarks", label: "Benchmarks" },
  { href: "/app/max", label: "MAX" },
  { href: "/app/seo", label: "SEO" },
  { href: "/app/templates", label: "Templates" },
  { href: "/app/referrals", label: "Referrals" },
  { href: "/docs", label: "Docs" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShellNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex flex-wrap gap-2 pb-1">
      {navItems.map((item) => {
        const active =
          item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            className={cn(
              "inline-flex shrink-0 items-center rounded-[8px] border border-border/70 bg-panel/60 px-3.5 py-2 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-foreground",
              active && "border-accent/30 bg-elevated text-foreground",
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
