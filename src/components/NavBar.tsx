"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buildStrategyCallCalendlyUrl } from "@/lib/strategy-call";

const NAV_LINKS = [
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/pricing",    label: "Pricing" },
  { href: "/blog",       label: "Blog" },
  { href: "/docs",       label: "Docs" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-background) 85%, transparent)" }}
      >
        <Link
          href="/"
          className="font-display tracking-tight hover:opacity-80 transition-opacity leading-none"
          style={{ color: "var(--theme-foreground)", fontSize: "clamp(1.6rem, 2.6vw, 2rem)" }}
        >
          WebsiteCreditScore
          <span style={{ color: "var(--theme-accent)" }}>.com</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-5" style={{ color: "var(--theme-muted)" }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:opacity-80 transition-opacity">
                {l.label}
              </Link>
            ))}
          </div>
          <a
            href={buildStrategyCallCalendlyUrl({ medium: "navbar" })}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl px-4 py-2 font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
          >
            Strategy Call
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-1.5 rounded-lg hover:opacity-80 transition-opacity"
          style={{ color: "var(--theme-muted)" }}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-[57px] left-0 right-0 py-4 px-6 space-y-1"
            style={{ backgroundColor: "var(--theme-background)", borderBottom: "1px solid var(--theme-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center py-3 text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: "var(--theme-foreground)", borderBottom: "1px solid var(--theme-border)" }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={buildStrategyCallCalendlyUrl({ medium: "navbar" })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center py-3 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ color: "var(--theme-accent-foreground)", backgroundColor: "var(--theme-accent)", borderRadius: "12px", marginTop: "0.5rem", justifyContent: "center" }}
              onClick={() => setOpen(false)}
            >
              Strategy Call
            </a>
            <Link
              href="/"
              className="flex items-center py-3 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--theme-accent)" }}
              onClick={() => setOpen(false)}
            >
              Run a scan →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
