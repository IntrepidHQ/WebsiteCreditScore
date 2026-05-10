"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTemporaryFreeScanWindow } from "@/lib/free-scan-window";
import { PACK_QUANTITIES, PRICING, priceCents } from "@/lib/pricing";

type Tier = "quick" | "standard" | "deep";
export type TierMode = "standard" | "max";

const TIER_ORDER: Tier[] = ["quick", "standard", "deep"];
const FIRST_SCAN_KEY = "wcs_first_scan_claimed";

const TIER_COPY: Record<
  TierMode,
  Record<Tier, { label: string; tabLabel: string; blurb: string }>
> = {
  standard: {
    quick: {
      label: "Aerial Scan",
      tabLabel: "Aerial Scan",
      blurb: "Top-down credibility pass — essential searches, fastest turnaround (~60s).",
    },
    standard: {
      label: "Surface Scan",
      tabLabel: "Surface Scan",
      blurb: "Vendor vetting & competitor context — richer evidence trail (~90s).",
    },
    deep: {
      label: "Deep Scan",
      tabLabel: "Deep Scan",
      blurb: "High-stakes due diligence — maximum depth and citations (~120s).",
    },
  },
  max: {
    quick: {
      label: "Trench Scan",
      tabLabel: "Trench Scan",
      blurb: "Wide-area recon — many more live searches for a broader snapshot.",
    },
    standard: {
      label: "Mantle Scan",
      tabLabel: "Mantle Scan",
      blurb: "Deep strata of evidence — heavy competitor, press, and narrative coverage.",
    },
    deep: {
      label: "Core Scan",
      tabLabel: "Core Scan",
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

function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDomain, setCheckoutDomain] = useState("");
  const [checkoutQuantity, setCheckoutQuantity] = useState<number | null>(null);
  const [freeEmail, setFreeEmail] = useState("");
  const [freeCode, setFreeCode] = useState("");
  const [verifiedFreeEmail, setVerifiedFreeEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);

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
  const tierPricing = PRICING[mode][tier];
  const creditKey = `${tier}_${mode}`;
  const creditCount = walletBalances?.[creditKey] ?? 0;
  const hasCredit = creditCount > 0;
  const isAerial = tier === "quick" && mode === "standard";
  const useFreeFlow = !hasCredit && (TEMP_FREE_SCAN_ACTIVE || FREE_SCAN_CLIENT || (firstScanAvailable && isAerial));

  const startCheckout = async (domain: string, quantity: number) => {
    setCheckoutQuantity(quantity);
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, tier, mode, quantity }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Something went wrong");
    }
    const { checkoutUrl } = await res.json();
    window.location.assign(checkoutUrl);
  };

  const sendFreeCode = async () => {
    setError("");
    const res = await fetch("/api/free-scan/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: freeEmail }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not send verification code");
    }
    setOtpSent(true);
  };

  const verifyFreeCode = async () => {
    setError("");
    const res = await fetch("/api/free-scan/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: freeEmail, token: freeCode }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not verify code");
    }
    const data = await res.json();
    setVerifiedFreeEmail(data.email ?? freeEmail.trim().toLowerCase());
  };

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
          body: JSON.stringify({ domain, tier, mode, email: verifiedFreeEmail || undefined }),
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

      setCheckoutDomain(domain);
      setCheckoutOpen(true);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
      setCheckoutQuantity(null);
    }
  };

  const buttonLabel = hasCredit
    ? "Use credit →"
    : useFreeFlow
      ? "Start free scan →"
      : "Scan →";
  const hintLine = hasCredit
    ? `${creditCount} ${copy.tabLabel} ${creditCount === 1 ? "credit" : "credits"} available`
    : TEMP_FREE_SCAN_ACTIVE
      ? "Temporary test mode (24h): scans are free"
      : useFreeFlow
      ? "First Aerial scan is free with verified email"
      : `Starts at ${formatPrice(PRICING.standard.quick.unitCents)} per report · one-click Stripe checkout`;
  const showFree = hasCredit || useFreeFlow;
  const freeEmailReady = TEMP_FREE_SCAN_ACTIVE || FREE_SCAN_CLIENT || !useFreeFlow || hasCredit || verifiedFreeEmail;

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
              {showFree ? "Free" : formatPrice(tierPricing.unitCents)}
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
              disabled={loading || !url.trim() || !freeEmailReady}
              className="font-semibold transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shrink-0 px-5 sm:px-6 text-sm sm:text-base"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              {loading ? "…" : buttonLabel}
            </button>
          </div>

          {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

          {useFreeFlow && !hasCredit && !TEMP_FREE_SCAN_ACTIVE && !FREE_SCAN_CLIENT && (
            <div
              className="rounded-xl border p-3"
              style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--theme-foreground)" }}>
                Verify email to claim your free Aerial Scan
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  type="email"
                  value={freeEmail}
                  onChange={(e) => setFreeEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-w-0 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}
                  disabled={Boolean(verifiedFreeEmail) || loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    sendFreeCode().catch((err) => setError(err instanceof Error ? err.message : "Could not send code"));
                  }}
                  disabled={Boolean(verifiedFreeEmail) || loading || !freeEmail.trim()}
                  className="rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ border: "1px solid var(--theme-border)", color: "var(--theme-accent)" }}
                >
                  {otpSent ? "Send again" : "Send code"}
                </button>
              </div>
              {otpSent && !verifiedFreeEmail && (
                <div className="mt-2 grid gap-2 sm:grid-cols-[8rem_auto]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={freeCode}
                    onChange={(e) => setFreeCode(e.target.value)}
                    placeholder="Code"
                    className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      verifyFreeCode().catch((err) => setError(err instanceof Error ? err.message : "Could not verify code"));
                    }}
                    disabled={loading || freeCode.trim().length < 4}
                    className="rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
                  >
                    Verify
                  </button>
                </div>
              )}
              {verifiedFreeEmail && (
                <p className="mt-2 text-xs" style={{ color: "#86efac" }}>
                  Verified. Your free scan will be tied to {verifiedFreeEmail}.
                </p>
              )}
            </div>
          )}
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
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-3 sm:items-center sm:p-6">
          <div
            className="w-full max-w-md rounded-2xl p-5 shadow-2xl sm:p-6"
            style={{ backgroundColor: "var(--theme-panel)", border: "1px solid var(--theme-border)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-accent)" }}>
                  Checkout
                </p>
                <h3 className="mt-1 font-display text-3xl leading-none" style={{ color: "var(--theme-foreground)" }}>
                  {copy.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false);
                  setCheckoutQuantity(null);
                }}
                className="rounded-full px-3 py-1 text-sm"
                style={{ color: "var(--theme-muted)", border: "1px solid var(--theme-border)" }}
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              Your free scan has already been used. Buy one scan now or add credits for lower per-scan pricing.
            </p>

            <div className="mt-5 space-y-2">
              {[1, ...PACK_QUANTITIES].map((quantity) => {
                const cents = priceCents(tier, mode, quantity);
                const unitCents = Math.round(cents / quantity);
                const isPending = checkoutQuantity === quantity;
                return (
                  <button
                    key={quantity}
                    type="button"
                    onClick={() => {
                      startCheckout(checkoutDomain, quantity).catch((err) => {
                        setError(err instanceof Error ? err.message : "Checkout failed");
                        setLoading(false);
                        setCheckoutQuantity(null);
                      });
                    }}
                    disabled={loading}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
                    style={{ backgroundColor: quantity === 1 ? "var(--theme-accent)" : "var(--theme-background-alt)", color: quantity === 1 ? "var(--theme-accent-foreground)" : "var(--theme-foreground)", border: "1px solid var(--theme-border)" }}
                  >
                    <span className="font-semibold">
                      {quantity === 1 ? "1 scan" : `${quantity} scan credits`}
                    </span>
                    <span className="font-mono text-sm">
                      {isPending ? "Redirecting..." : `${formatPrice(cents)} · ${formatPrice(unitCents)}/scan`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
