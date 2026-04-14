import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Onboarding | Workspace",
};

const steps = [
  {
    title: "Theme & density",
    body: "Tune light/dark, accent, and layout density in Settings so proposals match your studio.",
    href: "/app/settings",
  },
  {
    title: "Command-first habits",
    body: "Use your browser and OS shortcuts — keep the dashboard open while you scan and save audits.",
    href: "/app",
  },
  {
    title: "MAX handoff",
    body: "Generate the split coding prompt + design markdown from any saved audit.",
    href: "/app/max",
  },
  {
    title: "Pipeline",
    body: "Track stages and follow-ups without mixing internal wording into client sites.",
    href: "/app/pipeline",
  },
];

export default function WorkspaceOnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Get oriented</h1>
        <p className="text-sm leading-6 text-muted">
          A lightweight checklist inspired by fast product onboarding — hit the essentials, then ship.
        </p>
      </div>
      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-panel/60 text-sm font-bold text-muted">
                {index + 1}
              </span>
              <div className="space-y-1">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <p className="text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </CardHeader>
            <CardContent className="pl-[3.25rem]">
              <Button asChild size="sm" variant="secondary">
                <Link href={step.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
