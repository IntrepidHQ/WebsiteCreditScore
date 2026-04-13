import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BenchmarksLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="h-3 w-28 animate-pulse rounded bg-border/60" />
        <div className="mt-3 h-10 w-56 animate-pulse rounded-lg bg-border/50" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              className="space-y-3 rounded-xl border border-border/50 bg-panel/30 p-5"
              key={item}
            >
              <div className="h-4 w-32 animate-pulse rounded bg-border/60" />
              <div className="aspect-video w-full animate-pulse rounded-lg bg-border/40" />
              <div className="h-3 w-full animate-pulse rounded bg-border/40" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-border/40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
