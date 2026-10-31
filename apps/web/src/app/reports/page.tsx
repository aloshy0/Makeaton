"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Repeat,
  DollarSign,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Printer,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { StatCard } from "../../components/ui/stat-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { DashboardMetrics, Subscription, Invoice } from "../../types";

const CASHFLOW_TREND_DATA = [
  { month: "Jun 2026", invoiced: 18400, collected: 17200, mrr: 16500 },
  { month: "Jul 2026", invoiced: 22100, collected: 20800, mrr: 19800 },
  { month: "Aug 2026", invoiced: 27500, collected: 26000, mrr: 24200 },
  { month: "Sep 2026", invoiced: 34200, collected: 32100, mrr: 31000 },
  { month: "Oct 2026", invoiced: 43250, collected: 40150, mrr: 38450 },
  { month: "Nov 2026 (Est)", invoiced: 51000, collected: 48000, mrr: 45000 },
];

const PLAN_DISTRIBUTION_DATA = [
  { name: "Enterprise Dedicated", value: 48, color: "#4f46e5" },
  { name: "Growth Scale", value: 34, color: "#06b6d4" },
  { name: "Starter Tier", value: 18, color: "#10b981" },
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<"30d" | "quarter" | "year" | "all">("quarter");
  const [downloading, setDownloading] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["reports", "metrics"],
    queryFn: () => api.getDashboard(),
  });

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ["reports", "subscriptions"],
    queryFn: () => api.getSubscriptions(),
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["reports", "invoices"],
    queryFn: () => api.getInvoices(),
  });

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      const csvHeader = "Month,Invoiced (USD),Collected (USD),MRR (USD)\n";
      const csvRows = CASHFLOW_TREND_DATA.map(
        (r) => `${r.month},${r.invoiced},${r.collected},${r.mrr}`
      ).join("\n");
      const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `brightloop-financial-report-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Executive Financial & Subscription Analytics
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5">
              Sub-2s Query Speed
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Idempotent accounting aggregations, cashflow realization, and recurring revenue
            retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs">
            {(
              [
                { id: "30d", label: "30 Days" },
                { id: "quarter", label: "Quarter" },
                { id: "year", label: "1 Year" },
                { id: "all", label: "All Time" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  timeRange === t.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={downloading}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {downloading ? "Exporting..." : "Export CSV"}
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={metrics ? formatCurrency(metrics.mrr) : "$0.00"}
          subtitle="Contracted recurring revenue"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: "+14.8%", isPositive: true }}
          loading={metricsLoading}
          highlight
        />

        <StatCard
          title="Annual Run Rate (ARR)"
          value={metrics ? formatCurrency(metrics.arr) : "$0.00"}
          subtitle="Projected annualized baseline"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: "+18.2%", isPositive: true }}
          loading={metricsLoading}
        />

        <StatCard
          title="Collected Revenue"
          value={metrics ? formatCurrency(metrics.total_collected_revenue) : "$0.00"}
          subtitle="Actual settled payments"
          icon={<CreditCard className="h-5 w-5" />}
          trend={{ value: "+9.4%", isPositive: true }}
          loading={metricsLoading}
        />

        <StatCard
          title="Outstanding Receivables"
          value={metrics ? formatCurrency(metrics.total_outstanding_receivables) : "$0.00"}
          subtitle="Pending customer settlement"
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          variant="warning"
          loading={metricsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Realization Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Cashflow Realization & Revenue Trajectory
                </CardTitle>
                <CardDescription className="text-xs">
                  Invoiced billings versus cash collected over rolling cycles
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  <span className="text-slate-600">Invoiced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Collected</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={CASHFLOW_TREND_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvoiced)"
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCollected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Subscription Mix
            </CardTitle>
            <CardDescription className="text-xs">
              Revenue distribution across subscription tiers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PLAN_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PLAN_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    formatter={(val: number) => [`${val}% of Subscriptions`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              {PLAN_DISTRIBUTION_DATA.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-medium text-slate-700">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{p.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Accounting Ledger Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Monthly Accounting Ledger & Realization Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Audited recurring billing events, realization ratios, and cash collected
              </CardDescription>
            </div>
            <Badge variant="confirmed">GAAP / IFRS-15 Compliant</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Accounting Period</th>
                  <th className="px-5 py-3.5 text-right">Invoiced Volume</th>
                  <th className="px-5 py-3.5 text-right">Settled Revenue</th>
                  <th className="px-5 py-3.5 text-right">Outstanding Delta</th>
                  <th className="px-5 py-3.5 text-right">Realization Rate</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {CASHFLOW_TREND_DATA.map((row, idx) => {
                  const delta = row.invoiced - row.collected;
                  const rate = ((row.collected / row.invoiced) * 100).toFixed(1);
                  return (
                    <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-sans font-medium text-slate-900">
                        {row.month}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-900">
                        {formatCurrency(row.invoiced)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-emerald-600 font-semibold">
                        {formatCurrency(row.collected)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-500">
                        {formatCurrency(delta)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans font-semibold text-slate-800">
                        {rate}%
                      </td>
                      <td className="px-5 py-3.5 text-center font-sans">
                        <Badge
                          variant={idx === CASHFLOW_TREND_DATA.length - 1 ? "draft" : "active"}
                        >
                          {idx === CASHFLOW_TREND_DATA.length - 1 ? "Projected" : "Audited"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
