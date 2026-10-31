"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Building2, CircleAlert, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useAccount } from "../../context/account-context";

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <section className="rounded-2xl border border-[#E8ECF3] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#64748B]">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#0B1020]">{value}</p>
      <p className="mt-2 text-xs text-[#64748B]">{detail}</p>
    </section>
  );
}

export default function DashboardPage() {
  const { activeWorkspace } = useAccount();
  const workspaceId = activeWorkspace?.id;
  const currency = activeWorkspace?.currency || "USD";

  const dashboardQuery = useQuery({
    queryKey: ["dashboardMetrics", workspaceId],
    queryFn: () => {
      if (!workspaceId) throw new Error("Choose a workspace to load its business overview.");
      return api.getDashboard(workspaceId);
    },
    enabled: Boolean(workspaceId),
    refetchInterval: (query) => (query.state.status === "success" ? 60_000 : false),
  });

  const metrics = dashboardQuery.data;
  const chartData = (metrics?.cashflow_trends || []).map((point) => ({
    month: point.month,
    amount: Number(point.amount),
  }));
  const hasCashflow = chartData.some((point) => Number.isFinite(point.amount) && point.amount > 0);
  const role = activeWorkspace?.user_role;
  const isManager = role === "OWNER" || role === "ADMIN";

  if (!activeWorkspace) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#E8ECF3] bg-white p-8 text-center">
        <Building2 className="mx-auto h-9 w-9 text-[#7651F5]" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold text-[#0B1020]">Choose a workspace</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Select a business workspace to see its subscriptions, collections and invoices.
        </p>
        <Link href="/workspaces" className="mt-5 inline-flex">
          <Button>View workspaces</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="space-y-6 pb-8" aria-labelledby="dashboard-title">
      <header className="flex flex-col gap-4 rounded-2xl border border-[#E8ECF3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7651F5]">
            {activeWorkspace.name}
            {role ? ` · ${role.toLowerCase()}` : ""}
          </p>
          <h1
            id="dashboard-title"
            className="mt-1 text-2xl font-bold tracking-tight text-[#0B1020]"
          >
            Business overview
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Workspace-scoped recurring revenue, collections and invoice balances.
          </p>
        </div>
        {isManager && (
          <nav className="flex flex-wrap gap-2" aria-label="Dashboard actions">
            <Link href="/catalog">
              <Button variant="outline" size="sm">
                Manage catalog
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" size="sm">
                View customers
              </Button>
            </Link>
            <Link href="/quotations">
              <Button size="sm">Create quotation</Button>
            </Link>
          </nav>
        )}
      </header>

      {dashboardQuery.isLoading && (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Loading dashboard"
          aria-busy="true"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-[#E8ECF3] bg-white"
            />
          ))}
        </div>
      )}

      {dashboardQuery.isError && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" role="alert">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="font-semibold text-amber-950">Dashboard data is unavailable</h2>
              <p className="mt-1 text-sm text-amber-900">
                Check your workspace access and the API connection, then try again. No sample
                figures are shown.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => dashboardQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Retry
            </Button>
          </div>
        </section>
      )}

      {metrics && (
        <>
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Business metrics"
          >
            <MetricCard
              label="Monthly recurring revenue"
              value={formatCurrency(metrics.mrr, currency)}
              detail="Active plans normalized by billing interval"
            />
            <MetricCard
              label="Active subscriptions"
              value={String(metrics.active_subscriptions)}
              detail={`${metrics.total_subscriptions} subscriptions in all statuses`}
            />
            <MetricCard
              label="Payments collected"
              value={formatCurrency(metrics.total_collected_revenue, currency)}
              detail="Recorded payments to date"
            />
            <MetricCard
              label="Outstanding receivables"
              value={formatCurrency(metrics.total_outstanding_receivables, currency)}
              detail={`${metrics.overdue_invoices_count} overdue invoices · ${formatCurrency(metrics.total_overdue_amount, currency)} overdue`}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            <section
              className="rounded-2xl border border-[#E8ECF3] bg-white p-5 sm:p-6 xl:col-span-2"
              aria-labelledby="cashflow-title"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="cashflow-title" className="font-semibold text-[#0B1020]">
                    Collections by month
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Payments recorded over the last six calendar months
                  </p>
                </div>
                <span className="text-xs text-[#64748B]">
                  {dashboardQuery.dataUpdatedAt
                    ? `Updated ${new Date(dashboardQuery.dataUpdatedAt).toLocaleTimeString()}`
                    : ""}
                </span>
              </div>
              {hasCashflow ? (
                <div
                  className="mt-5 h-72 w-full"
                  role="img"
                  aria-label="Monthly payments collected chart"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashboardCashflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7651F5" stopOpacity={0.24} />
                          <stop offset="95%" stopColor="#7651F5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E8ECF3" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value, currency)}
                      />
                      <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        name="Collected"
                        stroke="#7651F5"
                        strokeWidth={2.5}
                        fill="url(#dashboardCashflow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-5 flex h-56 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm text-[#64748B]">
                  No payment activity is recorded for this period.
                </div>
              )}
            </section>

            <section
              className="rounded-2xl border border-[#E8ECF3] bg-white p-5 sm:p-6"
              aria-labelledby="pipeline-title"
            >
              <h2 id="pipeline-title" className="font-semibold text-[#0B1020]">
                Subscription pipeline
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">Current workspace status counts</p>
              <dl className="mt-5 divide-y divide-[#E8ECF3]">
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-[#64748B]">Active</dt>
                  <dd className="font-semibold text-[#0B1020]">{metrics.active_subscriptions}</dd>
                </div>
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-[#64748B]">Paused</dt>
                  <dd className="font-semibold text-[#0B1020]">{metrics.paused_subscriptions}</dd>
                </div>
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-[#64748B]">Quotations</dt>
                  <dd className="font-semibold text-[#0B1020]">{metrics.quotations_count}</dd>
                </div>
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-[#64748B]">Closed</dt>
                  <dd className="font-semibold text-[#0B1020]">{metrics.closed_subscriptions}</dd>
                </div>
              </dl>
              <Link
                href="/subscriptions"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6941D9] hover:underline"
              >
                View subscriptions <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          </div>

          <section className="flex flex-col gap-3 rounded-2xl border border-[#E8ECF3] bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[#0B1020]">Invoice follow-up</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                {metrics.total_invoices} invoices · {metrics.overdue_invoices_count} overdue ·{" "}
                {formatCurrency(metrics.total_overdue_amount, currency)} past due
              </p>
            </div>
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                Review invoices <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </section>
        </>
      )}

      {role === "STAFF" && dashboardQuery.isError && (
        <p className="text-xs text-[#64748B]">
          Report access depends on your workspace permissions. Open an assigned module from the
          sidebar to continue your work.
        </p>
      )}
    </main>
  );
}
