"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { BUNDLE_SIZE, type Tier, type TierMode } from "@/lib/pricing";

async function startCheckout(tier: Tier, mode: TierMode, quantity: number) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier, mode, quantity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Checkout failed");
  }
  const { checkoutUrl } = await res.json();
  if (typeof checkoutUrl === "string") {
    window.location.href = checkoutUrl;
  }
}

const tierTitle = (id: string, mode: TierMode): string => {
  if (mode === "max") {
    if (id === "quick") return "Trench";
    if (id === "standard") return "Mantle";
    return "Core";
  }
  if (id === "quick") return "Aerial Scan";
  if (id === "standard") return "Surface Scan";
  return "Deep Scan";
};

const TIERS = [
  {
    id: "quick",
    color: "#60a5fa",
    badge: null,
    standard: { price: 1,  searches: 8,   bundlePrice: 8,  bundleSave: 2 },
    max:      { price: 10, searches: 50,  bundlePrice: 80, bundleSave: 20 },
    features: (mode: TierMode) => [
      `${mode === "max" ? "50" : "8"} live web searches`,
      "10 scored dimensions",
      "A+ to F letter grades",
      "Red & green flags",
      `${mode === "max" ? "50+" : "12+"} cited sources`,
      "Shareable report URL",
    ],
    best: "Fast due diligence on any domain. Answer the basic question: is this business real and credible?",
  },
  {
    id: "standard",
    color: "#f7b21b",
    badge: "Most popular",
    standard: { price: 3,  searches: 14,  bundlePrice: 25, bundleSave: 5 },
    max:      { price: 20, searches: 100, bundlePrice: 175, bundleSave: 25 },
    features: (mode: TierMode) => [
      `${mode === "max" ? "100" : "14"} live web searches`,
      "10 scored dimensions",
      "A+ to F letter grades",
      "Red & green flags",
      `${mode === "max" ? "80+" : "20+"} cited sources`,
      "Competitor comparison",
      "Company timeline",
      "Executive summary",
      "Shareable report URL",
    ],
    best: "The go-to scan for vendor vetting, competitor analysis, or preparing a pitch. Covers more ground with a richer evidence trail.",
  },
  {
    id: "deep",
    color: "#4ade80",
    badge: "Most thorough",
    standard: { price: 6,  searches: 20,  bundlePrice: 50,  bundleSave: 10 },
    max:      { price: 40, searches: 200, bundlePrice: 350, bundleSave: 50 },
    features: (mode: TierMode) => [
      `${mode === "max" ? "200" : "20"} live web searches`,
      "10 scored dimensions",
      "A+ to F letter grades",
      "Red & green flags",
      `${mode === "max" ? "150+" : "30+"} cited sources`,
      "Competitor comparison",
      "Company timeline",
      "Executive summary",
      "Regulatory & legal search",
      "Press & media deep dive",
      "Shareable report URL",
    ],
    best: "For high-stakes decisions: before signing a contract, choosing a key supplier, or evaluating a merger target. The most exhaustive evidence trail available.",
  },
];

const faq = [
  {
    q: "What's the difference between scan depths?",
    a: "Each tier runs more web searches, pulling from more sources and covering more ground. An Aerial Scan answers “is this real and credible?” A Deep Scan covers regulatory filings, press archives, legal history, and extended competitor context.",
  },
  {
    q: "What is MAX mode?",
    a: "MAX mode runs significantly more searches — 50, 100, or 200 depending on the tier — for the most comprehensive evidence trail possible. Use it for high-stakes due diligence where thoroughness matters more than speed.",
  },
  {
    q: "Do bundle credits expire?",
    a: "No. Bundle credits are stored against your order and can be redeemed any time — no expiry, no subscription.",
  },
  {
    q: "Can I use bundle credits on any domain?",
    a: "Yes. Each credit runs one scan at that tier level on any publicly accessible domain.",
  },
  {
    q: "What if a scan fails?",
    a: "If the AI fails to produce a report, you are automatically refunded. Refunds process within 5 business days via Stripe.",
  },
  {
    q: "Is there a free tier?",
    a: "No — every scan uses real AI compute and live web searches. $1 is the minimum viable price to cover the cost of a quality result.",
  },
  {
    q: "Do you offer agency or enterprise pricing?",
    a: "Email hello@websitecreditscore.com for volume pricing above 50 scans/month.",
  },
];

