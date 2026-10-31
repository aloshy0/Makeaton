"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Repeat,
  DollarSign,
  ArrowRight,
  Receipt,
  CheckCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import { StatCard } from "../components/ui/stat-card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Invoice } from "../types";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: api.getDashboard,
    refetchInterval: 15000,
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["subscriptions", "recent"],
    queryFn: () => api.getSubscriptions(),
  });

  const { data: overdueInvoices = [] } = useQuery({
    queryKey: ["invoices", "overdue"],
    queryFn: () => api.getInvoices(true),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setSelectedInvoice(null);
      setPaymentAmount("");
    },
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;
    paymentMutation.mutate({
      invoice: selectedInvoice.id,
      amount: paymentAmount,
      payment_method: paymentMethod,
    });
  };

  const kpis = metrics?.kpis;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time telemetry, revenue recognition, and invoice collection status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/subscriptions">
            <Button variant="outline" size="sm" className="gap-1.5">
              <span>View All Subscriptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={metricsLoading ? "..." : formatCurrency(kpis?.mrr)}
          subtitle="ARR: "
          trend={{ value: `${formatCurrency(kpis?.arr)} annualized`, isPositive: true }}
          icon={<DollarSign className="h-4 w-4" />}
          highlight
        />

        <StatCard
          title="Active Subscriptions"
          value={metricsLoading ? "..." : (kpis?.active_subscriptions ?? 0)}
          subtitle={`Out of ${kpis?.total_subscriptions ?? 0} total contracted`}
          icon={<Repeat className="h-4 w-4" />}
        />

        <StatCard
          title="Total Collected Revenue"
          value={metricsLoading ? "..." : formatCurrency(kpis?.total_revenue_collected)}
          subtitle="Settled & reconciled"
          trend={{ value: "+99.2% match", isPositive: true }}
          icon={<CreditCard className="h-4 w-4" />}
        />

        <StatCard
          title="Overdue Outstanding"
          value={metricsLoading ? "..." : formatCurrency(kpis?.overdue_amount)}
          subtitle={`${kpis?.overdue_invoices_count ?? 0} invoices requiring chase`}
          trend={
            (kpis?.overdue_invoices_count ?? 0) > 0
              ? { value: "Action Required", isPositive: false }
              : { value: "All Caught Up", isPositive: true }
          }
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Revenue Trend Chart & Lifecycle Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Recognition & Cash Flow</CardTitle>
                <CardDescription>
                  Monthly collections trajectory across all billing cycles
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Healthy Cashflow</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics?.revenue_trend || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Lifecycle Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Status Matrix</CardTitle>
            <CardDescription>Current state of subscription pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              {
                label: "Active Billing",
                count: metrics?.status_distribution.active ?? 0,
                variant: "active" as const,
              },
              {
                label: "Pending Quotations",
                count: metrics?.status_distribution.quotation ?? 0,
                variant: "quotation" as const,
              },
              {
                label: "Paused Subscriptions",
                count: metrics?.status_distribution.paused ?? 0,
                variant: "paused" as const,
              },
              {
                label: "Closed / Terminated",
                count: metrics?.status_distribution.closed ?? 0,
                variant: "closed" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={item.variant} withDot={false}>
                    {item.label}
                  </Badge>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Overdue Invoices Alert & Recent Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices */}
        <Card className="border-rose-200/80 bg-white">
          <CardHeader className="border-b border-rose-100 bg-rose-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <CardTitle className="text-rose-950">Overdue Invoices Requiring Chase</CardTitle>
              </div>
              <Badge variant="overdue">{overdueInvoices.length} Overdue</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {overdueInvoices.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                No overdue invoices. All accounts receivable are settled.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overdueInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {inv.invoice_number}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {inv.customer_details?.company_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Due: {formatDate(inv.due_date)} • Balance:{" "}
                        <span className="text-rose-600 font-semibold">
                          {formatCurrency(inv.outstanding_balance)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentAmount(inv.outstanding_balance);
                      }}
                      className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Record Payment
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Subscriptions</CardTitle>
              <Link
                href="/subscriptions"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                View all &rarr;
              </Link>
            </div>
            <CardDescription>Latest contracted accounts and state progression</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {subsLoading ? (
              <div className="p-6 text-center text-sm text-slate-400">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No subscriptions created yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {subscriptions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {sub.subscription_number}
                        </span>
                        <Badge variant={sub.status}>{sub.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {sub.customer_details?.company_name} • Plan: {sub.plan_details?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {formatCurrency(sub.total_amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sub.plan_details?.billing_frequency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Payment Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Record Incoming Payment</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Invoice</label>
                <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
                  {selectedInvoice.invoice_number} ({selectedInvoice.customer_details?.company_name}
                  )
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Outstanding:{" "}
                  <span className="font-semibold text-rose-600">
                    {formatCurrency(selectedInvoice.outstanding_balance)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Amount Received ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="bank_transfer">Bank Transfer (ACH / Wire)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="online">Online Payment</option>
                  <option value="check">Company Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={paymentMutation.isPending}>
                  {paymentMutation.isPending ? "Recording..." : "Confirm & Settle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
