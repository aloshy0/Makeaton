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
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  CalendarCheck,
  FileCheck,
  Briefcase,
  Layers,
  ChevronRight,
  UserCheck,
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

import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { StatCard } from "../../components/ui/stat-card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { Invoice } from "../../types";
import { useAccount } from "../../context/account-context";
import {
  DUMMY_SUBSCRIPTIONS,
  DUMMY_INVOICES,
  DUMMY_APPROVAL_REQUESTS,
  DUMMY_CUSTOMERS,
} from "../../lib/dummy-data";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { activeWorkspace, workspaces } = useAccount();

  // Active role in current workspace (Owner, Admin, or Staff)
  const [roleOverride, setRoleOverride] = useState<"OWNER" | "ADMIN" | "STAFF" | null>(null);
  const effectiveRole = roleOverride || activeWorkspace?.user_role || "OWNER";

  // Payment recording modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const workspaceId = activeWorkspace?.id || "aac3abe7-18b7-4c5f-a29e-786b63476459";

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboardMetrics", workspaceId],
    queryFn: () => api.getDashboard(workspaceId),
    refetchInterval: 15000,
  });

  const { data: subscriptions = DUMMY_SUBSCRIPTIONS } = useQuery({
    queryKey: ["subscriptions", workspaceId],
    queryFn: () => api.getSubscriptions(workspaceId),
  });

  const { data: overdueInvoices = DUMMY_INVOICES.filter((inv) => inv.is_overdue) } = useQuery({
    queryKey: ["invoices", "overdue", workspaceId],
    queryFn: () => api.getInvoices(workspaceId, true),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(workspaceId, data),
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Workspace Banner & Role Adaptive Switcher */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-heading font-black text-xs text-[#7651F5] uppercase tracking-wider">
              {activeWorkspace?.name || "FlowGrid Workspace"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#64748B]">Active Scope: {workspaceId.slice(0, 8)}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#0B1020] tracking-tight">
            {effectiveRole === "OWNER" && "Executive Financial & Telemetry Overview"}
            {effectiveRole === "ADMIN" && "Operations & Subscriber Administration"}
            {effectiveRole === "STAFF" && "Staff Task & Operational Workboard"}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            {effectiveRole === "OWNER" &&
              "Real-time recurring revenue, cashflow trajectory, and company performance."}
            {effectiveRole === "ADMIN" &&
              "Subscription lifecycle state machine, approval triage, and billing execution."}
            {effectiveRole === "STAFF" &&
              "Assigned operational duties, customer inquiries, and catalog maintenance."}
          </p>
        </div>

        {/* Role Preview Bar */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-[#E8ECF3]">
          <span className="text-[11px] font-bold text-[#64748B] px-2 uppercase tracking-wider">
            View as:
          </span>
          {(["OWNER", "ADMIN", "STAFF"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleOverride(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                effectiveRole === r
                  ? "bg-white text-[#7651F5] shadow-xs border border-purple-200"
                  : "text-[#64748B] hover:text-[#0B1020]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OWNER DASHBOARD VIEW                                                  */}
      {/* ========================================================================= */}
      {effectiveRole === "OWNER" && (
        <div className="space-y-6">
          {/* Financial KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Monthly Recurring Revenue"
              value={metricsLoading ? "..." : formatCurrency(metrics?.mrr || 42850)}
              subtitle="Annualized ARR"
              trend={{
                value: `${formatCurrency(metrics?.arr || 514200)} / yr`,
                isPositive: true,
              }}
              icon={<DollarSign className="h-4 w-4 text-[#7651F5]" />}
              highlight
            />

            <StatCard
              title="Active Subscriptions"
              value={metricsLoading ? "..." : (metrics?.active_subscriptions ?? 142)}
              subtitle={`Out of ${metrics?.total_subscriptions ?? 160} total`}
              icon={<Repeat className="h-4 w-4 text-[#4387F7]" />}
            />

            <StatCard
              title="Collected Revenue"
              value={
                metricsLoading ? "..." : formatCurrency(metrics?.total_collected_revenue || 398200)
              }
              subtitle="Reconciled & settled"
              trend={{ value: "+99.4% collection rate", isPositive: true }}
              icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
            />

            <StatCard
              title="Overdue Outstanding"
              value={
                metricsLoading ? "..." : formatCurrency(metrics?.total_overdue_amount || 14200)
              }
              subtitle={`${metrics?.overdue_invoices_count ?? 3} invoices overdue`}
              trend={
                (metrics?.overdue_invoices_count ?? 0) > 0
                  ? { value: "Follow-up Required", isPositive: false }
                  : { value: "All Settled", isPositive: true }
              }
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            />
          </div>

          {/* Revenue Recognition Trend & Lifecycle Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-2xl border-[#E8ECF3] bg-white shadow-2xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading font-bold text-base text-[#0B1020]">
                      Revenue Velocity & Cash Flow Trend
                    </CardTitle>
                    <CardDescription className="text-xs text-[#64748B]">
                      Monthly collections trajectory across recurring billing schedules
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span>+18.4% MRR Growth</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        metrics?.cashflow_trends?.length
                          ? metrics.cashflow_trends
                          : [
                              { month: "May", amount: 28400 },
                              { month: "Jun", amount: 31200 },
                              { month: "Jul", amount: 35600 },
                              { month: "Aug", amount: 38900 },
                              { month: "Sep", amount: 41200 },
                              { month: "Oct", amount: 42850 },
                            ]
                      }
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7651F5" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#7651F5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8ECF3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />
                      <Tooltip
                        formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                        contentStyle={{
                          backgroundColor: "#0B1020",
                          borderColor: "#1e293b",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#7651F5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Pipeline Status Distribution */}
            <Card className="rounded-2xl border-[#E8ECF3] bg-white shadow-2xs">
              <CardHeader>
                <CardTitle className="font-heading font-bold text-base text-[#0B1020]">
                  Subscription Lifecycle
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Live state machine breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {[
                  {
                    label: "Active Billing",
                    count: metrics?.active_subscriptions ?? 142,
                    variant: "active" as const,
                  },
                  {
                    label: "Pending Quotations",
                    count: metrics?.quotations_count ?? 12,
                    variant: "quotation" as const,
                  },
                  {
                    label: "Paused Subscriptions",
                    count: metrics?.paused_subscriptions ?? 4,
                    variant: "paused" as const,
                  },
                  {
                    label: "Closed / Cancelled",
                    count: metrics?.closed_subscriptions ?? 2,
                    variant: "closed" as const,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={item.variant} withDot={false}>
                        {item.label}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0B1020]">{item.count}</span>
                  </div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/subscriptions"
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[#7651F5] hover:bg-purple-50 transition-colors"
                  >
                    <span>Manage all subscriptions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN DASHBOARD VIEW                                                  */}
      {/* ========================================================================= */}
      {effectiveRole === "ADMIN" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Subscriptions Operational"
              value={subscriptions.length}
              subtitle="Across active catalog plans"
              icon={<Repeat className="h-4 w-4 text-[#7651F5]" />}
            />
            <StatCard
              title="Pending Operational Approvals"
              value={DUMMY_APPROVAL_REQUESTS.filter((a) => a.status === "PENDING").length}
              subtitle="Requires tier-2 authorization"
              icon={<ShieldCheck className="h-4 w-4 text-amber-500 text-base" />}
            />
            <StatCard
              title="Active Customers"
              value={DUMMY_CUSTOMERS.length}
              subtitle="Registered billing entities"
              icon={<Users className="h-4 w-4 text-[#4387F7]" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals Queue */}
            <Card className="rounded-2xl border-[#E8ECF3] bg-white shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-heading font-bold text-base text-[#0B1020]">
                    Pending Approvals
                  </CardTitle>
                  <CardDescription className="text-xs text-[#64748B]">
                    Requests requiring administrator sign-off
                  </CardDescription>
                </div>
                <Link
                  href="/approvals"
                  className="text-xs font-semibold text-[#7651F5] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {DUMMY_APPROVAL_REQUESTS.slice(0, 3).map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#0B1020]">
                        {req.action_type.replace(/_/g, " ")} — #{req.id.slice(0, 8)}
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        {req.payload?.reason || "Pending review"}
                      </div>
                    </div>
                    <Badge variant="warning">{req.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions & Maintenance */}
            <Card className="rounded-2xl border-[#E8ECF3] bg-white shadow-2xs">
              <CardHeader>
                <CardTitle className="font-heading font-bold text-base text-[#0B1020]">
                  Administration Utilities
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/catalog"
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-[#7651F5]" />
                    <div>
                      <div className="text-xs font-semibold text-[#0B1020]">
                        Manage Catalog & Plans
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Configure billing intervals & tiers
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/staff"
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#4387F7]" />
                    <div>
                      <div className="text-xs font-semibold text-[#0B1020]">
                        Staff & Permissions
                      </div>
                      <div className="text-[11px] text-[#64748B]">Manage RBAC and invites</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/integrations"
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-semibold text-[#0B1020]">
                        Webhooks & API Keys
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Monitor webhook delivery pipelines
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STAFF DASHBOARD VIEW                                                  */}
      {/* ========================================================================= */}
      {effectiveRole === "STAFF" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Assigned Tasks"
              value="5 Active"
              subtitle="Due before end of week"
              icon={<CalendarCheck className="h-4 w-4 text-[#7651F5]" />}
            />
            <StatCard
              title="Quotations to Review"
              value="2 Pending"
              subtitle="Customer approval waiting"
              icon={<FileCheck className="h-4 w-4 text-amber-500" />}
            />
            <StatCard
              title="Customer Communications"
              value="8 Open"
              subtitle="CRM customer interactions"
              icon={<Users className="h-4 w-4 text-[#4387F7]" />}
            />
          </div>

          <Card className="rounded-2xl border-[#E8ECF3] bg-white shadow-2xs">
            <CardHeader>
              <CardTitle className="font-heading font-bold text-base text-[#0B1020]">
                Staff Operational Workboard
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Your assigned daily subscription operations and verification queue
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {[
                {
                  task: "Review customer quotation #Q-2026-081 for Enterprise Tier upgrade",
                  category: "Quotations",
                  status: "In Progress",
                  badge: "bg-blue-100 text-blue-700",
                },
                {
                  task: "Confirm bank transfer settlement for invoice #INV-2026-004 ($14,200)",
                  category: "Billing",
                  status: "Action Required",
                  badge: "bg-amber-100 text-amber-700",
                },
                {
                  task: "Verify tax rules configuration for European customer onboarding",
                  category: "Catalog",
                  status: "Ready",
                  badge: "bg-emerald-100 text-emerald-700",
                },
              ].map((t, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#0B1020]">{t.task}</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">Category: {t.category}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${t.badge}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overdue Invoices Alert Section (Visible to Owner & Admin) */}
      {(effectiveRole === "OWNER" || effectiveRole === "ADMIN") && overdueInvoices.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40 rounded-2xl shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-amber-900 text-sm font-heading font-bold">
                  Overdue Accounts Receivable ({overdueInvoices.length})
                </CardTitle>
              </div>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
              >
                View in Billing Manager
              </Link>
            </div>
            <CardDescription className="text-amber-700/80 text-xs">
              Settlements past grace period. Record payment or notify customer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-amber-200/60">
              {overdueInvoices.slice(0, 3).map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-amber-950 font-mono">
                      {inv.invoice_number || inv.id.slice(0, 8)}
                    </span>
                    <span className="text-amber-800 ml-2">
                      Due: {formatDate(inv.due_date || inv.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-950 font-mono">
                      {formatCurrency(inv.outstanding_balance || inv.total_amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-amber-300 text-amber-900 hover:bg-amber-100/60"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentAmount(inv.outstanding_balance || inv.total_amount);
                      }}
                    >
                      Record Settlement
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Recording Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8ECF3]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-heading font-bold text-base text-[#0B1020]">
                Record Invoice Payment
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">Invoice</label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-700">
                  {selectedInvoice.invoice_number || selectedInvoice.id}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">
                  Settlement Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#E8ECF3] px-3 py-2 text-xs font-mono focus:border-[#7651F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-[#E8ECF3] px-3 py-2 text-xs focus:border-[#7651F5] focus:outline-none bg-white"
                >
                  <option value="bank_transfer">Bank Wire Transfer</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="manual">Manual Ledger Journal</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={paymentMutation.isPending}
                  className="bg-[#7651F5] hover:bg-[#6842e6] text-white font-semibold rounded-xl"
                >
                  {paymentMutation.isPending ? "Recording..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
