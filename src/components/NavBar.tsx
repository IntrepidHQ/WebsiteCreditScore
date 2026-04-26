"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
        <a href="/" className="font-semibold tracking-tight text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--theme-foreground)" }}>
          WebsiteCreditScore.com
        </a>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-5 text-xs" style={{ color: "var(--theme-muted)" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:opacity-80 transition-opacity">{l.label}</a>
          ))}
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
              <a
                key={l.href}
                href={l.href}
                className="flex items-center py-3 text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: "var(--theme-foreground)", borderBottom: "1px solid var(--theme-border)" }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href="/"
              className="flex items-center py-3 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--theme-accent)" }}
              onClick={() => setOpen(false)}
            >
              Run a scan →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
