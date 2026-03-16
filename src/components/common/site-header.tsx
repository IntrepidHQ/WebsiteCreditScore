"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  FileText,
  Menu,
  Palette,
  ScanSearch,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CraydlLogo } from "@/components/common/craydl-logo";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
};

function getPrimaryNavigation() {
  return [
    { href: "/", label: "Home" },
    { href: "/platform", label: "Platform" },
    { href: "/examples", label: "Examples" },
  ] satisfies NavItem[];
}

function getSectionNavigation(pathname: string) {
  if (pathname.startsWith("/audit/")) {
    return [
      { href: "#overview", label: "Overview" },
      { href: "#research", label: "Research" },
      { href: "#findings", label: "Findings" },
      { href: "#strategy", label: "Strategy" },
      { href: "#pricing", label: "Pricing" },
      { href: "#next-steps", label: "Send" },
    ] satisfies NavItem[];
  }

  if (pathname.startsWith("/brief/")) {
    return [
      { href: "#questionnaire", label: "Questions" },
      { href: "#brief", label: "Brief" },
      { href: "#handoff", label: "Handoff" },
    ] satisfies NavItem[];
  }

  return [] satisfies NavItem[];
}

function getReportId(pathname: string) {
  return pathname.split("/")[2] ?? "mark-deford-md";
}

function buildRouteWithOptionalUrl(path: string, normalizedUrl?: string | null) {
  if (!normalizedUrl) {
    return path;
  }

  return `${path}?url=${encodeURIComponent(normalizedUrl)}`;
}

function isActiveItem(pathname: string, activeHash: string, item: NavItem) {
  if (item.href.startsWith("#")) {
    return activeHash
      ? activeHash === item.href
      : item.href === "#overview" || item.href === "#questionnaire";
  }

  return pathname === item.href;
}

function HeaderLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "whitespace-nowrap rounded-[8px] border border-border/60 bg-panel/50 px-3 py-2 text-sm font-medium text-muted transition hover:bg-elevated hover:text-foreground",
        active && "border-accent/30 bg-elevated text-foreground",
      )}
      href={item.href}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const normalizedUrl = searchParams.get("url");
  const reportId = getReportId(pathname);
  const isAuditPath = pathname.startsWith("/audit/");
  const isBriefPath = pathname.startsWith("/brief/");
  const isWorkspacePath = isAuditPath || isBriefPath;
  const primaryNavigation = useMemo(() => getPrimaryNavigation(), []);
  const sectionNavigation = useMemo(() => getSectionNavigation(pathname), [pathname]);
  const packetHref = buildRouteWithOptionalUrl(`/packet/${reportId}`, normalizedUrl);
  const briefHref = buildRouteWithOptionalUrl(`/brief/${reportId}`, normalizedUrl);
  const auditHref = buildRouteWithOptionalUrl(`/audit/${reportId}`, normalizedUrl);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 12);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const quickActions = isAuditPath
    ? [
        { href: "#pricing", label: "Jump to pricing", icon: Compass },
        { href: packetHref, label: "Packet PDF", icon: FileText },
        { href: briefHref, label: "Brief", icon: ArrowUpRight },
      ]
    : isBriefPath
      ? [
          { href: auditHref, label: "Open audit", icon: ScanSearch },
          { href: packetHref, label: "Packet PDF", icon: FileText },
          { href: "/settings", label: "Settings", icon: Palette },
        ]
      : [
          { href: "/examples", label: "Examples", icon: Compass },
          { href: "/audit/mark-deford-md", label: "Sample audit", icon: ScanSearch },
          { href: "/settings", label: "Settings", icon: Palette },
        ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 print:hidden transition-all duration-300",
        scrolled
          ? "bg-background/92 shadow-[0_16px_52px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
          : "bg-background/76 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center justify-between gap-4 transition-[padding] duration-300",
            scrolled ? "py-3" : "py-4",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="min-w-0">
              <CraydlLogo compact={scrolled} />
            </Link>
            {!isWorkspacePath ? (
              <nav aria-label="Primary" className="hidden lg:flex items-center gap-2">
                {primaryNavigation.map((item) => (
                  <HeaderLink
                    active={isActiveItem(pathname, activeHash, item)}
                    item={item}
                    key={item.href}
                  />
                ))}
              </nav>
            ) : null}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const variant = index === 1 ? "secondary" : index === 2 ? "outline" : "ghost";

              return (
                <Button asChild className="shrink-0" key={action.href} size="sm" variant={variant}>
                  <Link href={action.href}>
                    <Icon className="size-4" />
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            {isAuditPath ? (
              <Button asChild size="sm" variant="secondary">
                <Link href="#pricing">
                  <Compass className="size-4" />
                  Price
                </Link>
              </Button>
            ) : null}
            <Dialog>
              <DialogTrigger asChild>
                <Button aria-label="Open navigation" size="icon" variant="outline">
                  <Menu className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[min(92vw,28rem)] p-5">
                <DialogHeader>
                  <DialogTitle>Navigate Craydl</DialogTitle>
                  <DialogDescription>
                    Move between pages and jump to the most useful part of the current screen.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Primary
                    </p>
                    <div className="grid gap-2">
                      {primaryNavigation.map((item) => (
                        <DialogClose asChild key={item.href}>
                          <Link
                            className={cn(
                              "rounded-[8px] border border-border/70 bg-background-alt/70 px-4 py-3 text-sm font-medium text-foreground transition hover:border-accent/30 hover:bg-elevated",
                              isActiveItem(pathname, activeHash, item) &&
                                "border-accent/30 bg-elevated",
                            )}
                            href={item.href}
                          >
                            {item.label}
                          </Link>
                        </DialogClose>
                      ))}
                    </div>
                  </div>

                  {sectionNavigation.length ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        On this page
                      </p>
                      <div className="grid gap-2">
                        {sectionNavigation.map((item) => (
                          <DialogClose asChild key={item.href}>
                            <a
                              className={cn(
                                "rounded-[8px] border border-border/70 bg-background-alt/70 px-4 py-3 text-sm font-medium text-foreground transition hover:border-accent/30 hover:bg-elevated",
                                isActiveItem(pathname, activeHash, item) &&
                                  "border-accent/30 bg-elevated",
                              )}
                              href={item.href}
                            >
                              {item.label}
                            </a>
                          </DialogClose>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Quick actions
                    </p>
                    <div className="grid gap-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                          action.href.startsWith("#") ? (
                            <DialogClose asChild key={action.href}>
                              <a
                                className="inline-flex items-center gap-2 rounded-[8px] border border-border/70 bg-panel/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-accent/30 hover:bg-elevated"
                                href={action.href}
                              >
                                <Icon className="size-4" />
                                {action.label}
                              </a>
                            </DialogClose>
                          ) : (
                            <DialogClose asChild key={action.href}>
                              <Link
                                className="inline-flex items-center gap-2 rounded-[8px] border border-border/70 bg-panel/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-accent/30 hover:bg-elevated"
                                href={action.href}
                              >
                                <Icon className="size-4" />
                                {action.label}
                              </Link>
                            </DialogClose>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {sectionNavigation.length ? (
          <nav
            aria-label="Section navigation"
            className={cn(
              "hidden gap-2 overflow-x-auto pb-3 md:flex",
              scrolled ? "pt-0" : "pt-1",
            )}
          >
            {sectionNavigation.map((item) => (
              <HeaderLink
                active={isActiveItem(pathname, activeHash, item)}
                item={item}
                key={item.href}
              />
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
