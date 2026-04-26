"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Search, FileCheck } from "lucide-react";

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

// Static preview from fixture — rendered server-style (no fetch)
const PREVIEW = {
  domain: "stripe.com",
  company: "Stripe, Inc.",
  grade: "A",
  score: 96,
  headline: "Best-in-class operator, trust justified",
  dimensions: [
    { label: "Business Legitimacy", grade: "A+", score: 99 },
    { label: "Online Reputation", grade: "B+", score: 88 },
    { label: "Longevity & Stability", grade: "A+", score: 97 },
    { label: "Transparency", grade: "A+", score: 95 },
    { label: "Technical Health", grade: "A+", score: 98 },
    { label: "Content Quality", grade: "A", score: 92 },
    { label: "Social Presence", grade: "A", score: 91 },
    { label: "Financial Signals", grade: "A+", score: 97 },
  ],
  sources: 47,
};

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#3dd598";
  if (grade.startsWith("B")) return "#38bdf8";
  if (grade.startsWith("C")) return "#f7b21b";
  if (grade.startsWith("D")) return "#fb923c";
  return "#f87171";
}

function ScanForm() {
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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--theme-muted)" }}
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter any domain — e.g. stripe.com"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm transition-all outline-none"
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
          className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--theme-accent)",
            color: "var(--theme-accent-foreground)",
          }}
        >
          {loading ? "Redirecting…" : "Get Report · $1"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs" style={{ color: "var(--theme-danger)" }}>
          {error}
        </p>
      )}
    </form>
  );
}

