"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet as WalletIcon } from "lucide-react";

type Balances = Record<string, number>;

const TIER_LABELS: Record<string, string> = {
  quick_standard: "Aerial",
  standard_standard: "Surface",
  deep_standard: "Deep",
  quick_max: "Trench",
  standard_max: "Mantle",
  deep_max: "Core",
};

export function WalletBadge() {
  const [balances, setBalances] = useState<Balances | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/wallet", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setBalances(data?.balances ?? null);
      })
      .catch(() => {
        if (!cancelled) setBalances(null);
      });
    return () => { cancelled = true; };
  }, []);

  if (!balances) return null;
  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const lines = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${TIER_LABELS[k] ?? k}`);

  return (
    <div
      className="inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs sm:text-sm"
      style={{
        border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, var(--theme-border))",
        backgroundColor: "color-mix(in srgb, var(--theme-accent) 6%, var(--theme-panel))",
      }}
    >
      <WalletIcon className="w-4 h-4 shrink-0" style={{ color: "var(--theme-accent)" }} />
      <span className="font-semibold" style={{ color: "var(--theme-foreground)" }}>
        {total} {total === 1 ? "credit" : "credits"}
      </span>
      <span className="hidden sm:inline" style={{ color: "var(--theme-muted)" }}>
        · {lines.join(" · ")}
      </span>
      <Link
        href="/pricing"
        className="text-xs underline underline-offset-2 hover:opacity-80"
        style={{ color: "var(--theme-accent)" }}
      >
        Top up
      </Link>
    </div>
  );
}
