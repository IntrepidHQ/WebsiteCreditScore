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
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold tracking-tight text-white">
          WebsiteCreditScore
        </span>
        <a
          href="mailto:hello@websitecreditscore.com"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Contact
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative noise-overlay overflow-hidden">
        {/* Conic gradient ring behind the headline */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, #4ade80, #38bdf8, #facc15, #f87171, #4ade80)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-400">
            <Zap className="w-3 h-3 text-[#4ade80]" />
            Powered by Claude AI · 10 live web searches per scan
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            A Credit Score for
            <br />
            <span className="text-[#4ade80]">Any Website</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Deep AI research across 8 dimensions — business legitimacy, reputation,
            technical health, and more. Graded A+ to F with cited evidence.
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="stripe.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111114] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#4ade80]/50 focus:border-[#4ade80]/30 text-sm transition-all"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-5 py-3 rounded-lg bg-[#4ade80] text-black font-semibold text-sm hover:bg-[#4ade80]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {loading ? "Redirecting…" : "Get Report · $1"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-red-400 text-left">{error}</p>
            )}
          </form>

          <p className="text-xs text-zinc-600">
            One-time payment · Instant report · Refunded if scan fails
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t border-white/5 px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <Shield className="w-5 h-5 text-[#4ade80] mx-auto" />
            <p className="text-sm font-medium">8 Research Dimensions</p>
            <p className="text-xs text-zinc-500">
              Legitimacy, reputation, longevity, transparency, technical health, content, social, financial
            </p>
          </div>
          <div className="space-y-2">
            <Search className="w-5 h-5 text-[#38bdf8] mx-auto" />
            <p className="text-sm font-medium">Live Web Research</p>
            <p className="text-xs text-zinc-500">
              10 targeted searches: reviews, complaints, news, BBB, Reddit, founders, funding, security
            </p>
          </div>
          <div className="space-y-2">
            <Star className="w-5 h-5 text-[#facc15] mx-auto" />
            <p className="text-sm font-medium">Cited Evidence</p>
            <p className="text-xs text-zinc-500">
              Every finding backed by a real URL — no hallucinations, no vague AI summaries
            </p>
          </div>
        </div>
      </section>

      {/* Sample grade card */}
      <section className="border-t border-white/5 px-6 py-12 bg-[#0D0D0F]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-6 text-center">
            Sample Report
          </p>
          <div className="rounded-xl border border-white/5 bg-[#111114] p-6 flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-xl bg-[#0A0A0B] border border-[#4ade80]/20">
              <span className="font-mono text-3xl font-bold text-[#4ade80]" style={{ letterSpacing: "-0.02em" }}>
                A
              </span>
              <span className="font-mono text-sm text-zinc-400">96</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">stripe.com</p>
              <p className="text-sm text-zinc-400 mt-1">
                Best-in-class operator, trust justified
              </p>
              <p className="text-xs text-zinc-600 mt-2">47 sources · Scanned Apr 25, 2026</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["Legitimacy", "A+", "#4ade80"],
                  ["Reputation", "B+", "#38bdf8"],
                  ["Technical", "A+", "#4ade80"],
                  ["Financial", "A", "#4ade80"],
                ].map(([label, grade, color]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs"
                  >
                    {label}
                    <span className="font-mono font-semibold" style={{ color }}>
                      {grade}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-zinc-600">
        WebsiteCreditScore · Not financial advice · Reports reflect AI research at time of scan
      </footer>
    </main>
  );
}
