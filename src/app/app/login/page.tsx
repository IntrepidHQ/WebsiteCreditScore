import { redirect } from "next/navigation";
import { Check } from "lucide-react";

// Force dynamic so cookies() isn't called during static pre-rendering
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDemoWorkspaceAllowed } from "@/lib/auth/demo-flag";
import { getOptionalWorkspaceSession, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Decorative score ring for the left panel
function ScoreBadge() {
  const score = 87;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="rotate-[-90deg]" height="136" viewBox="0 0 136 136" width="136">
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke="rgba(247,178,27,0.12)"
          strokeWidth="10"
        />
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke="#f7b21b"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          strokeWidth="10"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl leading-none text-foreground">{score}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-accent">Score</span>
      </div>
    </div>
  );
}

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

  if (session) redirect(next);

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
        return "An account with that email already exists. Sign in instead.";
      case "sign-up-failed":
        return "Could not create account. Please try again.";
      case "sign-in-failed":
        return "Sign-in failed. Please try again.";
      case "supabase-not-configured":
        return "Auth is not configured in this environment.";
      case "callback-failed":
        return "The link expired or was already used. Request a new one below.";
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

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Brand panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-14">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-[36rem] w-[36rem] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(247,178,27,0.18) 0%, transparent 65%)",
            filter: "blur(24px)",
          }}
        />

        <div className="relative">
          {/* Wordmark */}
          <a className="inline-flex items-center gap-2.5" href="/">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-black tracking-tight text-accent-foreground">
              WCS
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              WebsiteCreditScore.com
            </span>
          </a>

          {/* Headline */}
          <h1 className="font-display mt-14 text-[3.25rem] leading-[1.05] text-foreground">
            Your website&apos;s<br />
            <span className="gradient-type">credit score,</span><br />
            starts here.
          </h1>

          <p className="mt-5 max-w-sm text-base leading-7 text-muted">
            Audit any site in seconds. See exactly what&apos;s holding back the score — and what to fix first.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li className="flex items-center gap-3" key={f}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                  <Check className="size-3 text-accent" strokeWidth={2.5} />
                </span>
                <span className="text-sm text-muted">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Score badge */}
        <div className="relative flex items-end gap-6">
          <ScoreBadge />
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">Example audit</p>
            <p className="mt-1 text-sm font-semibold text-foreground">acme-example.com</p>
            <p className="text-sm text-muted">Scored in 4.2 seconds</p>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[460px] lg:shrink-0 lg:border-l lg:border-border/60 lg:px-12">
        {/* Mobile wordmark */}
        <a className="mb-10 inline-flex items-center gap-2.5 lg:hidden" href="/">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-black tracking-tight text-accent-foreground">
            WCS
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            WebsiteCreditScore.com
          </span>
        </a>

        {!hasSupabaseEnv() ? (
          <div className="rounded-xl border border-border/70 bg-panel/70 p-5 text-sm leading-6 text-muted">
            Auth environment variables are not set. Add{" "}
            <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-foreground">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{" "}
            to your Vercel project settings, then redeploy.
          </div>
        ) : sentConfirm ? (
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
          <div className="space-y-6">
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
            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}
            <a
              className="block text-center text-sm text-muted hover:text-foreground"
              href={`/app/login?next=${encodeURIComponent(next)}`}
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <div className="space-y-6">
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

            {/* Google */}
            <Button asChild className="w-full" variant="outline">
              <a href={`/auth/google?next=${encodeURIComponent(next)}`}>
                <GoogleIcon />
                Continue with Google
              </a>
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs text-muted">or</span>
              <div className="h-px flex-1 bg-border/50" />
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
          </div>
        )}
      </div>
    </div>
  );
}
