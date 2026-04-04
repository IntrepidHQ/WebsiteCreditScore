import { redirect } from "next/navigation";
import { LockKeyhole, Mail, Rocket, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const emailSent = resolvedSearchParams.sent === "1";
  const authError =
    typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;
  const next = sanitizeInternalNextPath(
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/app",
    "/app",
  );

  if (session) {
    redirect(next);
  }

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
            <CardTitle className="text-3xl">Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasSupabaseEnv() ? (
              <>
                <Button asChild className="w-full" variant="outline">
                  <a href={`/auth/google?next=${encodeURIComponent(next)}`}>
                    <GoogleIcon />
                    Continue with Google
                  </a>
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-xs text-muted">or use email</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
                <form action="/auth/email" className="space-y-3" method="post">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <Input
                      autoComplete="email"
                      name="email"
                      placeholder="you@yourbusiness.com"
                      required
                      type="email"
                    />
                  </label>
                  <input name="next" type="hidden" value={next} />
                  <Button className="w-full" type="submit" variant="secondary">
                    <Mail className="size-4" />
                    Email me a sign-in link
                  </Button>
                </form>
                {emailSent ? (
                  <div className="rounded-[10px] border border-success/30 bg-success/10 p-4 text-sm leading-6 text-foreground">
                    <p className="font-medium">Check your inbox.</p>
                    <p className="mt-1 text-muted">The link expires in 24 hours and can only be used once. Check spam if you don&apos;t see it.</p>
                  </div>
                ) : null}
                {authError ? (
                  <div className="rounded-[10px] border border-danger/30 bg-danger/10 p-4 text-sm leading-6 text-foreground">
                    {authError === "missing-email" ? (
                      "Enter an email address to receive the sign-in link."
                    ) : authError === "callback-failed" ? (
                      <div className="space-y-1">
                        <p className="font-medium">Sign-in link expired or already used.</p>
                        <p className="text-muted">Magic links expire after 24 hours and can only be used once. Request a new one above, or use Google sign-in.</p>
                      </div>
                    ) : authError === "missing-code" ? (
                      "The sign-in callback was incomplete. Please try signing in again."
                    ) : authError === "supabase-not-configured" ? (
                      "Auth is not configured in this environment."
                    ) : (
                      "The sign-in link could not be sent. Please try again."
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-[10px] border border-border/70 bg-panel/70 p-4 text-sm leading-6 text-muted">
                Email sign-in is not available in this environment.
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs text-muted">or</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <Button asChild className="w-full" variant="ghost">
              <a href={`/auth/demo?next=${encodeURIComponent(next)}`}>Continue in demo workspace</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
