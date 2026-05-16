"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { KeyRound, ExternalLink } from "lucide-react";

export default function RestorePage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/wallet/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not restore credits");
      }
      const { walletId } = await res.json();
      router.push(`/checkout/success?wallet=${walletId}&session_id=${encodeURIComponent(sessionId.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restore credits");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      <section className="px-6 py-20">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mx-auto"
              style={{ backgroundColor: "color-mix(in srgb, var(--theme-accent) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, var(--theme-border))" }}
            >
              <KeyRound className="w-6 h-6" style={{ color: "var(--theme-accent)" }} />
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(2.2rem, 4vw, 3.25rem)", color: "var(--theme-foreground)" }}>
              Restore your credits
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              If you cleared cookies or switched browsers, paste the Stripe session id from your receipt to bring your credits back to this device.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl p-6 space-y-4"
            style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
          >
            <div>
              <label htmlFor="sid" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--theme-muted)" }}>
                Stripe session id
              </label>
              <input
                id="sid"
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="cs_test_a1b2c3..."
                className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
                style={{
                  border: "1px solid var(--theme-border)",
                  backgroundColor: "var(--theme-background)",
                  color: "var(--theme-foreground)",
                }}
                autoComplete="off"
                spellCheck={false}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !sessionId.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              {submitting ? "Restoring…" : "Restore credits"}
            </button>

            {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
          </form>

          <div
            className="rounded-2xl p-5 text-sm space-y-2"
            style={{ border: "1px solid var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)" }}
          >
            <p className="font-semibold" style={{ color: "var(--theme-foreground)" }}>
              Where to find your session id
            </p>
            <p className="leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              Open the Stripe receipt email we sent you and click <span className="font-medium" style={{ color: "var(--theme-foreground)" }}>View receipt</span>. The URL contains your session id (it starts with{" "}
              <span className="font-mono" style={{ color: "var(--theme-accent)" }}>cs_</span>). Or save your{" "}
              <span style={{ color: "var(--theme-foreground)" }}>checkout success URL</span> next time you purchase — it works as a permanent recovery link.
            </p>
            <a
              href="mailto:websitecreditscore@gmail.com?subject=Help%20restoring%20credits"
              className="inline-flex items-center gap-1 text-xs underline underline-offset-2 mt-2"
              style={{ color: "var(--theme-accent)" }}
            >
              Email us if you can&rsquo;t find it <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
