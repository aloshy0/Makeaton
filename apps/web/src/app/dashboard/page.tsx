"use client";

import React, { useState, useId } from "react";
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
  Layers,
  ChevronRight,
  UserCheck,
  Briefcase,
  Play,
  ArrowUpRight,
  Filter,
  Download,
  Calendar,
  Check,
  Building2,
  ExternalLink,
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
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Invoice, Subscription } from "../../types";
import { useAccount } from "../../context/account-context";
import {
  DUMMY_SUBSCRIPTIONS,
  DUMMY_INVOICES,
  DUMMY_APPROVAL_REQUESTS,
  DUMMY_CUSTOMERS,
} from "../../lib/dummy-data";

const REVENUE_DATA = [
  { month: "Jan", revenue: 850, collections: 780, subscriptions: 8 },
  { month: "Feb", revenue: 980, collections: 940, subscriptions: 11 },
  { month: "Mar", revenue: 1120, collections: 1050, subscriptions: 14 },
  { month: "Apr", revenue: 1340, collections: 1290, subscriptions: 18 },
  { month: "May", revenue: 1520, collections: 1480, subscriptions: 21 },
  { month: "Jun", revenue: 1698, collections: 1650, subscriptions: 24 },
];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { activeWorkspace, switchContext } = useAccount();

  // Role preview bar (Owner, Admin, or Staff)
  const [roleOverride, setRoleOverride] = useState<"OWNER" | "ADMIN" | "STAFF" | null>(null);
  const effectiveRole = roleOverride || activeWorkspace?.user_role || "OWNER";

  // Timeframe selector
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D" | "12M">("30D");

  // Payment recording modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Approvals quick triage
  const [approvalList, setApprovalList] = useState(DUMMY_APPROVAL_REQUESTS);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const workspaceId = activeWorkspace?.id || "aac3abe7-18b7-4c5f-a29e-786b63476459";

  const { data: metrics } = useQuery({
    queryKey: ["dashboardMetrics", workspaceId],
    queryFn: () => api.getDashboard(workspaceId),
    refetchInterval: 15000,
  });

  const { data: subscriptions = DUMMY_SUBSCRIPTIONS } = useQuery({
    queryKey: ["subscriptions", workspaceId],
    queryFn: () => api.getSubscriptions(workspaceId),
  });

  const {
    data: overdueInvoices = DUMMY_INVOICES.filter(
      (inv) => inv.is_overdue || inv.status === "confirmed"
    ),
  } = useQuery({
    queryKey: ["invoices", "overdue", workspaceId],
    queryFn: () => api.getInvoices(workspaceId, true),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setPaymentSuccess(true);
      setTimeout(() => {
        setSelectedInvoice(null);
        setPaymentAmount("");
        setPaymentSuccess(false);
      }, 1500);
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

  const handleTriageApproval = (id: string, action: "APPROVED" | "REJECTED") => {
    setApprovalList((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: action } : req))
    );
    setApprovalMessage(`Request ${action.toLowerCase()} successfully.`);
    setTimeout(() => setApprovalMessage(null), 3000);
  };

  const mrrValue = metrics?.mrr || "1,698.00";
  const arrValue = metrics?.arr || "20,376.00";
  const activeSubsCount = subscriptions.filter((s) => s.status === "active").length || 24;
  const overdueCount = overdueInvoices.length || 2;
  const pendingAmount = overdueInvoices
    .reduce(
      (acc, curr) => acc + parseFloat(curr.outstanding_balance || curr.total_amount || "0"),
      0
    )
    .toFixed(2);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Sleek Dashboard Header with Persona Simulator & Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-heading font-black text-xs text-[#7651F5] uppercase tracking-wider">
              {activeWorkspace?.name || "FlowGrid Cloud Technologies"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#64748B] font-medium">
              Currency: {activeWorkspace?.currency || "USD"}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl text-[#0B1020] tracking-tight">
            Executive Financial & Telemetry Overview
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time recurring revenue, cashflow trajectory, and subscription lifecycle state
            machine.
          </p>
        </div>

        {/* Right Controls: Role Preview Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Persona View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-[#E8ECF3]">
            <span className="text-[10px] font-bold text-[#64748B] px-2 uppercase tracking-wider hidden sm:inline">
              Role:
            </span>
            <button
              onClick={() => setRoleOverride("OWNER")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                effectiveRole === "OWNER"
                  ? "bg-white text-[#7651F5] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B1020]"
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => setRoleOverride("ADMIN")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                effectiveRole === "ADMIN"
                  ? "bg-white text-[#7651F5] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B1020]"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleOverride("STAFF")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                effectiveRole === "STAFF"
                  ? "bg-white text-[#7651F5] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B1020]"
              }`}
            >
              Staff
            </button>
          </div>

          <Link href="/subscriptions">
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold rounded-xl shadow-md shadow-purple-600/20"
            >
              <span>+ New Subscription</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. 4 Modern KPI Stat Cards — Absolutely Zero Text Truncation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MRR */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:border-purple-200 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Monthly Recurring Revenue
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl text-[#0B1020] tracking-tight">
            ${mrrValue}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="h-3 w-3" />
              +12.4% vs last mo
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">${arrValue} ARR</span>
          </div>
        </div>

        {/* Card 2: Active Subscriptions */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:border-purple-200 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Active Subscriptions
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl text-[#0B1020] tracking-tight">
            {activeSubsCount}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="h-3 w-3" />
              +3 new this cycle
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">98.2% retention</span>
          </div>
        </div>

        {/* Card 3: Net Cash Collections */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:border-purple-200 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Net Collections (30D)
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl text-[#0B1020] tracking-tight">
            $18,450.00
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <CheckCircle2 className="h-3 w-3" />
              100% Settled
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">Direct gateway sync</span>
          </div>
        </div>

        {/* Card 4: Outstanding Invoices */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:border-amber-200 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Outstanding Invoices
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="font-heading font-black text-2xl text-amber-600 tracking-tight">
            ${pendingAmount}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Clock className="h-3 w-3" />
              {overdueCount} Pending
            </span>
            <span className="text-[11px] font-semibold text-[#64748B]">Auto-dunning ready</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Visual Analytics: Revenue Velocity & Plan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0B1020]">
                Revenue Velocity & Collections Trajectory
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Monthly collections and recurring run-rate progression
              </p>
            </div>

            {/* Timeframe pill toggle */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-[#E8ECF3] self-start sm:self-auto">
              {(["7D", "30D", "90D", "12M"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeframe === t
                      ? "bg-white text-[#7651F5] shadow-xs"
                      : "text-[#64748B] hover:text-[#0B1020]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7651F5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7651F5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4387F7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4387F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    borderRadius: "14px",
                    border: "1px solid #E8ECF3",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: any) => [
                    `$${value}`,
                    name === "revenue" ? "MRR Target" : "Cash Collected",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7651F5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="collections"
                  stroke="#4387F7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorCollections)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E8ECF3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-[#0B1020]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7651F5]" />
                MRR Run-rate ($1,698.00)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#0B1020]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4387F7]" />
                Actual Collected ($1,650.00)
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Updated 2 mins ago • Real-time Celery telemetry
            </span>
          </div>
        </div>

        {/* Right Distribution & Telemetry (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Plan Breakdown Card */}
          <div className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs">
            <h3 className="font-heading font-bold text-sm text-[#0B1020] mb-1">
              Active Plans Distribution
            </h3>
            <p className="text-xs text-[#64748B] mb-4">Subscription share by revenue tier</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#0B1020]">Enterprise Cloud ($99/mo)</span>
                  <span className="text-[#7651F5] font-bold">12 subs (50%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7651F5] rounded-full" style={{ width: "50%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#0B1020]">Professional Team ($50/mo)</span>
                  <span className="text-blue-600 font-bold">8 subs (33%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "33%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#0B1020]">Starter Launch ($25/mo)</span>
                  <span className="text-emerald-600 font-bold">4 subs (17%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "17%" }} />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E8ECF3]">
              <Link
                href="/catalog"
                className="flex items-center justify-between text-xs font-bold text-[#7651F5] hover:text-[#5B3CD4] transition-colors"
              >
                <span>Manage Plan Catalog & Quotas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Infrastructure Health Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Tenant Isolation
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="font-heading font-bold text-sm text-white">SOC2 Isolated Schema</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Zero cross-tenant latency • Active cluster US-East-1 • Postgres 16
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Database Ping</span>
              <span className="font-bold text-emerald-400">18ms Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Workboards: Subscriptions & Action-Required Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Workboard: Recent Subscriptions */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#0B1020]">
                  Recent Subscriptions
                </h3>
                <p className="text-xs text-[#64748B]">
                  Live customer lifecycle and recurring billing records
                </p>
              </div>
              <Link href="/subscriptions">
                <Button variant="ghost" size="sm" className="text-xs text-[#7651F5] font-bold">
                  View All ({subscriptions.length})
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {subscriptions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E8ECF3] hover:border-purple-200 hover:bg-slate-50/50 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold font-heading">
                      {(
                        sub.customer_details?.company_name ||
                        sub.customer_details?.contact_name ||
                        sub.customer ||
                        "CU"
                      )
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#0B1020] truncate max-w-[160px]">
                        {sub.customer_details?.company_name ||
                          sub.customer_details?.contact_name ||
                          sub.customer}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {sub.plan_details?.name || "Enterprise Tier"} • Renew:{" "}
                        {formatDate(sub.expiry_date || sub.next_billing_date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#0B1020]">
                      {formatCurrency(sub.subtotal || sub.total_amount)}
                      <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                        sub.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sub.status === "paused"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E8ECF3]">
            <Link
              href="/customers"
              className="flex items-center justify-between text-xs font-bold text-[#7651F5] hover:underline"
            >
              <span>Explore customer directory & usage quotas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Workboard: Overdue & Action-Required Invoices */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#0B1020]">
                  Invoices Awaiting Action
                </h3>
                <p className="text-xs text-[#64748B]">
                  Confirmed & overdue invoices eligible for manual settlement
                </p>
              </div>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="text-xs text-[#7651F5] font-bold">
                  View All ({overdueInvoices.length})
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {overdueInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-200/60 bg-amber-50/20 hover:bg-amber-50/50 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center font-bold">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0B1020] flex items-center gap-1.5">
                        <span>{inv.invoice_number}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          OVERDUE
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {inv.customer_details?.company_name ||
                          inv.customer_details?.contact_name ||
                          inv.customer}{" "}
                        • Due: {formatDate(inv.due_date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-amber-700">
                        {formatCurrency(inv.outstanding_balance || inv.total_amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">Balance Due</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentAmount(inv.outstanding_balance || inv.total_amount);
                      }}
                      className="text-xs bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold rounded-xl h-8 px-2.5"
                    >
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E8ECF3]">
            <Link
              href="/payments"
              className="flex items-center justify-between text-xs font-bold text-[#7651F5] hover:underline"
            >
              <span>View complete settlement & payment audit trail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Role-Adaptive Context Section (Admin Approvals Queue if Admin/Staff) */}
      {(effectiveRole === "ADMIN" || effectiveRole === "OWNER") && (
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Governance & Compliance
                </span>
                {approvalMessage && (
                  <span className="text-xs text-emerald-700 font-bold animate-in fade-in">
                    ✓ {approvalMessage}
                  </span>
                )}
              </div>
              <h3 className="font-heading font-bold text-base text-[#0B1020]">
                Dual-Control Operations Approval Queue
              </h3>
              <p className="text-xs text-[#64748B]">
                High-impact financial and subscription actions requiring Admin authorization
              </p>
            </div>
            <Link href="/approvals">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-[#E8ECF3] font-semibold"
              >
                View Full Queue
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvalList.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-[#E8ECF3] bg-slate-50/40 flex flex-col justify-between text-xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1020]">
                      {req.action_type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Requested by{" "}
                    <span className="font-semibold text-[#0B1020]">
                      {req.requested_by_email || req.requested_by}
                    </span>{" "}
                    • {req.payload?.reason || req.action_type}
                  </p>
                </div>

                {req.status === "PENDING" ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8ECF3]">
                    <Button
                      size="sm"
                      onClick={() => handleTriageApproval(req.id, "APPROVED")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 rounded-lg"
                    >
                      Approve Action
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriageApproval(req.id, "REJECTED")}
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-7 rounded-lg"
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#64748B] italic pt-2 border-t border-[#E8ECF3]">
                    Action marked as {req.status.toLowerCase()} by{" "}
                    {activeWorkspace?.name || "Workspace Admin"}.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Settlement Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8ECF3]">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#0B1020]">
                    Record Settlement
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Invoice #{selectedInvoice.invoice_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#0B1020] hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-2 animate-in fade-in">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <div className="font-heading font-bold text-base text-[#0B1020]">
                  Payment Recorded Successfully!
                </div>
                <p className="text-xs text-[#64748B]">
                  Invoice settled and payment ledger updated in real time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                    Settlement Amount ({activeWorkspace?.currency || "USD"})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3.5 py-2.5 text-xs text-[#0B1020] font-bold focus:border-[#7651F5] focus:bg-white focus:outline-none"
                  />
                  <div className="text-[11px] text-[#64748B] mt-1">
                    Total invoice balance:{" "}
                    {formatCurrency(
                      selectedInvoice.outstanding_balance || selectedInvoice.total_amount
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3.5 py-2.5 text-xs text-[#0B1020] font-semibold focus:border-[#7651F5] focus:bg-white focus:outline-none"
                  >
                    <option value="bank_transfer">ACH / Bank Wire Transfer</option>
                    <option value="credit_card">Corporate Credit Card (Stripe)</option>
                    <option value="adyen">Adyen Gateway</option>
                    <option value="check">Physical Check / Lockbox</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[#E8ECF3] flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 text-xs border-[#E8ECF3]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={paymentMutation.isPending}
                    className="flex-1 text-xs bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold"
                  >
                    {paymentMutation.isPending ? "Recording..." : "Confirm Payment"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
