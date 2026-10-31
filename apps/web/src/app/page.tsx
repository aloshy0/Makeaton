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
  Building2,
  ShieldCheck,
  Sparkles,
  Layers,
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
import { CreateWorkspaceDialog } from "../components/layout/create-workspace-dialog";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    "aac3abe7-18b7-4c5f-a29e-786b63476459"
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  // Auth form state
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCompanyName, setAuthCompanyName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Modal payment state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  // Fetch metrics for the active workspace
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboardMetrics", activeWorkspaceId],
    queryFn: () => api.getDashboard(activeWorkspaceId),
    refetchInterval: 15000,
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["subscriptions", activeWorkspaceId],
    queryFn: () => api.getSubscriptions(activeWorkspaceId),
  });

  const { data: overdueInvoices = [] } = useQuery({
    queryKey: ["invoices", "overdue", activeWorkspaceId],
    queryFn: () => api.getInvoices(activeWorkspaceId, true),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(activeWorkspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setSelectedInvoice(null);
      setPaymentAmount("");
    },
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (authMode === "register") {
        await api.register({
          email: authEmail,
          password: authPassword,
          company_name: authCompanyName,
        });
        setAuthSuccess("Account created successfully! Your workspace has been initialized.");
      } else {
        const res = await api.login({
          email: authEmail,
          password: authPassword,
        });
        setAuthSuccess(`Welcome back, ${res.user.first_name || res.user.email}!`);
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Check your credentials.");
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setAuthEmail(email);
    setAuthPassword(pass);
    setAuthMode("login");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Official Multi-Tenant Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Multi-Tenant SaaS Platform
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300">
              5 Workspaces per Creator
            </span>
            <span className="rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2.5 py-0.5 text-xs">
              Idempotent Engine
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Run Your Subscription Business. All in One Place.
          </h1>

          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Launch and operate up to five independent subscription business workspaces. Configure
            products, attribute variants, and recurring billing plans, invite staff with permission
            guardrails, and collect automated revenue with sub-2-second insights.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setAuthMode("register");
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/50"
            >
              <Building2 className="h-4 w-4" />
              Start Your Business
            </button>

            <button
              onClick={() => {
                setAuthMode("login");
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              Sign In
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 px-4 py-3 text-sm font-medium text-indigo-300 hover:bg-indigo-900/40"
            >
              + Create New Workspace
            </button>
          </div>
        </div>

        {/* Workspace Context Ribbon */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Workspace:</span>
            <span className="font-bold text-white">Brightloop Cloud Services</span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              OWNER (Alexander)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              Creator Slots: <strong className="text-indigo-400 font-semibold">2 of 5</strong> used
            </div>
            <div>
              Response SLA: <strong className="text-emerald-400 font-semibold">&lt; 2.0s</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={metrics ? formatCurrency(metrics.mrr) : "$0.00"}
          subtitle="Active monthly run-rate"
          icon={<DollarSign className="h-5 w-5 text-indigo-400" />}
          trend={{ value: "+12.4%", label: "vs last month", isPositive: true }}
          loading={metricsLoading}
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={metrics ? formatCurrency(metrics.arr) : "$0.00"}
          subtitle="12-month projection"
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          loading={metricsLoading}
        />
        <StatCard
          title="Active Subscriptions"
          value={metrics?.active_subscriptions ?? 0}
          subtitle={`Across ${metrics?.total_subscriptions ?? 0} total contracts`}
          icon={<Repeat className="h-5 w-5 text-sky-400" />}
          loading={metricsLoading}
        />
        <StatCard
          title="Overdue Receivables"
          value={metrics ? formatCurrency(metrics.total_overdue_amount) : "$0.00"}
          subtitle={`${metrics?.overdue_invoices_count ?? 0} overdue invoices`}
          icon={<AlertTriangle className="h-5 w-5 text-rose-400" />}
          variant={metrics && metrics.total_overdue_amount > 0 ? "warning" : "default"}
          loading={metricsLoading}
        />
      </div>

      {/* 3. Analytics Chart & Overdue Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cashflow Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cash Flow & Collected Revenue</CardTitle>
                <CardDescription>
                  Reconciled payments processed over the past 6 months
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                Live SQL Aggregation
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {metrics?.cashflow_trends ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.cashflow_trends}>
                    <defs>
                      <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [`$${value}`, "Collected Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cashflowGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Loading telemetry...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Overdue Watchlist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Overdue Invoices</CardTitle>
              <Badge variant="danger">{overdueInvoices.length} Attention</Badge>
            </div>
            <CardDescription>Invoices with open balances past due date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mb-2" />
                <p className="text-sm font-medium text-slate-300">All Accounts Settled</p>
                <p className="text-xs">No overdue receivables in this workspace.</p>
              </div>
            ) : (
              overdueInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">
                      {inv.customer_details?.company_name || "Customer"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {inv.invoice_number} • Due {formatDate(inv.due_date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-400 block">
                      {formatCurrency(inv.outstanding_balance)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentAmount(inv.outstanding_balance);
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                    >
                      Record Pay
                    </button>
                  </div>
                </div>
              ))
            )}
            <Link
              href="/invoices"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-2"
            >
              <span>View All Invoices</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 4. Active Subscriptions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Live contracts in workspace</CardDescription>
            </div>
            <Link href="/subscriptions">
              <Button variant="outline" size="sm">
                View All Contracts
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Contract</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Billing Frequency</th>
                  <th className="pb-3 font-semibold">Next Invoice</th>
                  <th className="pb-3 font-semibold">Recurring Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {subsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No subscriptions found in this workspace.
                    </td>
                  </tr>
                ) : (
                  subscriptions.slice(0, 5).map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/40">
                      <td className="py-3 font-mono font-medium text-indigo-400">
                        {sub.subscription_number}
                      </td>
                      <td className="py-3 font-medium text-white">
                        {sub.customer_details?.company_name || "Enterprise"}
                      </td>
                      <td className="py-3">{sub.plan_details?.name || "Tier"}</td>
                      <td className="py-3 capitalize">
                        {sub.plan_details?.billing_interval || "Monthly"}
                      </td>
                      <td className="py-3">{formatDate(sub.next_billing_date)}</td>
                      <td className="py-3 font-semibold text-white">
                        {formatCurrency(sub.total_amount)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            sub.status === "active"
                              ? "success"
                              : sub.status === "paused"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {sub.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Auth Modal (Start Your Business / Sign In) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {authMode === "register"
                    ? "Start Your Subscription Business"
                    : "Sign In to Your Workspace"}
                </h3>
                <p className="text-xs text-slate-400">
                  {authMode === "register"
                    ? "Create an account and launch your first workspace"
                    : "Access your business workspaces and operations"}
                </p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Demo Login Helpers */}
            <div className="my-3 rounded-lg bg-slate-950/70 p-3 border border-slate-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick-Fill Demonstration Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@brightloop.com", "BrightloopAdmin2026!")}
                  className="rounded bg-indigo-600/20 px-2 py-1 text-[11px] text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30"
                >
                  Admin Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("staff@brightloop.com", "BrightloopStaff2026!")}
                  className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  Staff (Limited)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("customer@acme.com", "AcmeCustomer2026!")}
                  className="rounded bg-emerald-950/40 text-emerald-300 px-2 py-1 text-[11px] border border-emerald-800/40 hover:bg-emerald-900/40"
                >
                  Customer Portal
                </button>
              </div>
            </div>

            {authError && (
              <div className="mb-3 rounded-lg bg-red-950/50 border border-red-800 p-2.5 text-xs text-red-200">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="mb-3 rounded-lg bg-emerald-950/50 border border-emerald-800 p-2.5 text-xs text-emerald-200">
                {authSuccess}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Subscription Services"
                    value={authCompanyName}
                    onChange={(e) => setAuthCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 chars, Upper, Lower, Special"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
                >
                  {authMode === "register"
                    ? "Create Account & First Workspace"
                    : "Sign In to Platform"}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "register" ? "login" : "register");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  {authMode === "register"
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Start Your Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Creation Dialog */}
      <CreateWorkspaceDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={(ws) => {
          setActiveWorkspaceId(ws.id);
          queryClient.invalidateQueries();
        }}
        ownedCount={2}
      />
    </div>
  );
}
