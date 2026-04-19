import Link from "next/link";
import { ArrowUpRight, DollarSign, Gauge, ScanSearch, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/features/admin/components/sparkline";
import {
  formatCents,
  getAdminCustomers,
  getAdminDailySeries,
  getAdminSummary,
  planLabel,
} from "@/lib/admin/mock-data";

export const dynamic = "force-dynamic";

const formatJoinedDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );

const formatRelative = (iso: string | null) => {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
};

export default function AdminDashboardPage() {
  const summary = getAdminSummary();
  const series = getAdminDailySeries(30);
  const customers = getAdminCustomers();

  const scanSeries = series.map((p) => p.scans);
  const revenueSeries = series.map((p) => p.revenueCents / 100);
  const marginSeries = series.map((p) => (p.revenueCents - p.costCents) / 100);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Badge variant="accent">Operational snapshot</Badge>
        <h1 className="font-display text-[clamp(2.5rem,2rem+1vw,3.5rem)] leading-[1] tracking-[-0.04em] text-foreground">
          Admin overview
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          Last 30 days. Revenue is what customers paid us. Cost is what we paid external providers
          for inference and observation. Margin is the difference.
        </p>
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="size-4" />}
          label="Paying customers"
          sub={`${summary.totalCustomers} accounts total`}
          value={String(summary.payingCustomers)}
        />
        <KpiCard
          icon={<ScanSearch className="size-4" />}
          label="Scans (30d)"
          sub="Complete + failed"
          value={String(summary.scansLast30Days)}
        />
        <KpiCard
          icon={<DollarSign className="size-4" />}
          label="Revenue (30d)"
          sub={`Cost ${formatCents(summary.costCentsLast30Days)}`}
          value={formatCents(summary.revenueCentsLast30Days)}
        />
        <KpiCard
          icon={<Gauge className="size-4" />}
          label="Margin (30d)"
          sub={`${summary.marginPercentLast30Days.toFixed(1)}% of revenue`}
          value={formatCents(summary.marginCentsLast30Days)}
        />
      </section>

      <section aria-label="Trends" className="grid gap-4 lg:grid-cols-3">
        <ChartCard subtitle="Scans per day" title={String(summary.scansLast30Days)}>
          <Sparkline label="Scans per day" values={scanSeries} />
        </ChartCard>
        <ChartCard
          subtitle="Revenue per day"
          title={formatCents(summary.revenueCentsLast30Days)}
        >
          <Sparkline
            fill="color-mix(in srgb, var(--success) 16%, transparent)"
            label="Revenue per day"
            stroke="var(--success)"
            values={revenueSeries}
          />
        </ChartCard>
        <ChartCard
          subtitle="Margin per day"
          title={formatCents(summary.marginCentsLast30Days)}
        >
          <Sparkline
            fill="color-mix(in srgb, var(--warning) 16%, transparent)"
            label="Margin per day"
            stroke="var(--warning)"
            values={marginSeries}
          />
        </ChartCard>
      </section>

      <section className="space-y-4" id="customers">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Paying customers
            </h2>
            <p className="text-sm text-muted">
              Click a row to open the profile. Privacy Pro accounts are redacted — we never store
              or display the real name, email, or scanned URL.
            </p>
          </div>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/70 bg-background-alt/50 text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Scans</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                  <th className="px-5 py-3 font-semibold">Margin</th>
                  <th className="px-5 py-3 font-semibold">Last scan</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const margin = customer.lifetimeRevenueCents - customer.lifetimeCostCents;
                  const scansDisplay = customer.scansIncluded
                    ? `${customer.scansUsed}/${customer.scansIncluded}`
                    : String(customer.scansUsed);
                  return (
                    <tr
                      className="border-b border-border/40 last:border-b-0 hover:bg-background-alt/40"
                      key={customer.id}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{customer.displayName}</div>
                        <div className="text-xs text-muted">{customer.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={customer.plan === "privacy-pro" ? "inverse" : "neutral"}>
                          {planLabel(customer.plan)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-foreground">{scansDisplay}</td>
                      <td className="px-5 py-4 text-foreground">
                        {formatCents(customer.lifetimeRevenueCents)}
                      </td>
                      <td
                        className={
                          margin >= 0
                            ? "px-5 py-4 text-success"
                            : "px-5 py-4 text-danger"
                        }
                      >
                        {formatCents(margin)}
                      </td>
                      <td className="px-5 py-4 text-muted">{formatRelative(customer.lastScanAt)}</td>
                      <td className="px-5 py-4 text-muted">{formatJoinedDate(customer.joinedAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                          href={`/admin/customers/${customer.id}`}
                        >
                          Open
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  sub,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-accent/15 text-accent">
            {icon}
          </span>
          {label}
        </div>
        <div className="font-display text-3xl font-semibold leading-none text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted">{sub}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1 p-5 pb-0">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{subtitle}</p>
        <CardTitle className="!text-2xl !font-semibold !leading-none">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">{children}</CardContent>
    </Card>
  );
}
