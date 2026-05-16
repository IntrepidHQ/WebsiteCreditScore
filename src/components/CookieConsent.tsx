"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

type Consent = "necessary" | "all";

const CONSENT_KEY = "wcs_cookie_consent";

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "necessary" || value === "all" ? value : null;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setConsent(readConsent());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const save = (value: Consent) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "all" ? <Analytics /> : null}
      {ready && consent === null ? (
        <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6">
          <section
            aria-label="Cookie notice"
            className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: "var(--theme-border)",
              backgroundColor: "color-mix(in srgb, var(--theme-panel) 96%, black)",
              color: "var(--theme-foreground)",
            }}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold">Cookies and analytics</p>
              <p className="max-w-2xl text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                We use necessary cookies for checkout credits and optional Vercel Analytics to understand aggregate traffic.
                No ad pixels, no resale, no cross-site tracking. Read the{" "}
                <Link href="/cookies" className="underline underline-offset-2" style={{ color: "var(--theme-accent)" }}>
                  cookie policy
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => save("necessary")}
                className="rounded-xl border px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-85"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-foreground)",
                }}
              >
                Necessary only
              </button>
              <button
                type="button"
                onClick={() => save("all")}
                className="rounded-xl px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--theme-accent)",
                  color: "var(--theme-accent-foreground)",
                }}
              >
                Accept analytics
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
