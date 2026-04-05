import { redirect } from "next/navigation";
import { LockKeyhole, Rocket, Sparkles } from "lucide-react";

// Force dynamic so cookies() isn't called during static pre-rendering
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isDemoWorkspaceAllowed } from "@/lib/auth/demo-flag";
import { getOptionalWorkspaceSession, sanitizeInternalNextPath } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default async function AppLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getOptionalWorkspaceSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const mode = resolvedSearchParams.mode === "reset" ? "reset" : "signin";
  const sentReset = resolvedSearchParams.sent === "reset";
  const authError =
    typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;
  const prefillEmail =
    typeof resolvedSearchParams.email === "string" ? resolvedSearchParams.email : "";
  const next = sanitizeInternalNextPath(
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/app",
    "/app",
  );

  if (session) {
    redirect(next);
  }

  const errorMessage = (code: string | null) => {
    switch (code) {
      case "invalid-credentials":
        return "Incorrect email or password. If you haven't set a password yet, use \"Forgot password\" below.";
      case "missing-credentials":
        return "Enter both your email and password.";
      case "missing-email":
        return "Enter your email address.";
      case "sign-in-failed":
        return "Sign-in failed. Please try again.";
      case "supabase-not-configured":
        return "Auth is not configured in this environment.";
      case "callback-failed":
        return "The sign-in link expired or was already used. Request a new one below.";
      default:
        return code ? "Something went wrong. Please try again." : null;
    }
  };

  const error = errorMessage(authError);

  return (
    <main className="presentation-section" id="main-content">
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_24rem] lg:px-8">
        <Card>
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.24em] text-accent">Workspace access</p>
            <CardTitle className="text-5xl">Sign in to WebsiteCreditScore.com</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-muted">
            <p className="max-w-2xl text-base leading-8">
              Save audits, revisit the score history, send share links, and keep every review tied to a real website instead of a one-off export.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: LockKeyhole,
                  title: "Saved workspaces",
                  detail: "Keep reports, pricing, and share links attached to the same site over time.",
                },
                {
                  icon: Rocket,
                  title: "Clear next steps",
                  detail: "Track packet status, follow-ups, and the brief that comes out of each review.",
                },
                {
                  icon: Sparkles,
                  title: "Reusable insights",
                  detail: "Build a stronger library of examples, benchmark references, and repeatable upgrades.",
                },
              ].map((item) => (
                <div
                  className="rounded-[10px] border border-border/70 bg-panel/70 p-4"
                  key={item.title}
                >
                  <item.icon className="size-5 text-accent" />
                  <p className="mt-3 font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-6">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {mode === "reset" ? "Reset password" : "Sign in"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasSupabaseEnv() ? (
              <div className="rounded-[10px] border border-border/70 bg-panel/70 p-4 text-sm leading-6 text-muted">
                Auth environment variables are not set. Add{" "}
                <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="text-foreground">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{" "}
                to your Vercel project settings, then redeploy.
              </div>
            ) : sentReset ? (
              <div className="rounded-[10px] border border-success/30 bg-success/10 p-4 text-sm leading-6 text-foreground">
                <p className="font-medium">Check your inbox.</p>
                <p className="mt-1 text-muted">
                  If that email has an account, you&apos;ll get a link to sign in and set a new password. Check spam if you don&apos;t see it.
                </p>
                <a
                  className="mt-3 block text-accent hover:underline"
                  href={`/app/login?next=${encodeURIComponent(next)}`}
                >
                  Back to sign in
                </a>
              </div>
            ) : mode === "reset" ? (
              <>
                <p className="text-sm text-muted">
                  Enter your email and we&apos;ll send a link to sign in and set a new password.
                </p>
                <form action="/auth/reset" className="space-y-3" method="post">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <Input
                      autoComplete="email"
                      autoFocus
                      defaultValue={prefillEmail}
                      name="email"
                      placeholder="you@yourbusiness.com"
                      required
                      type="email"
                    />
                  </label>
                  <Button className="w-full" type="submit">
                    Send reset link
                  </Button>
                </form>
                {error ? (
                  <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
                <a
                  className="block text-center text-sm text-muted hover:text-foreground"
                  href={`/app/login?next=${encodeURIComponent(next)}`}
                >
                  Back to sign in
                </a>
              </>
            ) : (
              <>
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
                <form action="/auth/password" className="space-y-3" method="post">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <Input
                      autoComplete="email"
                      defaultValue={prefillEmail}
                      name="email"
                      placeholder="you@yourbusiness.com"
                      required
                      type="email"
                    />
                  </label>
                  <label className="block space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Password</span>
                      <a
                        className="text-xs text-muted hover:text-foreground"
                        href={`/app/login?mode=reset&email=${encodeURIComponent(prefillEmail)}&next=${encodeURIComponent(next)}`}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      autoComplete="current-password"
                      name="password"
                      required
                      type="password"
                    />
                  </label>
                  <input name="next" type="hidden" value={next} />
                  <Button className="w-full" type="submit">
                    Sign in
                  </Button>
                </form>
                {error ? (
                  <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
              </>
            )}
            {isDemoWorkspaceAllowed() && !sentReset ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-xs text-muted">or</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
                <Button asChild className="w-full" variant="ghost">
                  <a href={`/auth/demo?next=${encodeURIComponent(next)}`}>Continue in demo workspace</a>
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
