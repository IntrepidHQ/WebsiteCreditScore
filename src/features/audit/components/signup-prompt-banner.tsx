import Link from "next/link";
import { ArrowRight, ScanSearch, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignupPromptBanner({
  reportTitle,
  returnPath,
}: {
  reportTitle: string;
  returnPath?: string;
}) {
  const next = returnPath ? encodeURIComponent(returnPath) : "";
  return (
    <section className="presentation-section pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-accent/20 bg-gradient-to-br from-accent/8 via-background to-accent/5 p-8 sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(247,178,27,0.15) 0%, transparent 65%)",
              filter: "blur(32px)",
            }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Save this audit
                </p>
              </div>
              <h2 className="font-display text-[clamp(2.6rem,2rem+1vw,4rem)] leading-[0.92] tracking-[-0.04em] text-foreground">
                Want to scan more sites like {reportTitle}?
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted">
                Create a free account to save your audits, track score changes
                over time, generate outreach packets, and scan unlimited sites
                from your dashboard.
              </p>
              <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                {[
                  "Save and revisit audits anytime",
                  "Share live reports with clients",
                  "Generate outreach emails and packets",
                  "Track improvements over time",
                ].map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <ScanSearch className="size-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="h-14 px-8" size="lg">
                <Link href={`/app/login?mode=signup${next ? `&next=${next}` : ""}`}>
                  Create free account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild className="h-12" variant="outline">
                <Link href={`/app/login${next ? `?next=${next}` : ""}`}>
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <p className="text-center text-xs text-muted">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
