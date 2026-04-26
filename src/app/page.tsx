"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Zap, Search, Star } from "lucide-react";

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);

    try {
      const domain = normalizeUrl(url);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }

      const { checkoutUrl } = await res.json();
      router.push(checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--theme-border)" }}
      >
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--theme-foreground)", fontFamily: "var(--theme-font-sans-stack)" }}
        >
          WebsiteCreditScore
        </span>
        <div className="flex items-center gap-6 text-xs" style={{ color: "var(--theme-muted)" }}>
          <a href="/benchmarks" className="hover:opacity-80 transition-opacity">Benchmarks</a>
          <a href="mailto:hello@websitecreditscore.com" className="hover:opacity-80 transition-opacity">
            Contact
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative noise-overlay overflow-hidden"
      >
        {/* Amber glow ring */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: "conic-gradient(from 0deg, #f7b21b, #ffcf66, #f7b21b, #3dd598, #f7b21b)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
            style={{
              border: "1px solid var(--theme-border)",
              backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)",
              color: "var(--theme-muted)",
            }}
          >
            <Zap className="w-3 h-3" style={{ color: "var(--theme-accent)" }} />
            Powered by Claude AI · 10 live web searches per scan
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            style={{ color: "var(--theme-foreground)" }}
          >
            A Credit Score for
            <br />
            <span style={{ color: "var(--theme-accent)" }}>Any Website</span>
          </h1>

          <p className="text-lg max-w-md mx-auto" style={{ color: "var(--theme-muted)" }}>
            Deep AI research across 8 dimensions — business legitimacy, reputation,
            technical health, and more. Graded A+ to F with cited evidence.
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--theme-muted)" }}
                />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="stripe.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all outline-none"
                  style={{
                    backgroundColor: "var(--theme-panel)",
                    border: "1px solid var(--theme-border)",
                    color: "var(--theme-foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--theme-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--theme-border)")}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-5 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--theme-accent)",
                  color: "var(--theme-accent-foreground)",
                }}
              >
                {loading ? "Redirecting…" : "Get Report · $1"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-left" style={{ color: "var(--theme-danger)" }}>
                {error}
              </p>
            )}
          </form>

          <p className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}>
            One-time payment · Instant report · Refunded if scan fails
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section
        className="px-6 py-12"
        style={{ borderTop: "1px solid var(--theme-border)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <Shield className="w-5 h-5 mx-auto" style={{ color: "var(--theme-accent)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
              8 Research Dimensions
            </p>
            <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
              Legitimacy, reputation, longevity, transparency, technical health, content, social, financial
            </p>
          </div>
          <div className="space-y-2">
            <Search className="w-5 h-5 mx-auto" style={{ color: "var(--theme-accent)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
              Live Web Research
            </p>
            <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
              10 targeted searches: reviews, complaints, news, BBB, Reddit, founders, funding, security
            </p>
          </div>
          <div className="space-y-2">
            <Star className="w-5 h-5 mx-auto" style={{ color: "var(--theme-accent)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
              Cited Evidence
            </p>
            <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
              Every finding backed by a real URL — no hallucinations, no vague AI summaries
            </p>
          </div>
        </div>
      </section>

      {/* Sample grade card */}
      <section
        className="px-6 py-12"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest mb-6 text-center"
            style={{ color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}
          >
            Sample Report
          </p>
          <div
            className="rounded-xl p-6 flex flex-col sm:flex-row items-start gap-6"
            style={{
              border: "1px solid var(--theme-border)",
              backgroundColor: "var(--theme-panel)",
            }}
          >
            <div
              className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-xl"
              style={{
                backgroundColor: "var(--theme-background)",
                border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)",
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{ color: "var(--theme-accent)", letterSpacing: "-0.02em" }}
              >
                A
              </span>
              <span className="text-sm" style={{ color: "var(--theme-muted)" }}>96</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "var(--theme-foreground)" }}>stripe.com</p>
              <p className="text-sm mt-1" style={{ color: "var(--theme-muted)" }}>
                Best-in-class operator, trust justified
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}
              >
                47 sources · Scanned Apr 25, 2026
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["Legitimacy", "A+"],
                  ["Reputation", "B+"],
                  ["Technical", "A+"],
                  ["Financial", "A"],
                ].map(([label, grade]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs"
                    style={{
                      border: "1px solid var(--theme-border)",
                      backgroundColor: "color-mix(in srgb, var(--theme-elevated) 60%, transparent)",
                    }}
                  >
                    <span style={{ color: "var(--theme-muted)" }}>{label}</span>
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      {grade}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="px-6 py-6 text-center text-xs"
        style={{
          borderTop: "1px solid var(--theme-border)",
          color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)",
        }}
      >
        WebsiteCreditScore · Not financial advice · Reports reflect AI research at time of scan
      </footer>
    </main>
  );
}
