import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getRecentScans } from "@/lib/db/scans";
import { isAdmin } from "@/lib/admin";
import { PromoteButton } from "./promote-button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ScansPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [scans, admin] = await Promise.all([
    getRecentScans(PAGE_SIZE + 1, offset).catch(() => []),
    isAdmin(),
  ]);
  const hasMore = scans.length > PAGE_SIZE;
  const visible = scans.slice(0, PAGE_SIZE);

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      <div className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
            style={{ color: "var(--theme-muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--theme-foreground)" }}
          >
            All Scans
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--theme-muted)" }}>
            Public credibility reports — newest first.
          </p>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ border: "1px dashed var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
          >
            <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
              No scans yet.{" "}
              <Link href="/" style={{ color: "var(--theme-accent)" }}>
                Run the first one →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {visible.map((scan) => {
              const color = scan.grade.startsWith("A")
                ? "#4ade80"
                : scan.grade.startsWith("B")
                ? "#60a5fa"
                : scan.grade.startsWith("C")
                ? "#facc15"
                : "#f87171";
              return (
                <a
                  key={scan.id}
                  href={`/scan/${scan.id}`}
                  className="group overflow-hidden rounded-[1.75rem] border transition-opacity hover:opacity-90"
                  style={{
                    borderColor: "var(--theme-border)",
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--theme-panel) 92%, transparent), color-mix(in srgb, var(--theme-background) 60%, var(--theme-panel)))",
                  }}
                >
                  <div className="relative p-5">
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70"
                      style={{
                        background: `radial-gradient(circle at top right, ${color}30, transparent 60%)`,
                      }}
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${scan.domain}&sz=64`}
                          alt=""
                          width={38}
                          height={38}
                          className="rounded-xl ring-1 ring-white/10"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                            {scan.domain}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>
                            {scan.sources} sources · {scan.red_flags} risk signals
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-score leading-none" style={{ color, fontSize: "2.6rem" }}>{scan.grade}</div>
                        <div className="font-score text-sm mt-1" style={{ color: "var(--theme-muted)" }}>{scan.score}</div>
                      </div>
                    </div>

                    <div className="relative mt-6">
                      <h3 className="font-display text-3xl leading-[1.02]" style={{ color: "var(--theme-foreground)" }}>
                        {scan.headline}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                        {scan.one_liner}
                      </p>
                    </div>

                    <div className="relative mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border p-3" style={{ borderColor: "var(--theme-border)", backgroundColor: "rgba(14,14,7,0.45)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#4ade80" }}>Strongest</p>
                        <p className="mt-2 truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{scan.strongest_label}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${scan.strongest_score}%`, backgroundColor: "#4ade80" }} />
                        </div>
                      </div>
                      <div className="rounded-2xl border p-3" style={{ borderColor: "var(--theme-border)", backgroundColor: "rgba(14,14,7,0.45)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#facc15" }}>Gap</p>
                        <p className="mt-2 truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{scan.weakest_label}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${scan.weakest_score}%`, backgroundColor: "#facc15" }} />
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-5 flex items-center justify-between gap-3">
                      <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--theme-accent)" }}>
                        Open report <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    {admin ? (
                      <PromoteButton
                        scanId={scan.id}
                        domain={scan.domain}
                        defaultName={scan.domain}
                      />
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {!admin ? (
          <div className="mt-10 text-center">
            <Link
              href={`/admin/login?next=${encodeURIComponent(`/scans?page=${page}`)}`}
              className="text-xs"
              style={{ color: "var(--theme-muted)" }}
            >
              Admin sign in
            </Link>
          </div>
        ) : null}

        {/* Pagination */}
        {(page > 1 || hasMore) && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/scans?page=${page - 1}`}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: "var(--theme-border)",
                  backgroundColor: "var(--theme-panel)",
                  color: "var(--theme-foreground)",
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </Link>
            )}
            <span className="text-sm" style={{ color: "var(--theme-muted)" }}>
              Page {page}
            </span>
            {hasMore && (
              <Link
                href={`/scans?page=${page + 1}`}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: "var(--theme-border)",
                  backgroundColor: "var(--theme-panel)",
                  color: "var(--theme-foreground)",
                }}
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
