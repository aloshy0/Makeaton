"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Building2, Download, Printer, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useAccount } from "../../context/account-context";

export default function ReportsPage() {
  const { activeWorkspace } = useAccount();
  const workspaceId = activeWorkspace?.id;
  const currency = activeWorkspace?.currency || "USD";
  const reportQuery = useQuery({
    queryKey: ["reports", "summary", workspaceId],
    queryFn: () => {
      if (!workspaceId) throw new Error("Select a workspace to view its reports.");
      return api.getDashboard(workspaceId);
    },
    enabled: Boolean(workspaceId),
  });

  const metrics = reportQuery.data;
  const cashflow =
    metrics?.cashflow_trends.map((point) => ({
      month: point.month,
      amount: Number(point.amount),
    })) || [];

  const exportCsv = () => {
    if (!metrics) return;
    const rows = [
      ["Month", `Payments collected (${currency})`],
      ...metrics.cashflow_trends.map((point) => [point.month, point.amount]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flowgrid-collections-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6 pb-8" aria-labelledby="reports-title">
      <header className="flex flex-col gap-4 rounded-2xl border border-[#E8ECF3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7651F5]">
            {activeWorkspace?.name || "Workspace"}
          </p>
          <h1 id="reports-title" className="mt-1 text-2xl font-bold tracking-tight text-[#0B1020]">
            Business reports
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Recorded recurring revenue, payments and outstanding customer balances.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" /> Print
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={!metrics}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export collections CSV
          </Button>
        </div>
      </header>

      {!activeWorkspace && (
        <section className="rounded-2xl border border-[#E8ECF3] bg-white p-8 text-center">
          <Building2 className="mx-auto h-9 w-9 text-[#7651F5]" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-[#0B1020]">Choose a workspace</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Select a business workspace to view its financial reports.
          </p>
          <Link href="/workspaces" className="mt-5 inline-flex">
            <Button>View workspaces</Button>
          </Link>
        </section>
      )}

      {reportQuery.isLoading && (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Loading reports"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-[#E8ECF3] bg-white"
            />
          ))}
        </div>
      )}

      {reportQuery.isError && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="font-semibold text-amber-950">Reports are unavailable</h2>
              <p className="mt-1 text-sm text-amber-900">
                Check your workspace access and the API connection, then retry. Sample financial
                figures are not displayed.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => reportQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Retry
            </Button>
          </div>
        </section>
      )}

      {metrics && (
        <>
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Financial summary"
          >
            {[
              ["Monthly recurring revenue", formatCurrency(metrics.mrr, currency)],
              ["Annual run rate", formatCurrency(metrics.arr, currency)],
              ["Payments collected", formatCurrency(metrics.total_collected_revenue, currency)],
              [
                "Outstanding receivables",
                formatCurrency(metrics.total_outstanding_receivables, currency),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#E8ECF3] bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-[#64748B]">{label}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[#0B1020]">{value}</p>
              </div>
            ))}
          </section>

          <section
            className="rounded-2xl border border-[#E8ECF3] bg-white p-5 sm:p-6"
            aria-labelledby="collections-title"
          >
            <div>
              <h2 id="collections-title" className="font-semibold text-[#0B1020]">
                Payments collected by month
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Recorded payment totals for the last six calendar months
              </p>
            </div>
            {cashflow.some((point) => Number.isFinite(point.amount) && point.amount > 0) ? (
              <div
                className="mt-5 h-80 w-full"
                role="img"
                aria-label="Monthly payments collected chart"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashflow} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportCollections" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#reportCollections)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-5 flex h-64 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm text-[#64748B]">
                No payments were recorded in this period.
              </div>
            )}
          </section>

          <section
            className="overflow-hidden rounded-2xl border border-[#E8ECF3] bg-white"
            aria-labelledby="collections-table-title"
          >
            <div className="border-b border-[#E8ECF3] p-5">
              <h2 id="collections-table-title" className="font-semibold text-[#0B1020]">
                Monthly collection detail
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[#64748B]">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Period
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Payments collected
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {cashflow.map((point) => (
                    <tr key={point.month}>
                      <th scope="row" className="px-5 py-3 font-medium text-[#0B1020]">
                        {point.month}
                      </th>
                      <td className="px-5 py-3 text-right tabular-nums text-[#0B1020]">
                        {formatCurrency(point.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