export default function PricingPage() {
  const [mode, setMode] = useState<TierMode>("standard");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buy = async (tier: Tier, quantity: number) => {
    const id = `${tier}-${quantity}`;
    setPendingId(id);
    setError(null);
    try {
      await startCheckout(tier, mode, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setPendingId(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      {/* Hero */}
      <section className="px-6 py-16 text-center" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-2xl mx-auto space-y-5">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
            style={{ border: "1px solid var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)", color: "var(--theme-muted)" }}
          >
            Simple, pay-per-scan pricing
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "var(--theme-foreground)" }}>
            One scan. One price.
            <br />
            <span style={{ color: "var(--theme-accent)" }}>No subscription.</span>
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--theme-muted)" }}>
            Choose how deep you want to go. Every tier includes all 10 scored dimensions, letter grades, and cited sources — the difference is how many searches the AI runs.
          </p>

          {/* MAX mode toggle */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="text-sm font-medium" style={{ color: mode === "standard" ? "var(--theme-foreground)" : "var(--theme-muted)" }}>
              Standard
            </span>
            <button
              onClick={() => setMode(mode === "standard" ? "max" : "standard")}
              className="relative w-12 h-6 rounded-full transition-all duration-200"
              style={{ backgroundColor: mode === "max" ? "var(--theme-accent)" : "var(--theme-border)" }}
              aria-label="Toggle MAX mode"
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
            <span className="text-sm font-bold" style={{ color: mode === "max" ? "var(--theme-accent)" : "var(--theme-muted)" }}>
              MAX
            </span>
            {mode === "max" && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(247,178,27,0.15)", color: "var(--theme-accent)", border: "1px solid rgba(247,178,27,0.3)" }}
              >
                50–200 searches
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="px-6 py-16" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const data = tier[mode];
            const feats = tier.features(mode);
            return (
              <div
                key={tier.id}
                className="rounded-2xl p-6 flex flex-col gap-5 relative"
                style={{
                  border: `1px solid ${tier.badge ? tier.color + "40" : "var(--theme-border)"}`,
                  backgroundColor: tier.badge ? `color-mix(in srgb, var(--theme-panel) 80%, ${tier.color}08)` : "var(--theme-panel)",
                }}
              >
                {tier.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: tier.color, color: "#0e0e07" }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: tier.color }}>
                      {tierTitle(tier.id, mode)}
                    </p>
                    {mode === "max" && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(247,178,27,0.15)", color: "var(--theme-accent)" }}
                      >
                        MAX
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-score font-bold" style={{ color: "var(--theme-foreground)" }}>
                      ${data.price}
                    </span>
                    <span className="text-sm" style={{ color: "var(--theme-muted)" }}>/ report</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--theme-muted)" }}>
                    {data.searches} live web searches
                  </p>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {tier.best}
                </p>

                <ul className="space-y-2 flex-1">
                  {feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: tier.color }} />
                      <span style={{ color: "var(--theme-foreground)" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => buy(tier.id as Tier, 1)}
                  disabled={pendingId !== null}
                  className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
                  style={tier.badge
                    ? { backgroundColor: tier.color, color: "#0e0e07" }
                    : { border: `1px solid ${tier.color}`, color: tier.color, backgroundColor: `${tier.color}10` }
                  }
                >
                  {pendingId === `${tier.id}-1` ? "Redirecting…" : `Get ${tierTitle(tier.id, mode)} · $${data.price}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bundle packs */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-center mb-2" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--theme-foreground)" }}>
            Bundle packs · 10 scans
          </h2>
          <p className="text-sm text-center mb-10" style={{ color: "var(--theme-muted)" }}>
            Credits never expire. Use on any domain, any time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const data = tier[mode];
              return (
                <div
                  key={tier.id}
                  className="rounded-2xl p-6 space-y-4"
                  style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: tier.color }}>
                      {tierTitle(tier.id, mode)}{mode === "max" ? " MAX" : ""} × 10
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-score font-bold" style={{ color: "var(--theme-foreground)" }}>
                        ${data.bundlePrice}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: `${tier.color}18`, color: tier.color }}
                      >
                        Save ${data.bundleSave}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--theme-muted)" }}>
                      ${(data.bundlePrice / 10).toFixed(2)} per scan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => buy(tier.id as Tier, BUNDLE_SIZE)}
                    disabled={pendingId !== null}
                    className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
                    style={{ border: `1px solid ${tier.color}`, color: tier.color, backgroundColor: `${tier.color}10` }}
                  >
                    {pendingId === `${tier.id}-${BUNDLE_SIZE}` ? "Redirecting…" : `Buy 10-pack · $${data.bundlePrice}`}
                  </button>
                </div>
              );
            })}
          </div>
          {error && (
            <p className="text-xs text-center mt-4" style={{ color: "#f87171" }}>{error}</p>
          )}
          <p className="text-xs text-center mt-6" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
            Credits never expire · Lost cookies? <a href="/restore" className="underline underline-offset-2 hover:opacity-80">Restore credits</a>
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 py-16" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-8 text-center" style={{ color: "var(--theme-foreground)" }}>
            What&rsquo;s included
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--theme-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--theme-panel)", borderBottom: "1px solid var(--theme-border)" }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "var(--theme-muted)" }}>Feature</th>
                  {TIERS.map((t) => (
                    <th key={t.id} className="px-5 py-3 text-center text-xs font-semibold" style={{ color: t.color }}>
                      {tierTitle(t.id, mode)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Web searches",
                    mode === "max" ? "50" : "8",
                    mode === "max" ? "100" : "14",
                    mode === "max" ? "200" : "20"],
                  ["10 scored dimensions", "✓", "✓", "✓"],
                  ["A+ to F letter grades", "✓", "✓", "✓"],
                  ["Red & green flags", "✓", "✓", "✓"],
                  ["Cited sources",
                    mode === "max" ? "50+" : "12+",
                    mode === "max" ? "80+" : "20+",
                    mode === "max" ? "150+" : "30+"],
                  ["Competitor comparison", "—", "✓", "✓"],
                  ["Company timeline", "—", "✓", "✓"],
                  ["Regulatory & legal search", "—", "—", "✓"],
                  ["Press deep dive", "—", "—", "✓"],
                  ["Shareable URL", "✓", "✓", "✓"],
                  ["Price",
                    `$${TIERS[0][mode].price}`,
                    `$${TIERS[1][mode].price}`,
                    `$${TIERS[2][mode].price}`],
                ].map(([feature, ...vals], i) => (
                  <tr
                    key={feature}
                    style={{
                      borderBottom: i < 10 ? "1px solid var(--theme-border)" : "none",
                      backgroundColor: i % 2 === 0 ? "var(--theme-panel)" : "var(--theme-background-alt)",
                    }}
                  >
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--theme-muted)" }}>{feature}</td>
                    {vals.map((val, j) => (
                      <td key={j} className="px-5 py-3 text-center text-xs font-mono" style={{ color: val === "—" ? "color-mix(in srgb, var(--theme-muted) 40%, transparent)" : "var(--theme-foreground)" }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-8" style={{ color: "var(--theme-foreground)" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faq.map(({ q, a }) => (
              <div key={q} className="rounded-xl p-5 space-y-2" style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
