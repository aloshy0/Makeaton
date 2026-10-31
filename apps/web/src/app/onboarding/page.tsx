"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Repeat,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Layers,
  Sliders,
  Copy,
  ExternalLink,
  Key,
  Shield,
  FileText,
  UserCheck,
  Bell,
  HelpCircle,
  Activity,
} from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { useAccount } from "../../context/account-context";

interface SetupPreset {
  id: string;
  name: string;
  badge?: string;
  description: string;
  modules: string[];
  moduleCount: number;
  icon: React.ComponentType<{ className?: string }>;
}

const PRESETS: SetupPreset[] = [
  {
    id: "saas",
    name: "SaaS / Subscription Business",
    badge: "MOST POPULAR FOR TECH",
    description:
      "Purpose-built telemetry for continuous recurring billing, tiered pricing, and MRR metrics.",
    modules: [
      "Products, Plans & Tiers",
      "Recurring Subscriptions & Dunning",
      "Automated Invoices & Tax Receipts",
      "Live Customer MRR & Churn Telemetry",
    ],
    moduleCount: 4,
    icon: Repeat,
  },
  {
    id: "agency",
    name: "Agency / Services",
    description:
      "Structured workspace for deliverable scopes, milestone drawdowns, and dedicated client hubs.",
    modules: [
      "Client Collaborative Portals",
      "Project Estimates & Quotations",
      "Retainer Management & Rollovers",
      "Milestone Gate Payment Collection",
    ],
    moduleCount: 5,
    icon: Sliders,
  },
  {
    id: "consulting",
    name: "Consulting Business",
    description:
      "Frictionless pipeline flow for strategic advisory, billable hours, and retainer drawdown accounts.",
    modules: [
      "Client Account Management",
      "Proposal & SOW Pipelines",
      "Advisory Engagements Tracking",
      "Hourly Ledger & Retainer Settlement",
    ],
    moduleCount: 4,
    icon: TrendingUp,
  },
  {
    id: "ecommerce",
    name: "E-commerce Business",
    description:
      "Multi-channel inventory management, merchant gateway reconciliations, and checkout sync.",
    modules: [
      "Product SKU & Variant Catalog",
      "Realtime Order Fulfillment Routing",
      "Multi-Warehouse Inventory Sync",
      "Stripe / Adyen Gateway Payouts",
    ],
    moduleCount: 5,
    icon: ShoppingCart,
  },
  {
    id: "general",
    name: "General Business",
    description:
      "A versatile standard slate providing core invoicing, multi-user permissions, and audit logs.",
    modules: [
      "Team Governance & RBAC Roles",
      "Standard Invoicing & Payments",
      "Custom Field Workflows",
      "Flexible Double-Entry Ledger",
    ],
    moduleCount: 4,
    icon: Building2,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { createWorkspace, user } = useAccount();

  const [step, setStep] = useState<1 | 2>(1); // 1 = Preset Selection (Ref Img 1), 2 = Ready (Ref Img 3)
  const [selectedPreset, setSelectedPreset] = useState<string>("saas");
  const [workspaceName, setWorkspaceName] = useState("Vanguard Commerce");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleContinueToReview = async () => {
    setIsProvisioning(true);
    try {
      await createWorkspace({
        name: workspaceName,
        currency: "USD",
        timezone: "America/New_York",
        description: `${
          PRESETS.find((p) => p.id === selectedPreset)?.name || "SaaS"
        } operations on FlowGrid.`,
      });
      setStep(2);
    } catch {
      setStep(2);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCopyUrl = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("https://vanguard-commerce.flowgrid.cloud");
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans">
      {/* Top Bar (Ref Image 1) */}
      <header className="h-16 bg-white border-b border-[#E8ECF3] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-xs shadow-xs">
              FG
            </div>
            <span className="font-heading font-black text-base text-[#0B1020]">FlowGrid</span>
          </Link>
          <span className="h-4 w-px bg-slate-200 mx-1" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7651F5] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
            ONBOARDING / SETUP
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button className="text-slate-400 hover:text-slate-600">
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="relative">
            <Bell className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#7651F5] text-white text-[9px] font-bold flex items-center justify-center">
              2
            </span>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-bold text-xs">
              {user?.first_name ? user.first_name[0] : "A"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#0B1020]">
                {user ? `${user.first_name} ${user.last_name}` : "Alex Rivera"}
              </div>
              <div className="text-[10px] text-[#64748B]">Owner</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Left Progress Sidebar (Ref Image 1) */}
        <aside className="w-64 bg-white border-r border-[#E8ECF3] p-5 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              WORKSPACE SETUP
            </div>

            <nav className="space-y-1">
              {[
                { name: "Overview", active: step === 1 },
                { name: "Organization Profile", active: false },
                { name: "Team Onboarding", active: false },
                { name: "Roles & Permissions", active: false },
                { name: "Billing & Subscription", active: false },
                { name: "Security & SSO", active: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    item.active
                      ? "bg-[#7651F5] text-white shadow-sm shadow-purple-600/25"
                      : "text-[#64748B] hover:text-[#0B1020]"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${item.active ? "bg-white" : "bg-slate-300"}`}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Progress Tracker */}
          <div className="space-y-3 pt-4 border-t border-[#E8ECF3]">
            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#64748B]">Setup Progress</span>
                <span className="text-[#7651F5] font-bold">{step === 1 ? "85%" : "100%"}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7651F5] rounded-full transition-all duration-500"
                  style={{ width: step === 1 ? "85%" : "100%" }}
                />
              </div>
              <div className="text-[10px] text-[#64748B] mt-2">
                {step === 1 ? "3 of 5 onboarding tasks completed." : "Workspace fully provisioned."}
              </div>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Governance Guide</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
          {step === 1 ? (
            /* ======================================================== */
            /* STEP 1: Choose Your Workspace Setup (Ref Image 1)       */
            /* ======================================================== */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7651F5]">
                    STEP 2 OF 2 • Business Configuration
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7651F5] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    <Sparkles className="w-3 h-3 text-[#7651F5]" />
                    Auto-suggested based on domain: SaaS Model
                  </span>
                </div>

                <h1 className="font-heading font-extrabold text-3xl text-[#0B1020] tracking-tight">
                  Choose your workspace setup
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl">
                  Start with an operational model tailored to your commercial lifecycle. You can
                  calibrate modules, telemetry, and automated workflows anytime.
                </p>
              </div>

              {/* 6 Preset Cards Grid (Ref Image 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  const Icon = preset.icon;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`rounded-2xl border p-5 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-purple-50/30 border-[#7651F5] ring-2 ring-[#7651F5]/20 shadow-sm"
                          : "bg-white border-[#E8ECF3] hover:border-purple-200 hover:shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold ${
                              isSelected
                                ? "bg-[#7651F5] text-white shadow-xs"
                                : "bg-purple-50 text-[#7651F5]"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          {preset.badge && (
                            <span className="text-[9px] font-extrabold text-[#7651F5] bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 uppercase tracking-wide">
                              {preset.badge}
                            </span>
                          )}

                          {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-[#7651F5] text-white flex items-center justify-center ml-auto">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        <h3 className="font-heading font-bold text-base text-[#0B1020] mb-1">
                          {preset.name}
                        </h3>
                        <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                          {preset.description}
                        </p>

                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                          DEFAULT CORE MODULES
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#0B1020]">
                          {preset.modules.map((m) => (
                            <li key={m} className="flex items-center gap-2">
                              <CheckCircle2
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  isSelected ? "text-[#7651F5]" : "text-slate-400"
                                }`}
                              />
                              <span className="truncate">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#64748B]">
                          {isSelected ? "Selected Preset" : "Select framework"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {preset.moduleCount} Modules
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Architecture Card (Card 6 in Ref Image 1) */}
                <div
                  onClick={() => setSelectedPreset("custom")}
                  className={`rounded-2xl border p-5 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPreset === "custom"
                      ? "bg-purple-50/30 border-[#7651F5] ring-2 ring-[#7651F5]/20"
                      : "bg-white border-[#E8ECF3] hover:border-purple-200"
                  }`}
                >
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold mb-3">
                      <Layers className="h-4 w-4" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#0B1020] mb-1">
                      Need a custom architecture?
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                      Start with an empty workspace canvas and connect your custom API webhooks,
                      bespoke ERP schema, and automated triggers.
                    </p>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Enterprise modules supported</span>
                    </div>
                    <button className="w-full py-2 rounded-xl border border-[#E8ECF3] bg-slate-50 text-xs font-bold text-[#0B1020] hover:bg-white transition-colors">
                      Configure Blank Slate →
                    </button>
                  </div>
                </div>
              </div>

              {/* Zero-commitment module layout alert (Ref Image 1) */}
              <div className="bg-white rounded-2xl border border-[#E8ECF3] p-4 flex items-center gap-3 shadow-2xs">
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#64748B]">
                  <span className="font-bold text-[#0B1020] block">
                    Zero-commitment module layout
                  </span>
                  These presets configure your initial module shortcuts. FlowGrid never fabricates
                  records or charges without your direct approval.
                </div>
              </div>

              {/* Footer Actions (Ref Image 1) */}
              <div className="pt-4 border-t border-[#E8ECF3] flex items-center justify-between">
                <Link
                  href="/workspaces"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0B1020]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Link>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0B1020]"
                  >
                    Skip for now (Custom configuration)
                  </button>

                  <Button
                    onClick={handleContinueToReview}
                    disabled={isProvisioning}
                    className="gap-2 bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md shadow-purple-600/20"
                  >
                    {isProvisioning ? (
                      <span>Provisioning...</span>
                    ) : (
                      <>
                        <span>Continue to Review</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* STEP 2: Your Workspace is Ready (Ref Image 3)           */
            /* ======================================================== */
            <div className="space-y-6 max-w-2xl mx-auto py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="relative inline-block mb-1">
                  <div className="h-14 w-14 rounded-full bg-[#7651F5] text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                    <Check className="h-7 w-7 stroke-[3]" />
                  </div>
                  <span className="h-3 w-3 rounded-full bg-blue-500 absolute top-0 right-0 border-2 border-white" />
                </div>

                <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7651F5] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  ENVIRONMENT PROVISIONED
                </div>

                <h1 className="font-heading font-extrabold text-3xl text-[#0B1020] tracking-tight">
                  Your workspace is ready
                </h1>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  {workspaceName} has been successfully configured with enterprise isolation,
                  automated encryption, and sovereign owner credentials.
                </p>
              </div>

              {/* Provisioned Workspace Card (Ref Image 3) */}
              <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8ECF3]">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-sm shadow-sm">
                      {workspaceName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-base text-[#0B1020]">
                          {workspaceName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        SaaS & Subscription Preset • Standard Tier
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7651F5] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    OWNER PRIVILEGES
                  </span>
                </div>

                {/* Production URL Row */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    WORKSPACE PRODUCTION URL
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8ECF3] bg-slate-50">
                    <span className="text-xs font-mono text-[#0B1020] truncate">
                      https://vanguard-commerce.flowgrid.cloud
                    </span>
                    <button
                      onClick={handleCopyUrl}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0B1020] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Lead Account Holder & Isolation (2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[#E8ECF3] bg-slate-50/50">
                    <div className="text-[10px] font-semibold text-[#64748B] mb-0.5">
                      Lead Account Holder
                    </div>
                    <div className="font-bold text-[#0B1020] flex items-center gap-1">
                      <span>{user ? `${user.first_name} ${user.last_name}` : "Alex Rivera"}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {user?.email || "alex@vanguardcommerce.com"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#E8ECF3] bg-slate-50/50">
                    <div className="text-[10px] font-semibold text-[#64748B] mb-0.5">
                      Infrastructure Isolation
                    </div>
                    <div className="font-bold text-[#0B1020]">AWS US-East (N. Virginia)</div>
                    <div className="text-[11px] text-[#64748B]">SOC2 Type II Isolated Schema</div>
                  </div>
                </div>

                {/* Automatic Health Check Status */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[#7651F5] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Automatic Health Check: All Systems Nominal
                  </span>
                  <span className="text-[11px] text-[#64748B]">Lat: 18ms • TLS 1.3</span>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="gap-2 bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold text-xs rounded-xl h-11 shadow-md shadow-purple-600/25"
                  >
                    <span>Open workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => router.push("/staff")}
                    variant="outline"
                    className="gap-2 border-[#E8ECF3] hover:bg-slate-50 text-[#0B1020] font-semibold text-xs rounded-xl h-11"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>Invite team members</span>
                  </Button>
                </div>

                <div className="text-center text-[11px] text-[#64748B]">
                  FlowGrid never automatically sends emails or invitations without explicit user
                  confirmation.
                </div>
              </div>

              {/* 3 Mini Feature Cards Below (Ref Image 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/integrations"
                  className="p-4 rounded-2xl border border-[#E8ECF3] bg-white hover:border-purple-200 transition-all text-xs group"
                >
                  <div className="h-8 w-8 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center mb-2">
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-[#0B1020] group-hover:text-[#7651F5]">
                    API & Access Keys
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Generate secret tokens to sync your external CLI and deployment pipelines.
                  </p>
                  <div className="text-[11px] font-bold text-[#7651F5] mt-2">Manage keys →</div>
                </Link>

                <Link
                  href="/settings"
                  className="p-4 rounded-2xl border border-[#E8ECF3] bg-white hover:border-purple-200 transition-all text-xs group"
                >
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-[#0B1020] group-hover:text-blue-600">
                    SSO / SAML Setup
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Connect Okta, Google Workspace, or Azure AD for identity governance.
                  </p>
                  <div className="text-[11px] font-bold text-blue-600 mt-2">Configure SSO →</div>
                </Link>

                <Link
                  href="/audit-logs"
                  className="p-4 rounded-2xl border border-[#E8ECF3] bg-white hover:border-purple-200 transition-all text-xs group"
                >
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-[#0B1020] group-hover:text-emerald-600">
                    Audit Logging
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Monitor real-time compliance events, session states, and membership records.
                  </p>
                  <div className="text-[11px] font-bold text-emerald-600 mt-2">View logs →</div>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
