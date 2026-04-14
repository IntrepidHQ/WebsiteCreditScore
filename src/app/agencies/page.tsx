import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Agencies | WebsiteCreditScore.com",
  description:
    "For agencies and consultants: pipeline tools, MAX handoffs, and workspace automation — without SMB-facing jargon.",
};

export default function AgenciesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="For agencies"
        title="Run audits faster. Keep every build organized."
        description="WebsiteCreditScore is built for consultants who ship audits, proposals, and redesigns. The public product speaks to business owners in plain language; this page is for how you work internally."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">MAX workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted">
          <p>
            With the MAX add-on you get private handoff generation, workspace chat grounded in saved audits, and a
            pipeline view that ties scans to delivery — framed as opportunities and tasks, not cold “lead” language
            on your client-facing pages.
          </p>
          <p>
            Use <Link className="font-semibold text-accent underline-offset-4 hover:underline" href="/app/pipeline">Pipeline</Link>{" "}
            after sign-in to see stages, reminders, and saved audits in one place.
          </p>
          <Button asChild>
            <Link href="/pricing">
              View pricing
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
