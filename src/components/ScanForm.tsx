"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Tier = "quick" | "standard" | "deep";

const TIERS: { id: Tier; label: string; price: number }[] = [
  { id: "quick",    label: "Quick · $1", price: 1 },
  { id: "standard", label: "Scan · $3",  price: 3 },
  { id: "deep",     label: "Deep · $6",  price: 6 },
];

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export function ScanForm({
  large = false,
  defaultTier = "quick",
  showTierSelect = false,
}: {
  large?: boolean;
  defaultTier?: Tier;
  showTierSelect?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [tier, setTier] = useState<Tier>(defaultTier);
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
        body: JSON.stringify({ domain, tier }),
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
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      {showTierSelect && (
        <div
          className="flex w-full rounded-xl overflow-hidden text-xs font-semibold"
          style={{ border: "1px solid var(--theme-border)" }}
        >
          {TIERS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id)}
              className="flex-1 py-2.5 transition-all"
              style={{
                backgroundColor: tier === t.id ? "var(--theme-accent)" : "var(--theme-panel)",
                color: tier === t.id ? "var(--theme-accent-foreground)" : "var(--theme-muted)",
                borderRight: i < TIERS.length - 1 ? "1px solid var(--theme-border)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex items-stretch rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
      >
        <div className="flex items-center px-3 shrink-0" style={{ color: "var(--theme-muted)" }}>
          <span className="text-xs font-mono">https://</span>
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className={`flex-1 min-w-0 bg-transparent outline-none ${large ? "py-4 text-base" : "py-3 text-sm"}`}
          style={{ color: "var(--theme-foreground)" }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`px-5 font-semibold text-sm transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${large ? "py-4" : "py-3"}`}
          style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
        >
          {loading ? "…" : "Scan →"}
        </button>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
      )}
    </form>
  );
}
