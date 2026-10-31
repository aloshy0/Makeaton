"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Receipt,
  Settings,
  User as UserIcon,
  AlertCircle,
  ExternalLink,
  Layers,
  Users,
  Calendar,
  Lock,
  Mail,
  Phone,
  Check,
  RefreshCw,
  Clock,
  Briefcase,
  Sliders,
  DollarSign,
  Download,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { api } from "../../lib/api";
import {
  PersonalDashboardData,
  FlowGridPlan,
  Workspace,
  FlowGridPaymentMethod,
  FlowGridInvoice,
} from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CreateWorkspaceDialog } from "../../components/layout/create-workspace-dialog";
import { formatCurrency, formatDate } from "../../lib/utils";

export default function PersonalAccountPage() {
  const router = useRouter();
  const { user, workspaces, activeWorkspace, switchWorkspace, refreshWorkspaces } = useAccount();

  const [activeTab, setActiveTab] = useState<"businesses" | "plans" | "billing" | "profile">("businesses");
  const [dashboardData, setDashboardData] = useState<PersonalDashboardData | null>(null);
  const [plans, setPlans] = useState<FlowGridPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add Card modal state
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Load Personal Dashboard data
  const loadDashboard = async () => {
    try {
      const [dash, platformPlans] = await Promise.all([
        api.getPersonalDashboard().catch(() => null),
        api.getPlatformPlans().catch(() => []),
      ]);
      if (dash) {
        setDashboardData(dash);
      }
      if (platformPlans && platformPlans.length > 0) {
        setPlans(platformPlans);
      }
    } catch (err) {
      console.error("Failed to load personal dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpgradePlan = async (planSlug: string) => {
    setIsUpgrading(planSlug);
    setActionMessage(null);
    try {
      const res = await api.upgradePlatformPlan(planSlug);
      setActionMessage({ type: "success", text: res.message || `Successfully switched to ${planSlug.toUpperCase()} plan!` });
      await loadDashboard();
      await refreshWorkspaces();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Failed to switch plan. Please try again.",
      });
    } finally {
      setIsUpgrading(null);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExp) return;
    setIsAddingCard(true);
    setActionMessage(null);
    try {
      const cleanNumber = cardNumber.replace(/\s+/g, "");
      const last4 = cleanNumber.slice(-4) || "4242";
      const parts = cardExp.split("/");
      const expMonth = parseInt(parts[0], 10) || 12;
      const expYear = parseInt(parts[1]?.length === 2 ? `20${parts[1]}` : parts[1], 10) || 2028;

      await api.addPlatformPaymentMethod({
        brand: cardBrand.toLowerCase(),
        last4,
        exp_month: expMonth,
        exp_year: expYear,
        is_default: true,
      });

      setIsAddCardOpen(false);
      setCardNumber("");
      setCardExp("");
      setActionMessage({ type: "success", text: "Payment method saved successfully!" });
      await loadDashboard();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err?.message || "Failed to add payment method." });
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleLaunchWorkspace = (wsId: string) => {
    switchWorkspace(wsId);
    router.push("/dashboard");
  };

  const currentPlan = dashboardData?.flowgrid_plan || {
    name: "Pro",
    slug: "pro",
    price: 49,
    currency: "USD",
    billing_interval: "monthly",
    max_workspaces: 3,
    max_products_per_workspace: 25,
    max_customers_per_workspace: 500,
    max_team_members: 5,
    features: [
      "Up to 3 business workspaces",
      "25 products per workspace",
      "500 customers per workspace",
      "Advanced revenue analytics",
      "Up to 5 team members",
    ],
  };

  const usage = dashboardData?.usage_limits || {
    workspaces: {
      current: workspaces.length,
      max: currentPlan.max_workspaces,
      available_slots: Math.max(0, currentPlan.max_workspaces - workspaces.length),
      percentage: Math.min(100, Math.round((workspaces.length / currentPlan.max_workspaces) * 100)),
    },
    products_per_workspace: {
      max: currentPlan.max_products_per_workspace,
      total_across_workspaces: 3,
    },
    customers_per_workspace: {
      max: currentPlan.max_customers_per_workspace,
      total_across_workspaces: 6,
    },
  };

  const ownedWorkspaces = dashboardData?.owned_workspaces && dashboardData.owned_workspaces.length > 0
    ? dashboardData.owned_workspaces
    : workspaces;

  const isUnlimitedWorkspaces = currentPlan.max_workspaces >= 999;
  const isLimitReached = !isUnlimitedWorkspaces && usage.workspaces.current >= usage.workspaces.max;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-700 ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Hero Profile & FlowGrid Account Card */}
      <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-xl shadow-lg shadow-purple-500/20 shrink-0">
              {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "FG"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold font-heading text-[#0B1020]">
                  {user ? `${user.first_name} ${user.last_name}` : "FlowGrid User"}
                </h1>
                <Badge className="bg-purple-50 text-[#7651F5] border-purple-200 font-semibold px-2.5 py-0.5">
                  FlowGrid {currentPlan.name}
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || "user@flowgrid.com"}</span>
                <span className="text-slate-300">•</span>
                <span>Personal Account & Multi-Business Hub</span>
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-[#7651F5] to-[#4387F7] text-white font-semibold shadow-md shadow-purple-500/15 hover:opacity-95 text-xs px-5 py-2.5 h-auto rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create a Business</span>
            </Button>
          </div>
        </div>

        {/* Quota Limit Warning Banner */}
        {isLimitReached && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have reached your workspace limit (<strong>{usage.workspaces.current} / {usage.workspaces.max}</strong>) for the <strong>{currentPlan.name}</strong> plan. Upgrade to unlock more business workspaces.
              </span>
            </div>
            <button
              onClick={() => setActiveTab("plans")}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shrink-0"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        {/* Plan Limits & Resource Quotas Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E8ECF3]">
          {/* Workspaces Quota */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8ECF3]">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#7651F5]" />
                <span>Workspaces</span>
              </span>
              <span className="font-bold text-[#0B1020]">
                {usage.workspaces.current} / {isUnlimitedWorkspaces ? "∞" : usage.workspaces.max}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLimitReached ? "bg-amber-500" : "bg-[#7651F5]"
                }`}
                style={{
                  width: `${isUnlimitedWorkspaces ? 20 : usage.workspaces.percentage}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-2">
              {isUnlimitedWorkspaces
                ? "Unlimited business organizations"
                : `${usage.workspaces.available_slots} available slot${usage.workspaces.available_slots === 1 ? "" : "s"}`}
            </p>
          </div>

          {/* Products per Workspace */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8ECF3]">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Products Limit</span>
              </span>
              <span className="font-bold text-[#0B1020]">
                {currentPlan.max_products_per_workspace >= 999
                  ? "Unlimited"
                  : `${currentPlan.max_products_per_workspace} / business`}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "25%" }} />
            </div>
            <p className="text-[11px] text-[#64748B] mt-2">
              Catalog items & subscription tiers
            </p>
          </div>

          {/* Customers per Workspace */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8ECF3]">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customers Limit</span>
              </span>
              <span className="font-bold text-[#0B1020]">
                {currentPlan.max_customers_per_workspace >= 999
                  ? "Unlimited"
                  : `${currentPlan.max_customers_per_workspace} / business`}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "15%" }} />
            </div>
            <p className="text-[11px] text-[#64748B] mt-2">
              Subscribers & client organizations
            </p>
          </div>

          {/* Renewal & Billing Info */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[#E8ECF3]">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Plan Renewal</span>
              </span>
              <span className="font-bold text-[#0B1020]">
                ${Number(currentPlan.price || 0).toFixed(0)}/mo
              </span>
            </div>
            <div className="text-[11px] font-semibold text-[#0B1020] mt-1">
              {dashboardData?.flowgrid_subscription?.renewal_date
                ? formatDate(dashboardData.flowgrid_subscription.renewal_date)
                : "Renews Nov 30, 2026"}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Auto-renews monthly via saved card
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center gap-2 border-b border-[#E8ECF3] pb-1 overflow-x-auto [scrollbar-width:none]">
        <button
          onClick={() => setActiveTab("businesses")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "businesses"
              ? "bg-white text-[#7651F5] shadow-2xs border border-[#E8ECF3]"
              : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Businesses ({ownedWorkspaces.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "plans"
              ? "bg-white text-[#7651F5] shadow-2xs border border-[#E8ECF3]"
              : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>FlowGrid Plans & Upgrade</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "billing"
              ? "bg-white text-[#7651F5] shadow-2xs border border-[#E8ECF3]"
              : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payment Methods & Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-white text-[#7651F5] shadow-2xs border border-[#E8ECF3]"
              : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-100"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Account Settings</span>
        </button>
      </div>

      {/* TAB 1: BUSINESSES & WORKSPACES */}
      {activeTab === "businesses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-[#0B1020]">
                Business Workspaces
              </h2>
              <p className="text-xs text-[#64748B]">
                Each workspace is an isolated multi-tenant organization with its own products, customers, invoices and staff.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isLimitReached}
              className="bg-[#7651F5] text-white hover:bg-purple-700 text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create a Business</span>
            </Button>
          </div>

          {/* Workspaces List or Empty State */}
          {ownedWorkspaces.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#E8ECF3] p-12 text-center max-w-2xl mx-auto shadow-2xs">
              <div className="h-16 w-16 rounded-2xl bg-purple-50 text-[#7651F5] border border-purple-200 mx-auto flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#0B1020]">
                Your business journey starts here.
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Create your first business workspace to start managing products, subscriptions and recurring payments.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 bg-gradient-to-r from-[#7651F5] to-[#4387F7] text-white font-semibold text-xs px-6 py-2.5 h-auto rounded-xl shadow-md shadow-purple-500/20"
              >
                Create Your Business
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ownedWorkspaces.map((ws) => {
                const isActive = activeWorkspace?.id === ws.id;
                return (
                  <div
                    key={ws.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs flex flex-col justify-between ${
                      isActive
                        ? "border-[#7651F5] ring-2 ring-purple-500/10 shadow-sm"
                        : "border-[#E8ECF3] hover:border-purple-200"
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-[#7651F5] flex items-center justify-center font-heading font-black text-sm shrink-0">
                            {ws.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-[#0B1020] truncate max-w-[170px]">
                              {ws.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ws.business_type || "SaaS & Cloud"}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <span className="text-[10px] bg-purple-100 text-[#7651F5] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 py-3 border-y border-[#E8ECF3] text-xs">
                        <div className="flex items-center justify-between text-[#64748B]">
                          <span>Your Role:</span>
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.2 rounded text-[10px] border border-purple-200 uppercase">
                            {ws.user_role || "OWNER"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#64748B]">
                          <span>Currency:</span>
                          <span className="font-mono font-medium text-[#0B1020]">
                            {ws.currency || "USD"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#64748B]">
                          <span>Timezone:</span>
                          <span className="font-medium text-[#0B1020] truncate max-w-[130px]">
                            {ws.timezone || "America/New_York"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-2 flex items-center gap-2">
                      <Button
                        onClick={() => handleLaunchWorkspace(ws.id)}
                        className={`flex-1 text-xs font-semibold py-2 h-auto rounded-xl flex items-center justify-center gap-1.5 ${
                          isActive
                            ? "bg-[#7651F5] text-white hover:bg-purple-700"
                            : "bg-slate-50 hover:bg-purple-50 text-[#0B1020] hover:text-[#7651F5] border border-[#E8ECF3]"
                        }`}
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      <Link
                        href="/settings"
                        onClick={() => switchWorkspace(ws.id)}
                        className="p-2 rounded-xl border border-[#E8ECF3] text-slate-400 hover:text-[#0B1020] hover:bg-slate-50 transition-colors"
                        title="Workspace Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLOWGRID PLANS & LIMITS */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#0B1020]">
              FlowGrid Subscription Plans
            </h2>
            <p className="text-xs text-[#64748B]">
              These plans determine how many business workspaces, products and customers you can manage on FlowGrid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(plans.length > 0
              ? plans
              : [
                  {
                    id: "plan-basic",
                    name: "Basic",
                    slug: "basic",
                    price: 0,
                    currency: "USD",
                    billing_interval: "monthly",
                    max_workspaces: 1,
                    max_products_per_workspace: 5,
                    max_customers_per_workspace: 50,
                    max_team_members: 1,
                    features: [
                      "1 Business Workspace",
                      "5 Products per workspace",
                      "50 Customers per workspace",
                      "Basic analytics",
                      "1 Team member",
                    ],
                  },
                  {
                    id: "plan-pro",
                    name: "Pro",
                    slug: "pro",
                    price: 49,
                    currency: "USD",
                    billing_interval: "monthly",
                    max_workspaces: 3,
                    max_products_per_workspace: 25,
                    max_customers_per_workspace: 500,
                    max_team_members: 5,
                    features: [
                      "3 Business Workspaces",
                      "25 Products per workspace",
                      "500 Customers per workspace",
                      "Advanced analytics",
                      "5 Team members",
                      "Priority billing support",
                    ],
                  },
                  {
                    id: "plan-business",
                    name: "Business",
                    slug: "business",
                    price: 149,
                    currency: "USD",
                    billing_interval: "monthly",
                    max_workspaces: 9999,
                    max_products_per_workspace: 9999,
                    max_customers_per_workspace: 99999,
                    max_team_members: 9999,
                    features: [
                      "Unlimited Business Workspaces",
                      "Unlimited Products",
                      "Unlimited Customers",
                      "Full executive analytics",
                      "Unlimited Team members",
                      "Custom integrations & SLA",
                    ],
                  },
                ]
            ).map((plan) => {
              const isCurrent = currentPlan.slug === plan.slug;
              const isHighlighted = plan.slug === "pro";

              return (
                <div
                  key={plan.slug}
                  className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? "border-[#7651F5] ring-2 ring-purple-500/10 shadow-md"
                      : isHighlighted
                      ? "border-blue-200 shadow-sm"
                      : "border-[#E8ECF3]"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7651F5] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Current Plan
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg font-heading text-[#0B1020]">
                        {plan.name}
                      </h3>
                      {isHighlighted && !isCurrent && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-4 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold font-heading text-[#0B1020]">
                          ${Number(plan.price).toFixed(0)}
                        </span>
                        <span className="text-xs text-[#64748B]">/month</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Billed monthly, cancel anytime.
                      </p>
                    </div>

                    {/* Limits Spec */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-[#E8ECF3] space-y-2 mb-6 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Workspaces:</span>
                        <span className="font-bold text-[#0B1020]">
                          {plan.max_workspaces >= 999 ? "Unlimited" : `${plan.max_workspaces} max`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Products:</span>
                        <span className="font-bold text-[#0B1020]">
                          {plan.max_products_per_workspace >= 999 ? "Unlimited" : `${plan.max_products_per_workspace} / ws`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Customers:</span>
                        <span className="font-bold text-[#0B1020]">
                          {plan.max_customers_per_workspace >= 999 ? "Unlimited" : `${plan.max_customers_per_workspace} / ws`}
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2.5 text-xs text-[#64748B]">
                      {(plan.features || []).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#E8ECF3]">
                    {isCurrent ? (
                      <Button
                        disabled
                        className="w-full bg-slate-100 text-slate-500 font-semibold text-xs py-2.5 h-auto rounded-xl"
                      >
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgradePlan(plan.slug)}
                        disabled={isUpgrading !== null}
                        className={`w-full font-semibold text-xs py-2.5 h-auto rounded-xl transition-all ${
                          plan.slug === "business"
                            ? "bg-gradient-to-r from-[#7651F5] to-[#4387F7] text-white hover:opacity-95 shadow-md shadow-purple-500/15"
                            : "bg-white hover:bg-purple-50 text-[#7651F5] border border-purple-200"
                        }`}
                      >
                        {isUpgrading === plan.slug
                          ? "Switching..."
                          : Number(plan.price) > Number(currentPlan.price)
                          ? `Upgrade to ${plan.name}`
                          : `Switch to ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BILLING & PAYMENT METHODS */}
      {activeTab === "billing" && (
        <div className="space-y-8">
          {/* Saved Payment Methods */}
          <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold font-heading text-base text-[#0B1020]">
                  Saved FlowGrid Payment Methods
                </h3>
                <p className="text-xs text-[#64748B]">
                  Used exclusively for your FlowGrid platform plan subscription.
                </p>
              </div>

              <Button
                onClick={() => setIsAddCardOpen(true)}
                className="bg-white hover:bg-purple-50 text-[#7651F5] border border-purple-200 text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Payment Method</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {(dashboardData?.payment_methods && dashboardData.payment_methods.length > 0
                ? dashboardData.payment_methods
                : [
                    {
                      id: "pm-1",
                      brand: "visa",
                      last4: "4242",
                      exp_month: 12,
                      exp_year: 2028,
                      is_default: true,
                      created_at: new Date().toISOString(),
                    },
                  ]
              ).map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 rounded-2xl border border-[#E8ECF3] bg-slate-50/50 flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-12 rounded-lg bg-white border border-[#E8ECF3] flex items-center justify-center text-slate-700 font-bold uppercase text-[11px] shadow-2xs">
                      {pm.brand}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-[#0B1020]">
                        •••• •••• •••• {pm.last4}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Expires {String(pm.exp_month).padStart(2, "0")}/{pm.exp_year}
                      </div>
                    </div>
                  </div>

                  {pm.is_default && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                      Default
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FlowGrid Invoices Table */}
          <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold font-heading text-base text-[#0B1020]">
                FlowGrid Platform Invoices
              </h3>
              <p className="text-xs text-[#64748B]">
                Receipts for your FlowGrid software platform subscription. (Customer invoices for your business are managed in the Business Invoices section).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8ECF3] text-[#64748B] font-semibold">
                    <th className="pb-3 px-3">Invoice Number</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">FlowGrid Plan</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {(dashboardData?.invoices && dashboardData.invoices.length > 0
                    ? dashboardData.invoices
                    : [
                        {
                          id: "inv-fg-1",
                          invoice_number: "INV-FG-2026-001",
                          amount: 49.0,
                          currency: "USD",
                          status: "paid",
                          paid_at: new Date().toISOString(),
                          plan_name: "Pro",
                          created_at: new Date().toISOString(),
                        },
                      ]
                  ).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#0B1020]">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-3 text-[#64748B]">
                        {formatDate(inv.paid_at || inv.created_at)}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#0B1020]">
                        FlowGrid {inv.plan_name}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#0B1020]">
                        ${Number(inv.amount).toFixed(2)} {inv.currency}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => alert(`Downloading official receipt for ${inv.invoice_number}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7651F5] hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & SETTINGS */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-bold font-heading text-base text-[#0B1020]">
              Personal Account Profile
            </h3>
            <p className="text-xs text-[#64748B]">
              Update your personal user details and platform credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                disabled
                value={user?.first_name || "Aloshy"}
                className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-slate-50 text-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                disabled
                value={user?.last_name || "Antony"}
                className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-slate-50 text-slate-700"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || "owner@flowgrid.com"}
                className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-slate-50 text-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8ECF3] flex items-center justify-between text-xs text-[#64748B]">
            <span>Password & Security managed under FlowGrid Single Sign-On</span>
            <Link
              href="/forgot-password"
              className="text-[#7651F5] font-semibold hover:underline"
            >
              Reset Password
            </Link>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={async (newWs) => {
          await loadDashboard();
          await refreshWorkspaces();
          handleLaunchWorkspace(newWs.id);
        }}
        ownedCount={usage.workspaces.current}
      />

      {/* Add Card Modal */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold font-heading text-base text-[#0B1020] mb-1">
              Add FlowGrid Payment Method
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Enter your card details for your FlowGrid plan subscription.
            </p>

            <form onSubmit={handleAddPaymentMethod} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Brand</label>
                <select
                  value={cardBrand}
                  onChange={(e) => setCardBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-white text-slate-800"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-white font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-white font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] bg-white font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-xl h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingCard}
                  className="bg-[#7651F5] hover:bg-purple-700 text-white text-xs font-semibold py-2 px-4 rounded-xl h-auto shadow-sm"
                >
                  {isAddingCard ? "Saving..." : "Save Card"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
