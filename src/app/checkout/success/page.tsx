import { redirect } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckCircle2 } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  EMPTY_BALANCES,
  getWallet,
  getWalletBalances,
  totalCredits,
  type WalletBalances,
} from "@/lib/db/wallets";
import { tierLabel, type Tier, type TierMode } from "@/lib/pricing";
import { writeWalletCookie } from "@/lib/wallet-cookie";

export const dynamic = "force-dynamic";

const TIERS: Tier[] = ["quick", "standard", "deep"];
const MODES: TierMode[] = ["standard", "max"];

interface PageProps {
  searchParams: Promise<{ wallet?: string; session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const walletId = sp.wallet ?? null;
  const sessionId = sp.session_id ?? null;

  if (!walletId) {
    redirect("/");
  }

  let wallet: Awaited<ReturnType<typeof getWallet>> = null;
  let balances: WalletBalances = { ...EMPTY_BALANCES };
  try {
    wallet = await getWallet(walletId);
    if (wallet) {
      balances = await getWalletBalances(walletId);
      await writeWalletCookie(walletId);
    }
  } catch (err) {
    console.error("[checkout/success] failed to load wallet:", err);
  }

  const total = totalCredits(balances);
  const lines: { label: string; count: number }[] = [];
  for (const mode of MODES) {
    for (const tier of TIERS) {
      const count = balances[`${tier}_${mode}`];
      if (count > 0) lines.push({ label: tierLabel(tier, mode), count });
    }
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full"
            style={{ backgroundColor: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: "#86efac" }} />
          </div>

          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "var(--theme-foreground)" }}>
            Payment received.
          </h1>
          <p className="text-base" style={{ color: "var(--theme-muted)" }}>
            {wallet
              ? `Your credits are ready. ${total} ${total === 1 ? "credit" : "credits"} waiting on this device.`
              : "We couldn't find your wallet on this device. Try the recovery link below."}
          </p>

          {wallet && (
            <div
              className="rounded-2xl p-6 text-left"
              style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
            >
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--theme-accent)" }}>
                Credits available
              </p>
              {lines.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
                  Stripe is still processing the receipt webhook. Refresh in a few seconds.
                </p>
              ) : (
                <ul className="space-y-2">
                  {lines.map(({ label, count }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span style={{ color: "var(--theme-foreground)" }}>{label}</span>
                      <span className="font-mono font-semibold" style={{ color: "var(--theme-accent)" }}>
                        × {count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div
            className="rounded-2xl p-5 text-left text-sm"
            style={{
              border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, var(--theme-border))",
              backgroundColor: "color-mix(in srgb, var(--theme-accent) 4%, var(--theme-panel))",
            }}
          >
            <p className="font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>
              Don&rsquo;t lose your credits
            </p>
            <p className="leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              Credits are tied to this browser. To recover later, save this page&rsquo;s URL or use the{" "}
              <Link href="/restore" className="underline underline-offset-2" style={{ color: "var(--theme-accent)" }}>
                Restore credits
              </Link>{" "}
              page with your Stripe receipt session id
              {sessionId ? (
                <>
                  {" "}(<span className="font-mono text-xs">{sessionId}</span>)
                </>
              ) : null}
              .
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              Run a scan →
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ border: "1px solid var(--theme-border)", color: "var(--theme-foreground)" }}
            >
              Buy more
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
