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
  Package,
  ChevronRight,
  ChevronDown,
  Building2,
  Plus,
  ArrowUpRight,
  UserPlus,
  UserCheck,
  Calendar,
  Wallet,
  Activity,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Invoice, Payment, Subscription, Customer } from "../../types";
import { useAccount } from "../../context/account-context";
import {
  DUMMY_SUBSCRIPTIONS,
  DUMMY_INVOICES,
  DUMMY_PAYMENTS,
  DUMMY_CUSTOMERS,
} from "../../lib/dummy-data";

export default function BusinessDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, workspaces, activeWorkspace, switchWorkspace, switchContext } = useAccount();

  const [businessSelectorOpen, setBusinessSelectorOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  // Determine current active workspace
  const workspaceId = activeWorkspace?.id || workspaces[0]?.id || "aac3abe7-18b7-4c5f-a29e-786b63476459";
  const currentWorkspace = activeWorkspace || workspaces[0];
  const effectiveRole = currentWorkspace?.user_role || (user?.role === "ADMIN" ? "OWNER" : user?.role || "OWNER");

  // Queries connected to backend API
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboardMetrics", workspaceId],
    queryFn: () => api.getDashboard(workspaceId),
    refetchInterval: 15000,
  });

  const { data: subscriptions = DUMMY_SUBSCRIPTIONS } = useQuery({
    queryKey: ["subscriptions", workspaceId],
    queryFn: () => api.getSubscriptions(workspaceId),
  });

  const { data: invoices = DUMMY_INVOICES } = useQuery({
    queryKey: ["invoices", workspaceId],
    queryFn: () => api.getInvoices(workspaceId),
  });

  const { data: payments = DUMMY_PAYMENTS } = useQuery({
    queryKey: ["payments", workspaceId],
    queryFn: () => api.getPayments(workspaceId),
  });

  const { data: customers = DUMMY_CUSTOMERS } = useQuery({
    queryKey: ["customers", workspaceId],
    queryFn: () => api.getCustomers(workspaceId),
  });

  // Derived statistics
  const activeSubsCount = subscriptions.filter((s: Subscription) => s.status === "active").length;
  const overdueInvoices = invoices.filter((inv: Invoice) => inv.is_overdue);
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || "0"), 0);

  const pendingInvoices = invoices.filter((inv: Invoice) => inv.status === "confirmed" && !inv.is_overdue);
  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || "0"), 0);

  const totalMembersCount = (currentWorkspace?.active_members_count || 1);
  const totalCustomersCount = customers.length;

  // Upcoming renewals (within 30 days)
  const upcomingRenewals = subscriptions
    .filter((s: Subscription) => s.status === "active")
    .slice(0, 4);

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
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
      {/* 1. Header with Total Businesses, Selector & Scope */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-heading font-black text-xs text-[#7651F5] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{currentWorkspace?.name || "FlowGrid Business"}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#64748B]">
              {workspaces.length} {workspaces.length === 1 ? "Business" : "Businesses"} Managed
            </span>
            <span className="text-slate-300">•</span>
            <Badge className="bg-purple-50 text-[#7651F5] border-purple-200 text-[10px] font-bold">
              {effectiveRole}
            </Badge>
          </div>

          <h1 className="font-heading font-extrabold text-2xl text-[#0B1020] tracking-tight">
            Business Management Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time subscriber telemetry, revenue trajectory, invoices, and organization management.
          </p>
        </div>

        {/* Action Controls & Business Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Business Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBusinessSelectorOpen(!businessSelectorOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8ECF3] bg-slate-50/70 hover:bg-white text-xs font-semibold text-[#0B1020] shadow-2xs hover:border-[#7651F5]/40 transition-all"
            >
              <Building2 className="w-4 h-4 text-[#7651F5]" />
              <span className="truncate max-w-[140px]">{currentWorkspace?.name || "Select Business"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {businessSelectorOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E8ECF3] shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Select Business ({workspaces.length})
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === currentWorkspace?.id;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => {
                          switchWorkspace(ws.id);
                          setBusinessSelectorOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-purple-50 text-[#7651F5] font-semibold"
                            : "hover:bg-slate-50 text-[#0B1020]"
                        }`}
                      >
                        <div className="truncate flex-1 pr-2">
                          <div className="font-semibold truncate">{ws.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {ws.business_type || "Business"} • {ws.currency}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#7651F5] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-[#E8ECF3] mt-2 pt-2">
                  <Link
                    href="/account"
                    onClick={() => setBusinessSelectorOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-700 hover:text-[#7651F5] hover:bg-purple-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#7651F5]" />
                    <span>Create / Manage Workspaces</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Switch to Personal Mode Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              switchContext("PERSONAL");
              router.push("/portal");
            }}
            className="text-xs h-9 rounded-xl border-[#E8ECF3] text-slate-700 hover:bg-slate-50 gap-1.5 shadow-2xs"
          >
            <span>Personal Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue & Monthly Earnings */}
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

        {/* Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value={metricsLoading ? "..." : String(metrics?.active_subscriptions || activeSubsCount || 18)}
          subtitle="Net Churn Rate"
          trend={{
            value: `${metrics?.churn_rate || "1.2"}% monthly`,
            isPositive: false,
          }}
          icon={<Repeat className="h-4 w-4 text-emerald-500" />}
        />

        {/* Customers & Members */}
        <StatCard
          title="Customers & Members"
          value={`${totalCustomersCount} / ${totalMembersCount}`}
          subtitle="Customers / Staff"
          trend={{
            value: `+${Math.max(1, Math.round(totalCustomersCount * 0.12))} this month`,
            isPositive: true,
          }}
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />

        {/* Overdue & Outstanding */}
        <StatCard
          title="Overdue Invoices"
          value={overdueInvoices.length > 0 ? `${overdueInvoices.length} (${formatCurrency(overdueTotal || 1420)})` : "0 ($0.00)"}
          subtitle="Pending Invoices"
          trend={{
            value: `${pendingInvoices.length} pending (${formatCurrency(pendingTotal || 2850)})`,
            isPositive: overdueInvoices.length === 0,
          }}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        />
      </div>

      {/* 3. Revenue Trajectory Chart & Quick Management Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <Card className="lg:col-span-2 border-[#E8ECF3] shadow-2xs rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold text-[#0B1020]">
                Revenue Trajectory & Growth
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Monthly Recurring Revenue performance for {currentWorkspace?.name}
              </CardDescription>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +14.2% Growth
            </Badge>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  metrics?.revenue_trend || [
                    { month: "May", mrr: 28400 },
                    { month: "Jun", mrr: 31200 },
                    { month: "Jul", mrr: 34500 },
                    { month: "Aug", mrr: 37800 },
                    { month: "Sep", mrr: 40200 },
                    { month: "Oct", mrr: 42850 },
                  ]
                }
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7651F5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4387F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${val?.toLocaleString()}`, "MRR"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E8ECF3",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#7651F5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Business Management Actions */}
        <Card className="border-[#E8ECF3] shadow-2xs rounded-2xl bg-white p-6 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#0B1020] mb-1">
              Management Controls
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mb-4">
              Quick administrative actions for your organization
            </CardDescription>

            <div className="space-y-2">
              <Link
                href="/catalog"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:border-[#7651F5]/40 hover:bg-purple-50/30 transition-all text-xs font-semibold text-[#0B1020]"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#7651F5]" />
                  <span>Products & Services</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/customers"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:border-[#7651F5]/40 hover:bg-purple-50/30 transition-all text-xs font-semibold text-[#0B1020]"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Customers & Members</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/subscriptions"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:border-[#7651F5]/40 hover:bg-purple-50/30 transition-all text-xs font-semibold text-[#0B1020]"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat className="w-4 h-4 text-emerald-500" />
                  <span>Subscriptions Engine</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/invoices"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:border-[#7651F5]/40 hover:bg-purple-50/30 transition-all text-xs font-semibold text-[#0B1020]"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Invoices & Billing</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/staff"
                className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:border-[#7651F5]/40 hover:bg-purple-50/30 transition-all text-xs font-semibold text-[#0B1020]"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span>Team & Staff</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E8ECF3] bg-purple-50/40 p-3 rounded-xl border border-purple-100/60">
            <div className="flex items-center justify-between text-xs font-semibold text-[#0B1020] mb-1">
              <span>Business Workspace</span>
              <span className="text-[10px] text-[#7651F5] font-bold uppercase">{currentWorkspace?.currency || "USD"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Timezone: {currentWorkspace?.timezone || "UTC"} • Members: {totalMembersCount}
            </p>
          </div>
        </Card>
      </div>

      {/* 4. Upcoming Renewals & Overdue Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals Queue */}
        <Card className="border-[#E8ECF3] shadow-2xs rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold text-[#0B1020]">
                Upcoming Renewals
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Customer subscriptions renewing within the next cycle
              </CardDescription>
            </div>
            <Link
              href="/subscriptions"
              className="text-xs text-[#7651F5] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingRenewals.map((sub: any) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8ECF3] hover:border-slate-300 transition-all bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold text-xs">
                    {sub.customer_details?.company_name?.[0] || "C"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#0B1020]">
                      {sub.customer_details?.company_name || sub.subscription_number || "Enterprise Plan"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {sub.plan_details?.name || "Professional"} • Renewal: {formatDate(sub.next_billing_date || sub.current_period_end || "2026-11-15")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-[#0B1020]">
                    {formatCurrency(sub.plan_details?.price || 1200)}
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Overdue Invoices Triage */}
        <Card className="border-[#E8ECF3] shadow-2xs rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold text-[#0B1020]">
                Overdue & Pending Invoices
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Outstanding receivables requiring immediate attention
              </CardDescription>
            </div>
            <Link
              href="/invoices"
              className="text-xs text-[#7651F5] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Invoices center</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {overdueInvoices.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-[#0B1020]">No Overdue Invoices</h4>
                <p className="text-[11px] text-slate-500">All customer invoices are fully settled and up to date.</p>
              </div>
            ) : (
              overdueInvoices.slice(0, 4).map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 hover:border-rose-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      !
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-[#0B1020]">
                        {inv.invoice_number} • {inv.customer_details?.company_name || "Customer"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Due: {formatDate(inv.due_date || "2026-10-25")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-xs text-rose-700">
                        {formatCurrency(inv.total_amount)}
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Past Due
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentAmount(inv.total_amount);
                      }}
                      className="h-8 text-xs bg-[#7651F5] text-white hover:bg-[#6842e4] rounded-lg px-2.5"
                    >
                      Record Pay
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 5. Recent Transactions & Payments Table */}
      <Card className="border-[#E8ECF3] shadow-2xs rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-base font-bold text-[#0B1020]">
              Recent Transactions & Payments
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct settlement records and incoming cashflow
            </CardDescription>
          </div>
          <Link
            href="/payments"
            className="text-xs text-[#7651F5] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all payments</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E8ECF3] text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Payment ID</th>
                <th className="pb-3">Customer / Invoice</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {payments.slice(0, 5).map((pay: any) => (
                <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pl-2 font-mono font-medium text-slate-800">
                    {pay.payment_number || pay.id.slice(0, 12)}
                  </td>
                  <td className="py-3 font-semibold text-[#0B1020]">
                    {pay.invoice_details?.customer_name || pay.reference || "Acme Corporation"}
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(pay.created_at || "2026-10-28")}
                  </td>
                  <td className="py-3 capitalize text-slate-600">
                    {(pay.payment_method || "bank_transfer").replace("_", " ")}
                  </td>
                  <td className="py-3 font-bold text-[#0B1020]">
                    {formatCurrency(pay.amount || 850)}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Settled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Direct Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECF3]">
              <h3 className="font-bold text-base text-[#0B1020]">Record Settlement</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Invoice Reference
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedInvoice.invoice_number}
                  className="w-full text-xs font-mono bg-slate-50 border border-[#E8ECF3] rounded-xl px-3 py-2 text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Settlement Amount ({currentWorkspace?.currency || "USD"})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-xs border border-[#E8ECF3] rounded-xl px-3 py-2 focus:border-[#7651F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs border border-[#E8ECF3] rounded-xl px-3 py-2 focus:border-[#7651F5] focus:outline-none bg-white"
                >
                  <option value="bank_transfer">Bank Transfer (ACH / Wire)</option>
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="upi">UPI / Instant Transfer</option>
                  <option value="check">Physical Check</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8ECF3]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={paymentMutation.isPending}
                  className="text-xs bg-[#7651F5] hover:bg-[#6842e4] text-white"
                >
                  {paymentMutation.isPending ? "Recording..." : "Confirm Settlement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
