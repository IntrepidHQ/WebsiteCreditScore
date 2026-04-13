import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingCancelPage() {
  return (
    <main className="presentation-section" id="main-content">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Checkout was canceled.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted">
              Nothing was charged. You can return to pricing, adjust the cart, or keep using the free balance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/pricing">Return to pricing</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/app">Back to workspace</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
