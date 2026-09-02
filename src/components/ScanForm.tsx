"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

type Tier = "quick" | "standard" | "deep";
export type TierMode = "standard" | "max";

const TIER_ORDER: Tier[] = ["quick", "standard", "deep"];

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
  giftCode,
}: {
  large?: boolean;
  defaultTier?: Tier;
  showTierSelect?: boolean;
  tierMode?: TierMode;
  giftCode?: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [tier, setTier] = useState<Tier>(defaultTier);
  const [mode, setMode] = useState<TierMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [walletBalances, setWalletBalances] = useState<Record<string, number> | null>(null);
  const [freeScanState, setFreeScanState] = useState<"loading" | "available" | "used">("loading");
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardsAvailable, setRewardsAvailable] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");

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
    fetch("/api/scan/eligibility", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFreeScanState(data?.freeScanAvailable ? "available" : "used");
      })
      .catch(() => {
        if (!cancelled) setFreeScanState("used");
      });
    fetch("/api/rewards", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setRewardsAvailable(data?.available === true);
          setRewardPoints(Number(data?.points ?? 0));
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const copy = TIER_COPY[mode][tier];
  const creditKey = `${tier}_${mode}`;
  const creditCount = walletBalances?.[creditKey] ?? 0;
  const hasCredit = creditCount > 0;
  const isFreeTier = tier === "quick" && mode === "standard";
  const freeScanAvailable = freeScanState === "available" && isFreeTier;

  const startScan = async (intent: "free" | "credit" | "operator") => {
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const domain = normalizeUrl(url);
      const res = await fetch("/api/scan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          tier,
          mode,
          intent,
          ...(giftCode ? { giftCode } : {}),
          ...(accessCode.trim() ? { compCode: accessCode.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      const { scanId } = await res.json();
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const startPrivateCheckout = async () => {
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      const checkout = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: normalizeUrl(url), tier, mode }),
      });
      if (!checkout.ok) {
        const data = await checkout.json().catch(() => ({}));
        throw new Error(data.error ?? "Checkout failed — please try again");
      }
      const { checkoutUrl } = await checkout.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) void startScan("operator");
    else if (freeScanAvailable) void startScan("free");
  };

  const createGift = async () => {
    setRewardMessage("");
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gift" }),
      });
      const data = await res.json();
      if (!res.ok || !data.giftUrl) throw new Error(data.error ?? "Could not create gift link");
      await navigator.clipboard.writeText(data.giftUrl);
      setRewardMessage("Gift link copied · earn 25 points when their public scan completes");
    } catch (err) {
      setRewardMessage(err instanceof Error ? err.message : "Could not create gift link");
    }
  };

  const redeemPoints = async () => {
    setRewardMessage("");
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not redeem points");
      setRewardPoints(Number(data.points ?? 0));
      setWalletBalances(data.balances ?? walletBalances);
      setRewardMessage("Private Aerial scan credit added");
    } catch (err) {
      setRewardMessage(err instanceof Error ? err.message : "Could not redeem points");
    }
  };

  const freeButtonLabel = freeScanState === "loading"
    ? "Checking free scan…"
    : !isFreeTier
      ? "Free scan is Aerial only"
      : freeScanState === "used"
        ? "Free scan used"
        : "Run free public scan";

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
              {isFreeTier && freeScanState === "available" ? "FREE" : `$${copy.price}`}
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
            ) : freeScanState === "loading" ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(148,163,184,0.1)", color: "var(--theme-muted)", border: "1px solid var(--theme-border)" }}
              >
                Checking free scan
              </span>
            ) : freeScanState === "available" ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#86efac", border: "1px solid rgba(74,222,128,0.3)" }}
              >
                First scan free
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(148,163,184,0.1)", color: "var(--theme-muted)", border: "1px solid var(--theme-border)" }}
              >
                Free scan claimed
              </span>
            )}
            <span style={{ color: "var(--theme-muted)" }}>
              Free reports are public · Paid reports are private
            </span>
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
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void startScan(accessCode.trim() ? "operator" : "free")}
              disabled={loading || !url.trim() || (!accessCode.trim() && !freeScanAvailable)}
              className="min-h-12 rounded-xl px-4 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              {loading ? "Starting…" : accessCode.trim() ? "Run operator scan" : freeButtonLabel}
            </button>
            <button
              type="button"
              onClick={() => hasCredit ? void startScan("credit") : void startPrivateCheckout()}
              disabled={loading || !url.trim()}
              className="min-h-12 rounded-xl border px-4 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-panel)", color: "var(--theme-foreground)" }}
            >
              {hasCredit ? "Use private credit" : `Private scan · $${copy.price}`}
            </button>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Free scans join the public WebsiteCreditScore index. Buy a private scan to keep the report limited to your owner link and revocable share links.
          </p>

          {rewardsAvailable && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3" style={{ borderColor: "var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 68%, transparent)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--theme-foreground)" }}>
                {rewardPoints} points
              </span>
              <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                10 per completed public scan · 100 = 1 private Aerial scan
              </span>
              <div className="ml-auto flex flex-wrap gap-2">
                <button type="button" onClick={() => void createGift()} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}>
                  Gift a scan
                </button>
                <button type="button" onClick={() => void redeemPoints()} disabled={rewardPoints < 100} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-35" style={{ borderColor: "var(--theme-border)", color: "var(--theme-accent)" }}>
                  Redeem
                </button>
              </div>
              {giftCode && (
                <p className="w-full text-xs" style={{ color: "#86efac" }}>
                  Gift scan active · completing this public scan rewards the sender 25 points.
                </p>
              )}
              {rewardMessage && <p className="w-full text-xs" style={{ color: "var(--theme-accent)" }}>{rewardMessage}</p>}
            </div>
          )}

          {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAccessCode((visible) => !visible)}
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "var(--theme-muted)" }}
              aria-expanded={showAccessCode}
              aria-controls="operator-access-code"
            >
              <KeyRound className="h-3.5 w-3.5" aria-hidden />
              Operator access
            </button>
            {showAccessCode && (
              <div id="operator-access-code" className="mt-2 flex items-center gap-2">
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Access code"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--theme-border)", color: "var(--theme-foreground)" }}
                  disabled={loading}
                  aria-label="Operator access code"
                />
                <span className="text-[11px]" style={{ color: "var(--theme-muted)" }}>
                  Testing only
                </span>
              </div>
            )}
          </div>
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