function ReportPreviewCard() {
  const overallColor = gradeColor(PREVIEW.grade);

  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-md"
      style={{
        border: "1px solid var(--theme-border)",
        backgroundColor: "var(--theme-panel)",
        boxShadow: "var(--theme-shadow)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--theme-border)" }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--theme-muted)" }}>
            Live report · sample
          </p>
          <p className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
            {PREVIEW.domain}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--theme-muted)" }}>
            {PREVIEW.company}
          </p>
        </div>
        {/* Grade badge */}
        <div
          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${overallColor}15`,
            border: `1px solid ${overallColor}40`,
          }}
        >
          <span
            className="font-mono font-bold leading-none text-2xl"
            style={{ color: overallColor, letterSpacing: "-0.02em" }}
          >
            {PREVIEW.grade}
          </span>
          <span className="font-mono text-xs mt-0.5" style={{ color: "var(--theme-muted)" }}>
            {PREVIEW.score}
          </span>
        </div>
      </div>

      {/* Headline */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <p className="text-xs italic" style={{ color: "var(--theme-muted)" }}>
          &ldquo;{PREVIEW.headline}&rdquo;
        </p>
      </div>

      {/* Dimensions */}
      <div className="px-5 py-4 space-y-2.5">
        {PREVIEW.dimensions.slice(0, 6).map((dim) => {
          const color = gradeColor(dim.grade);
          return (
            <div key={dim.label} className="flex items-center gap-3">
              <span
                className="font-mono text-xs font-bold w-7 text-right flex-shrink-0"
                style={{ color }}
              >
                {dim.grade}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "color-mix(in srgb, var(--theme-border) 80%, transparent)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${dim.score}%`, backgroundColor: color, opacity: 0.7 }}
                  />
                </div>
              </div>
              <span
                className="text-xs font-mono w-7 flex-shrink-0"
                style={{ color: "var(--theme-muted)" }}
              >
                {dim.score}
              </span>
              <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "var(--theme-muted)", width: "9rem" }}>
                {dim.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--theme-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
          {PREVIEW.sources} sources · 10 searches
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: `${overallColor}15`,
            color: overallColor,
            border: `1px solid ${overallColor}30`,
          }}
        >
          A grade
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--theme-border)" }}
      >
        <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--theme-foreground)" }}>
          WebsiteCreditScore.com
        </span>
        <div className="flex items-center gap-5 text-xs" style={{ color: "var(--theme-muted)" }}>
          <a href="/benchmarks" className="hover:opacity-80 transition-opacity">Benchmarks</a>
          <a href="/docs" className="hover:opacity-80 transition-opacity">Docs</a>
          <a href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
          <a
            href="mailto:hello@websitecreditscore.com"
            className="hover:opacity-80 transition-opacity hidden sm:inline"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* Hero — split layout */}
      <section className="flex-1 relative overflow-hidden">
        {/* Ambient amber glow top-left */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top left, color-mix(in srgb, var(--theme-glow) 18%, transparent), transparent 65%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — headline + form */}
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
              style={{
                border: "1px solid var(--theme-border)",
                backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)",
                color: "var(--theme-muted)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--theme-accent)" }}
              />
              Powered by Claude AI · 8–10 live web searches per scan
            </div>

            <h1
              className="font-display text-[clamp(2.8rem,6vw,4.5rem)] leading-[0.96]"
              style={{ color: "var(--theme-foreground)" }}
            >
              Is this website{" "}
              <span style={{ color: "var(--theme-accent)" }}>actually legit?</span>
            </h1>

            <p
              className="text-base leading-relaxed max-w-md"
              style={{ color: "var(--theme-muted)" }}
            >
              Deep AI research across 8 dimensions — legitimacy, reputation, financial
              signals, technical health, and more. Graded A+ to F with cited evidence.
              Results in ~90 seconds.
            </p>

            <ScanForm />

            <p className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}>
              One-time · $1 per report · Refunded automatically if the scan fails
            </p>

            {/* Mini trust row */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: Shield, text: "8 scored dimensions" },
                { icon: Search, text: "Live web research" },
                { icon: FileCheck, text: "Cited sources" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--theme-muted)" }}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--theme-accent)" }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — static report preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}
              >
                Sample output
              </p>
              <ReportPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-14"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-display text-3xl mb-10 text-center"
            style={{ color: "var(--theme-foreground)" }}
          >
            What you get for $1
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Enter any domain",
                body: "No account needed. Just paste the URL and pay $1 via Stripe.",
              },
              {
                step: "02",
                title: "AI runs 8–10 searches",
                body: "Claude searches reviews, complaints, news, BBB, Reddit, LinkedIn, funding records, and security history.",
              },
              {
                step: "03",
                title: "Get a graded report",
                body: "8 scored dimensions, A+ to F letter grades, red & green flags, and 12+ cited sources — all in ~90 seconds.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-xl p-6 space-y-3"
                style={{
                  border: "1px solid var(--theme-border)",
                  backgroundColor: "var(--theme-panel)",
                }}
              >
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: "var(--theme-accent)" }}
                >
                  {step}
                </span>
                <h3 className="text-base font-semibold" style={{ color: "var(--theme-foreground)" }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dimensions grid */}
      <section className="px-6 py-14" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-display text-3xl mb-2 text-center"
            style={{ color: "var(--theme-foreground)" }}
          >
            Eight dimensions. One verdict.
          </h2>
          <p
            className="text-sm text-center mb-10"
            style={{ color: "var(--theme-muted)" }}
          >
            Each dimension is weighted and scored 0–100 based on live evidence — not guesswork.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "Legitimacy", weight: "25%" },
              { key: "Reputation", weight: "20%" },
              { key: "Longevity", weight: "12%" },
              { key: "Transparency", weight: "12%" },
              { key: "Technical", weight: "10%" },
              { key: "Content", weight: "8%" },
              { key: "Social", weight: "8%" },
              { key: "Financial", weight: "5%" },
            ].map(({ key, weight }) => (
              <div
                key={key}
                className="rounded-xl p-4 text-center space-y-1"
                style={{
                  border: "1px solid var(--theme-border)",
                  backgroundColor: "var(--theme-panel)",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                  {key}
                </p>
                <p
                  className="font-mono text-xs font-semibold"
                  style={{ color: "var(--theme-accent)" }}
                >
                  {weight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 text-center"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-xl mx-auto space-y-6">
          <h2
            className="font-display text-4xl"
            style={{ color: "var(--theme-foreground)" }}
          >
            Trust nothing. Verify everything.
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Before you buy, partner, or hire — know what the AI finds. $1, no account required.
          </p>
          <ScanForm />
        </div>
      </section>

      <footer
        className="px-6 py-6 text-center text-xs"
        style={{
          borderTop: "1px solid var(--theme-border)",
          color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
          <a href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</a>
          <a href="/terms" className="hover:opacity-80 transition-opacity">Terms</a>
          <a href="/cookies" className="hover:opacity-80 transition-opacity">Cookies</a>
          <a href="/benchmarks" className="hover:opacity-80 transition-opacity">Benchmarks</a>
        </div>
        WebsiteCreditScore · Not financial advice · Reports reflect AI research at time of scan
      </footer>
    </main>
  );
}
