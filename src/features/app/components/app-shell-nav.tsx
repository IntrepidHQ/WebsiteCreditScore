"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Gauge, HandCoins, Mail, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/app", label: "Dashboard", icon: Gauge },
  { href: "/app/leads", label: "Leads", icon: HandCoins },
  { href: "/app/templates", label: "Templates", icon: Mail },
  { href: "/app/referrals", label: "Referrals", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings2 },
];

export function AppShellNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const active = item.href === "/app"
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            className={cn(
              "inline-flex items-center gap-2 rounded-[8px] border border-border/70 bg-panel/60 px-3 py-2 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-foreground",
              active && "border-accent/30 bg-elevated text-foreground",
            )}
            href={item.href}
            key={item.href}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
