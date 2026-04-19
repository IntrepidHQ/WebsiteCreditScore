import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCents,
  getAdminCustomer,
  getAdminScansForCustomer,
  planLabel,
} from "@/lib/admin/data-source";

export const dynamic = "force-dynamic";

const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, scans] = await Promise.all([
    getAdminCustomer(id),
    getAdminScansForCustomer(id),
  ]);
  if (!customer) {
    notFound();
  }

  const margin = customer.lifetimeRevenueCents - customer.lifetimeCostCents;
  const scansDisplay = customer.scansIncluded
    ? `${customer.scansUsed} of ${customer.scansIncluded}`
    : String(customer.scansUsed);

  return (
    <div className="space-y-8">
      <Link className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground" href="/admin">
        <ArrowLeft className="size-3.5" />
        Back to overview
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {customer.isPrivacyProtected ? (
              <Badge variant="inverse">
                <Lock className="mr-1 size-3" />
                Privacy Pro
              </Badge>
            ) : (
              <Badge variant="neutral">{planLabel(customer.plan)}</Badge>
            )}
          </div>
          <h1 className="font-display text-[clamp(2.25rem,1.8rem+1vw,3rem)] leading-[1] tracking-[-0.04em] text-foreground">
            {customer.displayName}
          </h1>
          <p className="text-sm text-muted">{customer.email}</p>
          {customer.isPrivacyProtected ? (
            <p className="max-w-xl rounded-md border border-border/60 bg-background-alt/60 p-3 text-xs text-muted">
              This account opted into Privacy Pro. Name, email, and scanned URLs are redacted on
              every admin surface. Only aggregate usage and billing totals are visible.
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Scans used" value={scansDisplay} />
          <Metric label="Revenue" value={formatCents(customer.lifetimeRevenueCents)} />
          <Metric label="Cost" value={formatCents(customer.lifetimeCostCents)} />
          <Metric
            label="Margin"
            tone={margin >= 0 ? "positive" : "negative"}
            value={formatCents(margin)}
          />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="!text-2xl">Scan history</CardTitle>
          <p className="text-sm text-muted">
            {scans.length === 0
              ? "No scans run yet."
              : `${scans.length} scan${scans.length === 1 ? "" : "s"} recorded.`}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {scans.length === 0 ? null : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border/70 bg-background-alt/50 text-xs uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Started</th>
                    <th className="px-5 py-3 font-semibold">URL</th>
                    <th className="px-5 py-3 font-semibold">Score</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Revenue</th>
                    <th className="px-5 py-3 font-semibold">Cost</th>
                    <th className="px-5 py-3 font-semibold">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => {
                    const rowMargin = scan.revenueCents - scan.costCents;
                    return (
                      <tr className="border-b border-border/40 last:border-b-0" key={scan.id}>
                        <td className="px-5 py-3 text-muted">{formatTimestamp(scan.startedAt)}</td>
                        <td className="px-5 py-3">
                          {customer.isPrivacyProtected ? (
                            <span className="text-muted">{scan.url}</span>
                          ) : (
                            <a
                              className="inline-flex items-center gap-1 text-foreground hover:underline"
                              href={scan.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {scan.url}
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-3 text-foreground">
                          {scan.status === "complete" ? scan.score.toFixed(1) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={
                              scan.status === "complete"
                                ? "success"
                                : scan.status === "failed"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {scan.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-foreground">{formatCents(scan.revenueCents)}</td>
                        <td className="px-5 py-3 text-muted">{formatCents(scan.costCents)}</td>
                        <td
                          className={
                            rowMargin >= 0
                              ? "px-5 py-3 text-success"
                              : "px-5 py-3 text-danger"
                          }
                        >
                          {formatCents(rowMargin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "positive" | "negative";
  value: string;
}) {
  const valueClass =
    tone === "positive" ? "text-success" : tone === "negative" ? "text-danger" : "text-foreground";
  return (
    <div className="rounded-md border border-border/60 bg-panel/60 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold leading-none ${valueClass}`}>{value}</p>
    </div>
  );
}
