"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTemporaryFreeScanWindow } from "@/lib/free-scan-window";

type Tier = "quick" | "standard" | "deep";
export type TierMode = "standard" | "max";

const TIER_ORDER: Tier[] = ["quick", "standard", "deep"];
const FIRST_SCAN_KEY = "wcs_first_scan_claimed";

const TIER_COPY: Record<
  TierMode,
  Record<Tier, { label: string; tabLabel: string; price: number; blurb: string }>
> = {
  standard: {
    quick: {
      label: "Aerial Scan",
      tabLabel: "Aerial Scan",
      price: 1,
      blurb: "Top-down credibility pass — essential searches, fastest turnaround (~60s).",
    },
    standard: {
      label: "Surface Scan",
      tabLabel: "Surface Scan",
      price: 3,
      blurb: "Vendor vetting & competitor context — richer evidence trail (~90s).",
    },
    deep: {
      label: "Deep Scan",
      tabLabel: "Deep Scan",
      price: 6,
      blurb: "High-stakes due diligence — maximum depth and citations (~120s).",
    },
  },
  max: {
    quick: {
      label: "Trench Scan",
      tabLabel: "Trench Scan",
      price: 10,
      blurb: "Wide-area recon — many more live searches for a broader snapshot.",
    },
    standard: {
      label: "Mantle Scan",
      tabLabel: "Mantle Scan",
      price: 20,
      blurb: "Deep strata of evidence — heavy competitor, press, and narrative coverage.",
    },
    deep: {
      label: "Core Scan",
      tabLabel: "Core Scan",
      price: 40,
      blurb: "Bedrock analysis — exhaustive search budget for the strongest paper trail.",
    },
  },
};

const FREE_SCAN_CLIENT =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_FREE_SCAN_MODE === "true";
const TEMP_FREE_SCAN_ACTIVE = isTemporaryFreeScanWindow();

