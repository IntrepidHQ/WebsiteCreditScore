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

import { LoginScoreShowcase } from "@/features/auth/components/login-score-showcase";

import { BrandWordmarkLink } from "@/components/common/brand-wordmark-link";

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
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/app",
    "/app",
  );

  // Never auto-redirect to /app while ?error= is present — any code can indicate a failed workspace
  // load or auth handoff; redirecting back causes /app ↔ /login loops when session is still valid.
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
    <div className="flex min-h-screen flex-col md:h-[100dvh] md:flex-row md:overflow-hidden">
      {/* ── Left: Brand + copy + compact score rail (desktop) ── */}
      <div className="relative hidden min-h-0 md:flex md:min-w-0 md:flex-1 md:flex-col md:justify-center md:overflow-y-auto md:bg-background md:px-8 md:py-6 lg:px-10 lg:py-8 xl:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full opacity-90 md:top-1/2 md:-translate-y-1/2"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 22%, transparent) 0%, transparent 65%)",
            filter: "blur(22px)",
          }}
        />

        <div className="relative flex min-h-0 w-full max-w-3xl flex-col gap-6 lg:max-w-4xl">
          <BrandWordmarkLink className="block shrink-0" variant="on-dark" />

          <div className="flex min-h-0 flex-row items-start gap-6 lg:gap-8">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[2.35rem] leading-[1.06] text-foreground lg:text-[2.75rem] xl:text-[2.95rem]">
                Your website&apos;s<br />
                <span className="gradient-type">credit score,</span>
                <br />
                starts here.
              </h1>

              <p className="mt-3 max-w-sm text-sm leading-6 text-muted lg:mt-4 lg:text-[0.95rem] lg:leading-7">
                Audit any site in seconds. See exactly what&apos;s holding back the score — and what to fix
                first.
              </p>

              <ul className="mt-4 space-y-1.5 lg:mt-5 lg:space-y-2">
                {features.map((f) => (
                  <li className="flex items-center gap-2.5" key={f}>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15">
                      <Check className="size-2.5 text-accent" strokeWidth={2.5} />
                    </span>
                    <span className="text-xs leading-snug text-muted lg:text-[0.8125rem] lg:leading-relaxed">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <aside
              aria-label="Example score preview"
              className="w-[11.25rem] shrink-0 border-l border-border/35 pl-4 lg:w-[12.25rem] lg:pl-5"
            >
              <LoginScoreShowcase variant="rail" />
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted">Example audit</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-foreground">acme-example.com</p>
            </aside>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex min-h-0 w-full flex-1 flex-col justify-center px-5 py-8 sm:px-6 md:h-full md:max-h-[100dvh] md:w-[20.5rem] md:shrink-0 md:overflow-y-auto md:border-l md:border-border/60 md:px-6 lg:w-[22rem] lg:px-7">
        <LoginSupabaseEnvBanner />
        <BrandWordmarkLink className="mb-6 hidden md:block" variant="on-dark" />
        {/* Mobile: minimal score strip above the form */}
        <div className="mb-6 md:hidden">
          <div
            aria-hidden
            className="pointer-events-none mb-4 h-20 w-full max-w-md rounded-2xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 25%, color-mix(in srgb, var(--theme-accent) 20%, transparent) 0%, transparent 70%)",
              filter: "blur(0.5px)",
            }}
          />
          <LoginScoreShowcase variant="mobile" />
        </div>
        <BrandWordmarkLink className="mb-8 md:hidden" variant="on-dark" />

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
                <div className="inline-flex rounded-lg border border-border/70 bg-panel/60 p-1">
                  <a
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      mode === "signin"
                        ? "bg-elevated text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                    href={`/app/login?next=${encodeURIComponent(next)}`}
                  >
                    Sign in
                  </a>
                  <a
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
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
                  Workspace status
                </a>{" "}
                (after sign-in)
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
