import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

// Force dynamic so cookies() isn't called during static pre-rendering
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDemoWorkspaceAllowed } from "@/lib/auth/demo-flag";
import { getOptionalWorkspaceSession, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";

import {
  LoginGraphicsColumn,
  LoginScanMetaFooter,
} from "@/features/auth/components/login-recent-scan-showcase";
import { LoginMarketingColumn } from "@/features/auth/components/login-marketing-column";
import { resolveLoginShowcaseFromRecentScans } from "@/features/auth/lib/resolve-login-showcase";

import { BrandWordmarkLinkThemed } from "@/components/common/brand-wordmark-link-themed";

import { LoginSupabaseEnvBanner } from "./login-supabase-env-banner";

export default async function AppLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getOptionalWorkspaceSession();
  const resolvedSearchParams = (await searchParams) ?? {};

  const rawMode = resolvedSearchParams.mode;
  const mode = rawMode === "signup" ? "signup" : rawMode === "reset" ? "reset" : "signin";
  const sentConfirm = resolvedSearchParams.sent === "confirm";
  const sentReset = resolvedSearchParams.sent === "reset";
  const authError = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;
  const prefillEmail = typeof resolvedSearchParams.email === "string" ? resolvedSearchParams.email : "";
  const next = sanitizeInternalNextPath(
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/",
    "/",
  );

  // Never auto-redirect away from login while ?error= is present — any code can indicate a failed workspace
  // load or auth handoff; redirecting back causes redirect loops when session is still valid.
  const skipAutoRedirectToWorkspace = Boolean(authError);

  if (session && !skipAutoRedirectToWorkspace) {
    redirect(next);
  }

  const errorMessage = (code: string | null): string | null => {
    switch (code) {
      case "invalid-credentials":
        return "Incorrect email or password. Use \"Forgot password\" if you haven't set one yet.";
      case "missing-credentials":
        return "Enter both your email and password.";
      case "missing-email":
        return "Enter your email address.";
      case "password-too-short":
        return "Password must be at least 8 characters.";
      case "already-registered":
        return "That email is already registered. Sign in below, or use \"Forgot password\" to set a new password.";
      case "sign-up-failed":
        return "Could not create account. Please try again.";
      case "sign-in-failed":
        return "Sign-in failed. Please try again.";
      case "supabase-not-configured":
        return "Auth is not configured in this environment.";
      case "callback-failed":
        return "The link expired or was already used. Request a new one below.";
      case "missing-code":
        return "That sign-in link did not include a valid code (wrong redirect URL, or the link was opened in a different browser). Use the same site address as in the email (www vs non-www), or sign in again from this page.";
      case "session-required":
        return "Sign in to continue to your workspace.";
      case "db-not-ready":
        return "The database tables are not set up yet. Run the migration SQL in your Supabase project (SQL Editor → paste supabase/migrations/20260330232000_init_schema.sql → Run), then sign in again.";
      case "workspace-unavailable":
        return "We could not open your workspace (database permission or a stale session). Sign out and sign in again. If it keeps happening, confirm Supabase migrations are applied and Row Level Security policies match your project.";
      default:
        return code ? "Something went wrong. Please try again." : null;
    }
  };

  const error = errorMessage(authError);

  const features = [
    "Save and revisit audits for any domain",
    "Share live score reports with clients",
    "Track improvements over time",
    "Benchmark against real competitors",
  ];

  const loginShowcase = await resolveLoginShowcaseFromRecentScans();

  const loginIntentHint = (() => {
    const lower = next.toLowerCase();
    if (lower.includes("save=1")) {
      return "After you sign in, we'll save this audit to your Leads.";
    }
    if (lower.includes("/app/leads")) {
      return "Sign in to open Leads.";
    }
    if (lower.includes("/app/max")) {
      return "Sign in to open MAX.";
    }
    if (lower.includes("/app/seo")) {
      return "Sign in to open the SEO workspace.";
    }
    return null;
  })();

  return (
    <div className="relative isolate flex min-h-screen flex-col gap-6 bg-background px-5 py-6 sm:px-6 md:h-[100dvh] md:min-h-0 md:grid md:grid-cols-[minmax(15rem,24vw)_minmax(0,1fr)_minmax(16.5rem,23rem)] md:grid-rows-[auto_minmax(0,1fr)] md:gap-0 md:overflow-hidden md:px-0 md:py-0">
      {/* ── Auth header (wordmark + env): column 3 row 1 on desktop; first on mobile ── */}
      <header className="order-1 shrink-0 border-b border-border/50 pb-5 sm:pb-6 md:order-none md:col-start-3 md:row-start-1 md:border-b md:border-border/55 md:px-6 md:pb-6 md:pt-8 lg:px-8">
        <LoginSupabaseEnvBanner />
        <BrandWordmarkLinkThemed className="mt-4 block shrink-0 md:mt-5" />
      </header>

      {/* ── Marketing copy: column 1 row 1 on desktop ── */}
      <aside className="order-2 min-w-0 md:order-none md:col-start-1 md:row-start-1 md:flex md:min-h-0 md:flex-col md:justify-center md:border-r md:border-border/55 md:px-7 md:py-10 lg:px-9 xl:px-11">
        <LoginMarketingColumn features={features} />
      </aside>

      {/* ── Graphics (radar + editorial + horizontal roulette): column 2, spans both rows ── */}
      <section
        aria-label="Live audit preview"
        className="relative order-3 min-h-0 overflow-x-clip md:order-none md:col-start-2 md:row-span-2 md:row-start-1 md:min-h-0 md:overflow-y-auto md:border-r md:border-border/55 md:px-8 md:py-10 lg:px-10 xl:px-12"
      >
        <div
          aria-hidden="true"
          className="login-showcase-ambient-glow pointer-events-none absolute left-1/2 top-1/2 hidden h-[min(34rem,58vh)] w-[min(34rem,58vh)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 md:block"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 26%, transparent) 0%, transparent 68%)",
            filter: "blur(28px)",
          }}
        />
        <LoginGraphicsColumn className="relative" showcase={loginShowcase} />
      </section>

      {/* ── Scan meta: column 1 row 2 (desktop), after graphics on mobile ── */}
      <div className="order-4 md:order-none md:col-start-1 md:row-start-2 md:self-end md:border-r md:border-border/55 md:px-7 md:pb-10 md:pt-2 lg:px-9 xl:px-11">
        <LoginScanMetaFooter showcase={loginShowcase} />
      </div>

      {/* ── Form: column 3 row 2 on desktop ── */}
      <div className="order-5 min-h-0 md:order-none md:col-start-3 md:row-start-2 md:flex md:min-h-0 md:flex-col md:overflow-y-auto md:px-6 md:pb-10 md:pt-2 lg:px-8">
        <div className="mx-auto w-full max-w-md min-h-0 flex-1 md:mx-0 md:max-w-none">
          <div className="w-full min-w-0 md:max-w-[16.75rem] md:self-start">
        {sentConfirm ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <Check className="size-5 text-success" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Check your inbox</h2>
            <p className="text-sm leading-6 text-muted">
              We sent a confirmation link to <strong className="text-foreground">{prefillEmail || "your email"}</strong>. Click it to activate your account.
              Check spam if you don&apos;t see it within a minute.
            </p>
            <a
              className="block text-sm text-accent hover:underline"
              href={`/app/login?next=${encodeURIComponent(next)}`}
            >
              Back to sign in
            </a>
          </div>
        ) : sentReset ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <Check className="size-5 text-success" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Check your inbox</h2>
            <p className="text-sm leading-6 text-muted">
              If that email has an account, you&apos;ll get a password reset link shortly. Check spam if you don&apos;t see it.
            </p>
            <a
              className="block text-sm text-accent hover:underline"
              href={`/app/login?next=${encodeURIComponent(next)}`}
            >
              Back to sign in
            </a>
          </div>
        ) : mode === "reset" ? (
          <>
            <fieldset
              className="min-w-0 space-y-6 border-0 p-0 disabled:pointer-events-none disabled:opacity-60"
              disabled={!hasSupabaseEnv()}
            >
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reset your password</h2>
                <p className="mt-1.5 text-sm text-muted">
                  Enter your email and we&apos;ll send a link to set a new password.
                </p>
              </div>
              <form action="/auth/reset" className="space-y-4" method="post">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="reset-email">
                    Email
                  </label>
                  <Input
                    autoComplete="email"
                    autoFocus
                    defaultValue={prefillEmail}
                    id="reset-email"
                    name="email"
                    placeholder="you@yourbusiness.com"
                    required
                    type="email"
                  />
                </div>
                <Button className="w-full" type="submit">
                  Send reset link
                </Button>
              </form>
              <a
                className="block text-center text-sm text-muted hover:text-foreground"
                href={`/app/login?next=${encodeURIComponent(next)}`}
              >
                Back to sign in
              </a>
            </fieldset>
            {error ? (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <div className="space-y-6">
            {session &&
            skipAutoRedirectToWorkspace &&
            ["db-not-ready", "workspace-unavailable", "supabase-not-configured"].includes(authError ?? "") ? (
              <div className="rounded-xl border border-accent/35 bg-accent/10 p-4 text-sm leading-6 text-foreground">
                <p className="font-semibold">You are signed in, but the workspace did not open.</p>
                <p className="mt-2 text-muted">
                  Staying on this page avoids a redirect loop with /app. After fixing the database (or
                  signing out), try again.
                </p>
                <Button asChild className="mt-4 w-full" variant="secondary">
                  <Link href="/auth/logout">Sign out and start over</Link>
                </Button>
                <p className="mt-4 text-xs leading-5 text-muted">
                  Technical check: open{" "}
                  <a className="text-accent underline" href="/api/workspace/gate">
                    /api/workspace/gate
                  </a>{" "}
                  while signed in on this site to see which step fails.
                </p>
              </div>
            ) : null}

            <fieldset
              className="min-w-0 space-y-6 border-0 p-0 disabled:pointer-events-none disabled:opacity-60"
              disabled={!hasSupabaseEnv()}
            >
              {loginIntentHint ? (
                <p
                  className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-foreground"
                  role="status"
                >
                  {loginIntentHint}
                </p>
              ) : null}
              {/* Tab switcher */}
              <div>
                <div className="inline-flex max-w-full rounded-lg border border-border/70 bg-panel/60 p-1">
                  <a
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                      mode === "signin"
                        ? "bg-elevated text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                    href={`/app/login?next=${encodeURIComponent(next)}`}
                  >
                    Sign in
                  </a>
                  <a
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                      mode === "signup"
                        ? "bg-elevated text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                    href={`/app/login?mode=signup&next=${encodeURIComponent(next)}`}
                  >
                    Create account
                  </a>
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-foreground">
                  {mode === "signup" ? "Create your account" : "Welcome back"}
                </h2>
                {mode === "signup" && (
                  <p className="mt-1 text-sm text-muted">Free to start — no credit card required.</p>
                )}
              </div>

              {/* Email + Password form */}
              {mode === "signup" ? (
                <form action="/auth/signup" className="space-y-4" method="post">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="signup-email">
                      Email
                    </label>
                    <Input
                      autoComplete="email"
                      autoFocus
                      defaultValue={prefillEmail}
                      id="signup-email"
                      name="email"
                      placeholder="you@yourbusiness.com"
                      required
                      type="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="signup-password">
                      Password
                    </label>
                    <Input
                      autoComplete="new-password"
                      id="signup-password"
                      name="password"
                      required
                      type="password"
                    />
                    <p className="text-xs text-muted">At least 8 characters</p>
                  </div>
                  <input name="next" type="hidden" value={next} />
                  <Button className="w-full" type="submit">
                    Create account
                  </Button>
                </form>
              ) : (
                <form action="/auth/password" className="space-y-4" method="post">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="signin-email">
                      Email
                    </label>
                    <Input
                      autoComplete="email"
                      defaultValue={prefillEmail}
                      id="signin-email"
                      name="email"
                      placeholder="you@yourbusiness.com"
                      required
                      type="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground" htmlFor="signin-password">
                        Password
                      </label>
                      <a
                        className="text-xs text-muted hover:text-foreground"
                        href={`/app/login?mode=reset&email=${encodeURIComponent(prefillEmail)}&next=${encodeURIComponent(next)}`}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      autoComplete="current-password"
                      id="signin-password"
                      name="password"
                      required
                      type="password"
                    />
                  </div>
                  <input name="next" type="hidden" value={next} />
                  <Button className="w-full" type="submit">
                    Sign in
                  </Button>
                </form>
              )}
            </fieldset>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            {isDemoWorkspaceAllowed() && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-xs text-muted">or</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
                <Button asChild className="w-full" variant="ghost">
                  <a href={`/auth/demo?next=${encodeURIComponent(next)}`}>
                    Continue in demo workspace
                  </a>
                </Button>
              </>
            )}

            {hasSupabaseEnv() ? (
              <p className="text-center text-xs leading-5 text-muted">
                <a className="text-accent underline underline-offset-2" href="/api/workspace/gate">
                  Workspace connection check
                </a>
                — use if the app loads but the dashboard will not open.
              </p>
            ) : null}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
