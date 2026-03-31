import { redirect } from "next/navigation";
import { LockKeyhole, Mail, Rocket, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/config";

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
  const next =
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : "/app";

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
                  <Button className="w-full" type="submit">
                    <Mail className="size-4" />
                    Email me a sign-in link
                  </Button>
                </form>
                {emailSent ? (
                  <div className="rounded-[10px] border border-success/30 bg-success/10 p-4 text-sm leading-6 text-foreground">
                    Check your inbox for the secure sign-in link.
                  </div>
                ) : null}
                {authError ? (
                  <div className="rounded-[10px] border border-danger/30 bg-danger/10 p-4 text-sm leading-6 text-foreground">
                    {authError === "missing-email"
                      ? "Enter an email address to receive the sign-in link."
                      : "The sign-in link could not be sent. Please try again."}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-[10px] border border-border/70 bg-panel/70 p-4 text-sm leading-6 text-muted">
                Email sign-in is ready in code, but this environment is currently running without Supabase variables.
              </div>
            )}
            <Button asChild className="w-full" variant="secondary">
              <a href={`/auth/demo?next=${encodeURIComponent(next)}`}>Continue in demo workspace</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
