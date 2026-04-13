import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LeadsLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="h-3 w-24 animate-pulse rounded bg-border/60" />
        <div className="mt-3 h-10 w-48 animate-pulse rounded-lg bg-border/50" />
        <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded bg-border/40" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((col) => (
            <div
              className="w-[min(100%,18rem)] shrink-0 space-y-3 rounded-xl border border-border/50 bg-panel/30 p-4"
              key={col}
            >
              <div className="h-3 w-20 animate-pulse rounded bg-border/60" />
              <div className="h-20 w-full animate-pulse rounded-lg bg-border/40" />
              <div className="h-20 w-full animate-pulse rounded-lg bg-border/40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
