import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-20 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader className="space-y-4">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
            <CircleAlert className="size-6" />
          </div>
          <CardTitle className="text-4xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-base leading-7 text-muted">{description}</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to landing page
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
