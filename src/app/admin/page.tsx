import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { getAdminDashboard } from "@/lib/admin/queries";
import { isAdminRequest, ADMIN_COOKIE } from "@/lib/admin/auth";
import { tierLabel } from "@/lib/pricing";
import type { Tier, TierMode } from "@/lib/pricing";
import { SpHandoffButton } from "./SpHandoffButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Lead Intelligence",
  robots: { index: false, follow: false },
};

const card = {
  border: "1px solid var(--theme-border)",
  backgroundColor: "var(--theme-panel)",
} as const;

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={card}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>
        {label}
      </p>
      <p className="font-score mt-2 text-3xl" style={{ color: accent ? "var(--theme-accent)" : "var(--theme-foreground)" }}>
        {value}
      </p>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; days?: string }>;
}) {
  const { token, days } = await searchParams;

  // Persist a presented token to an httpOnly cookie, then strip it from the URL.
  if (token && token === process.env.ADMIN_TOKEN) {
    const store = await cookies();
    store.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/admin");
  }

  const allowed = await isAdminRequest(token);
  if (!allowed) {
    return (
      <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
        <NavBar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-sm space-y-3 text-center">
            <h1 className="font-semibold" style={{ color: "var(--theme-foreground)" }}>
              Admin access required
            </h1>
            <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
              Sign in with an allowlisted email, or append <code>?token=…</code> with your admin token.
            </p>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const windowDays = Number.parseInt(days ?? "30", 10) || 30;
  const data = await getAdminDashboard(windowDays).catch((err) => {
    console.error("[admin]", err);
    return null;
  });

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <NavBar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-accent)" }}>
            Lead Intelligence · last {windowDays} days
          </p>
          <h1 className="font-display mt-2" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", color: "var(--theme-foreground)" }}>
            Who scanned, what they scanned, who to pitch
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--theme-muted)" }}>
            The $1 scan is a loss-leader. Its value is the intelligence below — the qualified leads to move into the
            strategypresentation.com flow.
          </p>
        </div>

        {!data ? (
          <div className="rounded-2xl p-8 text-center" style={{ ...card, borderStyle: "dashed" }}>
            <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
              Could not load dashboard data. Confirm Supabase env vars and that the funnel-enrichment migration has been
              applied.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── Funnel ─────────────────────────────────────────────── */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Total scans" value={String(data.funnel.totalScans)} />
              <Stat label="Completed" value={String(data.funnel.completed)} />
              <Stat label="Failed" value={String(data.funnel.failed)} />
              <Stat label="Paid scans" value={String(data.funnel.paid)} accent />
              <Stat label="Emails captured" value={String(data.funnel.capturedEmails)} accent />
              <Stat label="Unique domains" value={String(data.funnel.uniqueDomains)} />
              <Stat label="Avg score" value={data.funnel.avgScore != null ? data.funnel.avgScore.toFixed(1) : "—"} />
              <Stat
                label="Avg scan time"
                value={data.funnel.avgDurationSec != null ? `${data.funnel.avgDurationSec}s` : "—"}
              />
              <Stat label="Free / wallet" value={String(data.funnel.free)} />
              <Stat
                label="AI cost (30d)"
                value={`$${(data.funnel.totalCostCents / 100).toFixed(2)}`}
              />
            </section>

            {/* ── SP handoff candidates (the point) ──────────────────── */}
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: "var(--theme-accent)" }}>
                Strategy Presentation candidates
              </h2>
              <p className="mb-4 text-sm" style={{ color: "var(--theme-muted)" }}>
                Completed scans with a captured email and real redesign upside (low score / red flags), best leads first.
              </p>
              <div className="overflow-hidden rounded-2xl" style={card}>
                {data.spCandidates.length === 0 ? (
                  <p className="p-6 text-sm" style={{ color: "var(--theme-muted)" }}>
                    No qualified candidates yet. They appear once free scans with verified emails complete.
                  </p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr style={{ color: "var(--theme-muted)" }} className="text-[11px] uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">Domain</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Score</th>
                        <th className="px-4 py-3 font-semibold">Biggest gap</th>
                        <th className="px-4 py-3 font-semibold">Flags</th>
                        <th className="px-4 py-3 font-semibold">Report</th>
                        <th className="px-4 py-3 font-semibold">Handoff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.spCandidates.map((c) => (
                        <tr key={c.id} style={{ borderTop: "1px solid var(--theme-border)" }}>
                          <td className="px-4 py-3 font-medium" style={{ color: "var(--theme-foreground)" }}>{c.domain}</td>
                          <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{c.email}</td>
                          <td className="px-4 py-3 font-score" style={{ color: "var(--theme-foreground)" }}>
                            {c.score != null ? (c.score / 10).toFixed(1) : "—"} <span style={{ color: "var(--theme-muted)" }}>{c.grade}</span>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>
                            {c.weakestLabel} ({(c.weakestScore / 10).toFixed(1)})
                          </td>
                          <td className="px-4 py-3" style={{ color: c.redFlags > 0 ? "#f87171" : "var(--theme-muted)" }}>{c.redFlags}</td>
                          <td className="px-4 py-3">
                            <a href={`/scan/${c.id}`} className="font-semibold hover:underline" style={{ color: "var(--theme-accent)" }}>
                              open →
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <SpHandoffButton scanId={c.id} domain={c.domain} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* ── Tier mix + sources ─────────────────────────────────── */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: "var(--theme-accent)" }}>
                  Tier mix
                </h2>
                <div className="overflow-hidden rounded-2xl" style={card}>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr style={{ color: "var(--theme-muted)" }} className="text-[11px] uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold">Count</th>
                        <th className="px-4 py-3 font-semibold">Avg AI cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byTier.map((t) => (
                        <tr key={`${t.tier}_${t.mode}`} style={{ borderTop: "1px solid var(--theme-border)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--theme-foreground)" }}>
                            {tierLabel(t.tier as Tier, t.mode as TierMode)}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--theme-foreground)" }}>{t.count}</td>
                          <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>${(t.avgCostCents / 100).toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: "var(--theme-accent)" }}>
                  Acquisition source
                </h2>
                <div className="overflow-hidden rounded-2xl" style={card}>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr style={{ color: "var(--theme-muted)" }} className="text-[11px] uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">utm_source / referrer</th>
                        <th className="px-4 py-3 font-semibold">Scans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topUtm.map((u) => (
                        <tr key={u.source} style={{ borderTop: "1px solid var(--theme-border)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--theme-foreground)" }}>{u.source}</td>
                          <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{u.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── Recent scans ───────────────────────────────────────── */}
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: "var(--theme-accent)" }}>
                Recent scans
              </h2>
              <div className="overflow-hidden rounded-2xl" style={card}>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ color: "var(--theme-muted)" }} className="text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold">Domain</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Grade</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentScans.map((s) => (
                      <tr key={s.id} style={{ borderTop: "1px solid var(--theme-border)" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--theme-foreground)" }}>
                          <a href={`/scan/${s.id}`} className="hover:underline">{s.domain}</a>
                        </td>
                        <td className="px-4 py-3" style={{ color: s.status === "error" ? "#f87171" : "var(--theme-muted)" }}>{s.status}</td>
                        <td className="px-4 py-3" style={{ color: "var(--theme-foreground)" }}>{s.grade ?? "—"}</td>
                        <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>{s.email ?? "—"}</td>
                        <td className="px-4 py-3" style={{ color: "var(--theme-muted)" }}>
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
