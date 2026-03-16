"use client";

import Link from "next/link";
import { ArrowUpRight, Compass, FileText, Palette, ScanSearch } from "lucide-react";
import { usePathname } from "next/navigation";

import { CraydlLogo } from "@/components/common/craydl-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function getNavigation(pathname: string) {
  if (pathname.startsWith("/audit/")) {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#findings", label: "Findings" },
      { href: "#strategy", label: "Strategy" },
      { href: "#pricing", label: "Pricing" },
      { href: "#next-steps", label: "Next Steps" },
    ];
  }

  if (pathname.startsWith("/brief/")) {
    return [
      { href: "/platform", label: "Platform" },
      { href: "#questionnaire", label: "Questionnaire" },
      { href: "#brief", label: "Creative Brief" },
      { href: "#handoff", label: "Wireframe Handoff" },
    ];
  }

  return [
    { href: "/", label: "Home" },
    { href: "/platform", label: "Platform" },
    { href: "/examples", label: "Examples" },
    { href: "/audit/mark-deford-md", label: "Sample Audit" },
  ];
}

export function SiteHeader() {
  const pathname = usePathname();
  const navigation = getNavigation(pathname);
  const isWorkspacePath = pathname.startsWith("/audit/") || pathname.startsWith("/brief/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/72 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <CraydlLogo />
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/settings">
                <Palette aria-hidden="true" className="size-4" />
                Settings
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={pathname.startsWith("/audit/") ? "#pricing" : "/audit/mark-deford-md"}>
                {pathname.startsWith("/audit/") ? (
                  <>
                    <Compass aria-hidden="true" className="size-4" />
                    Jump to pricing
                  </>
                ) : (
                  <>
                    <ScanSearch aria-hidden="true" className="size-4" />
                    Sample audit
                  </>
                )}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link href={isWorkspacePath ? "/brief/mark-deford-md" : "/platform"}>
                <FileText aria-hidden="true" className="size-4" />
                {isWorkspacePath ? "Brief" : "Platform"}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="flex gap-2 overflow-x-auto pb-1 lg:items-center"
        >
          {navigation.map((item) => (
            <Link
              className={cn(
                "whitespace-nowrap rounded-[8px] border border-border/60 bg-panel/50 px-3 py-2 text-sm font-medium text-muted transition hover:bg-elevated hover:text-foreground",
                pathname === item.href && "bg-elevated text-foreground",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