function readFirstScanAvailable() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FIRST_SCAN_KEY) !== "1";
  } catch {
    return true;
  }
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ScanForm({
  defaultTier = "quick",
  showTierSelect = true,
  tierMode: initialMode = "standard",
}: {
  large?: boolean;
  defaultTier?: Tier;
  showTierSelect?: boolean;
  tierMode?: TierMode;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [tier, setTier] = useState<Tier>(defaultTier);
  const [mode, setMode] = useState<TierMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [firstScanAvailable, setFirstScanAvailable] = useState(false);
  const [walletBalances, setWalletBalances] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setFirstScanAvailable(readFirstScanAvailable());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/wallet", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setWalletBalances(data?.balances ?? null);
      })
      .catch(() => {
        if (!cancelled) setWalletBalances(null);
      });
    return () => { cancelled = true; };
  }, []);

  const copy = TIER_COPY[mode][tier];
  const creditKey = `${tier}_${mode}`;
  const creditCount = walletBalances?.[creditKey] ?? 0;
  const hasCredit = creditCount > 0;
  const useFreeFlow = !hasCredit && (TEMP_FREE_SCAN_ACTIVE || FREE_SCAN_CLIENT || firstScanAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const domain = normalizeUrl(url);

      // Try the free / wallet-credit path first. The server decides which one applies.
      if (hasCredit || useFreeFlow) {
        const res = await fetch("/api/scan/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, tier, mode }),
        });
        if (res.ok) {
          const { scanId, source } = await res.json();
          if (source === "first-free") {
            try { window.localStorage.setItem(FIRST_SCAN_KEY, "1"); } catch {}
          }
          router.push(`/scan/${scanId}`);
          return;
        }
        // 403 → no credit & no free scan; fall through to paid checkout.
        if (res.status !== 403) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Something went wrong");
        }
        try { window.localStorage.setItem(FIRST_SCAN_KEY, "1"); } catch {}
        setFirstScanAvailable(false);
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, tier, mode, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const buttonLabel = hasCredit
    ? "Use credit →"
    : useFreeFlow
      ? "Free scan →"
      : "Scan →";
  const hintLine = hasCredit
    ? `${creditCount} ${copy.tabLabel} ${creditCount === 1 ? "credit" : "credits"} available`
    : TEMP_FREE_SCAN_ACTIVE
      ? "Temporary test mode (24h): scans are free"
      : useFreeFlow
      ? "First scan is free · No account required"
      : `Starts at $${TIER_COPY[mode].quick.price} per report · No account required`;
  const showFree = hasCredit || useFreeFlow;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          border: "1px solid var(--theme-border)",
          backgroundColor: "color-mix(in srgb, var(--theme-panel) 92%, transparent)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        }}
      >
        {showTierSelect && (
          <div role="tablist" className="flex w-full" style={{ borderBottom: "1px solid var(--theme-border)" }}>
            {TIER_ORDER.map((id, i) => {
              const selected = tier === id;
              const row = TIER_COPY[mode][id];
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTier(id)}
                  className="flex-1 py-3 px-2 transition-all text-center min-w-0"
                  style={{
                    backgroundColor: selected ? "var(--theme-accent)" : "transparent",
                    color: selected ? "var(--theme-accent-foreground)" : "var(--theme-muted)",
                    borderRight: i < TIER_ORDER.length - 1 ? "1px solid var(--theme-border)" : "none",
                    fontWeight: selected ? 600 : 500,
                  }}
                >
                  <span className="text-sm leading-tight whitespace-nowrap">{row.tabLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3
              className="font-display leading-none"
              style={{ color: "var(--theme-foreground)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)" }}
            >
              {copy.label}
            </h3>
            <span
              className="font-display leading-none"
              style={{ color: "var(--theme-accent)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)" }}
            >
              {showFree ? "Free" : `$${copy.price}`}
            </span>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            {copy.blurb}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
            {hasCredit ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(247,178,27,0.14)", color: "var(--theme-accent)", border: "1px solid rgba(247,178,27,0.35)" }}
              >
                ★ {creditCount} {creditCount === 1 ? "credit" : "credits"}
              </span>
            ) : TEMP_FREE_SCAN_ACTIVE ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#86efac", border: "1px solid rgba(74,222,128,0.3)" }}
              >
                ★ Test mode free scan
              </span>
            ) : useFreeFlow ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#86efac", border: "1px solid rgba(74,222,128,0.3)" }}
              >
                ★ First scan free
              </span>
            ) : null}
            <span style={{ color: "var(--theme-accent)" }}>{hintLine}</span>
          </div>

          <div
            className="flex items-stretch rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background)" }}
          >
            <div className="flex items-center pl-3 pr-2 shrink-0" style={{ color: "var(--theme-muted)" }}>
              <span className="font-mono text-xs">https://</span>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="domain.com"
              className="flex-1 min-w-0 bg-transparent outline-none py-3 sm:py-4 text-base sm:text-lg"
              style={{ color: "var(--theme-foreground)" }}
              disabled={loading}
              aria-label="Domain to scan"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="font-semibold transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shrink-0 px-5 sm:px-6 text-sm sm:text-base"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              {loading ? "…" : buttonLabel}
            </button>
          </div>

          {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
        </div>

        <div
          className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3"
          style={{
            borderTop: "1px solid var(--theme-border)",
            backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)",
          }}
        >
          <div className="flex items-baseline gap-2 text-xs sm:text-sm">
            <span className="font-bold tracking-wider" style={{ color: "var(--theme-accent)" }}>
              MAX Mode:
            </span>
            <span
              className="font-semibold"
              style={{ color: mode === "max" ? "var(--theme-accent)" : "var(--theme-muted)" }}
            >
              {mode === "max" ? "On" : "Off"}
            </span>
            <span className="hidden sm:inline" style={{ color: "var(--theme-muted)" }}>·</span>
            <span className="hidden sm:inline" style={{ color: "var(--theme-muted)" }}>
              Deeper research
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "max" ? "standard" : "max"))}
            className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
            style={{ backgroundColor: mode === "max" ? "var(--theme-accent)" : "var(--theme-border)" }}
            aria-label="Toggle MAX mode"
            aria-pressed={mode === "max"}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: "#fff",
                left: mode === "max" ? "calc(100% - 1.375rem)" : "0.125rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            />
          </button>
        </div>
      </div>
    </form>
  );
}
