import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceAppContext } from "@/lib/product/context";

export const metadata = {
  title: "Workspace data | WebsiteCreditScore.com",
};

/**
 * Shown when a deeper workspace query (e.g. dashboard) fails with RLS / duplicate key,
 * while the base workspace session is still valid — avoids sending users to sign-in.
 */
export default async function WorkspaceUnavailablePage() {
  await getWorkspaceAppContext();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Could not load workspace data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted">
          <p>
            Your account is signed in, but the database blocked a read (often Row Level Security) or hit a duplicate
            record. This page loads without the heavy dashboard so you are not bounced to sign-in.
          </p>
          <p className="text-foreground/90">
            Try refreshing. If it keeps happening, open the{" "}
            <Link className="font-medium text-accent underline-offset-2 hover:underline" href="/api/workspace/gate">
              workspace gate
            </Link>{" "}
            in this tab (it refreshes session cookies), then return to the dashboard.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/app">Back to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Docs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
