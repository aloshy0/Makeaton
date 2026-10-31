"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Grid,
  List,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  X,
  Mail,
  Check,
  Key,
  Shield,
  Activity,
  User,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { ProfileMenu } from "../../components/layout/profile-menu";
import { Button } from "../../components/ui/button";

export default function WorkspacesPage() {
  const router = useRouter();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, switchContext } =
    useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "OWNER" | "ADMIN" | "STAFF">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Invitation Banner state
  const [hasInvitation, setHasInvitation] = useState(true);
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

  // New workspace wizard state
  const [wsName, setWsName] = useState("");
  const [wsCurrency, setWsCurrency] = useState("USD");
  const [wsTimezone, setWsTimezone] = useState("America/New_York");
  const [wsDescription, setWsDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredWorkspaces = workspaces.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === "ALL" || (w.user_role && w.user_role.toUpperCase() === roleFilter);

    return matchesSearch && matchesRole;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;
    setIsSubmitting(true);
    try {
      await createWorkspace({
        name: wsName.trim(),
        currency: wsCurrency,
        timezone: wsTimezone,
        description: wsDescription || `SaaS & Subscription business workspace on FlowGrid.`,
      });
      setIsCreateModalOpen(false);
      setWsName("");
      setWsDescription("");
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setIsJoinModalOpen(false);
      setJoinCode("");
    }, 1500);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-[#7651F5] border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-[#4387F7] border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-[#E8ECF3] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-purple-500/15">
              FG
            </div>
            <span className="font-heading font-black text-lg tracking-tight text-[#0B1020]">
              FlowGrid
            </span>
          </Link>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden sm:inline-block text-xs font-semibold text-[#64748B]">
            Tenant Directory
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => switchContext("PERSONAL")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition-colors"
          >
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </button>

          <ProfileMenu />
        </div>
      </header>

      {/* Main Workspace Directory */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Pending Invitation Alert Banner (Ref Image 4) */}
        {hasInvitation && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900">
                    Pending Organization Invitation
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    ACME MEDIA LABS
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  You&apos;ve been invited by Sarah K. (sarah@acmemedia.org) to join as Staff /
                  Editor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {invitationAccepted ? (
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Accepted! Joined workspace.
                </span>
              ) : (
                <>
                  <button
                    onClick={() => setHasInvitation(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Decline
                  </button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setInvitationAccepted(true);
                      setTimeout(() => setHasInvitation(false), 2000);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Accept & Join
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Directory Title & Main Action Buttons (Ref Image 4) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7651F5] mb-1 flex items-center gap-2">
              <span>TENANT DIRECTORY</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#64748B]">US & EU Region Sync</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B1020] tracking-tight">
              Your workspaces
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Choose an operational workspace to continue, or join an organization via invitation
              code.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-[#E8ECF3] bg-white text-xs font-bold text-[#0B1020] hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-[#7651F5]" />
              <span>Join with Code</span>
            </button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-[#7651F5] hover:bg-[#643ee4] text-white shadow-md shadow-purple-600/20 rounded-xl text-xs font-bold px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Workspace</span>
            </Button>
          </div>
        </div>

        {/* Filter Pills & Search Bar (Ref Image 4) */}
        <div className="bg-white p-3 rounded-2xl border border-[#E8ECF3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Role Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "ALL", label: `All (${workspaces.length})` },
              {
                id: "OWNER",
                label: `Owner (${workspaces.filter((w) => w.user_role === "OWNER").length || 2})`,
              },
              {
                id: "ADMIN",
                label: `Admin (${workspaces.filter((w) => w.user_role === "ADMIN").length || 1})`,
              },
              {
                id: "STAFF",
                label: `Staff (${workspaces.filter((w) => w.user_role === "STAFF").length || 1})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  roleFilter === tab.id
                    ? "bg-purple-50 text-[#7651F5] border border-purple-200 shadow-2xs"
                    : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & View Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, region or tag..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8ECF3] bg-slate-50/70 text-[#0B1020] placeholder-slate-400 focus:outline-none focus:border-[#7651F5] focus:bg-white"
              />
            </div>

            <div className="flex items-center border border-[#E8ECF3] rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs ${
                  viewMode === "grid" ? "bg-white shadow-2xs text-[#7651F5]" : "text-slate-400"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs ${
                  viewMode === "list" ? "bg-white shadow-2xs text-[#7651F5]" : "text-slate-400"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Workspace Cards Grid (Ref Image 2 & 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredWorkspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            return (
              <div
                key={ws.id}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between hover:shadow-md group ${
                  isActive
                    ? "border-[#7651F5] ring-2 ring-[#7651F5]/10 shadow-sm"
                    : "border-[#E8ECF3] hover:border-purple-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7651F5]/10 to-[#4387F7]/10 text-[#7651F5] border border-purple-200/60 flex items-center justify-center font-heading font-black text-sm">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ACTIVE
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getRoleBadge(
                          ws.user_role
                        )}`}
                      >
                        {ws.user_role || "STAFF"}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#0B1020] group-hover:text-[#7651F5] transition-colors truncate">
                    {ws.name}
                  </h3>
                  <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                    {ws.slug || "flowgrid.cloud"}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8ECF3] space-y-1.5 text-xs text-[#64748B]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Team Members</span>
                      </span>
                      <span className="font-bold text-[#0B1020]">
                        {ws.active_members_count || 12} members
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cluster</span>
                      </span>
                      <span className="font-medium text-[#0B1020]">US-East Cluster</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Active</span>
                      </span>
                      <span className="font-medium text-[#0B1020]">
                        {ws.last_accessed || "Just now"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E8ECF3]">
                  <Button
                    onClick={() => {
                      switchWorkspace(ws);
                      router.push("/dashboard");
                    }}
                    className={`w-full justify-center gap-1.5 text-xs font-bold rounded-xl h-9 transition-all ${
                      isActive
                        ? "bg-[#7651F5] hover:bg-[#643ee4] text-white shadow-md shadow-purple-600/20"
                        : "bg-slate-50 hover:bg-purple-50 text-[#0B1020] hover:text-[#7651F5] border border-[#E8ECF3]"
                    }`}
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner: Personal Account Context (Ref Image 4) */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-[#0B1020]">
                  Personal Account Context
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] border border-slate-200">
                  Zero-Tenant Isolation
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Looking for personal subscriptions, personal invoices, payment methods, or developer
                sandbox keys?
              </p>
            </div>
          </div>

          <Button
            onClick={() => switchContext("PERSONAL")}
            variant="outline"
            className="border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-[#7651F5] font-bold text-xs rounded-xl self-end sm:self-auto gap-1.5"
          >
            <span>Switch to Customer Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Directory Footer (Ref Image 4) */}
        <div className="pt-4 border-t border-[#E8ECF3] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#0B1020]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SOC2 Type II Certified Isolation
            </span>
            <span className="text-slate-300">•</span>
            <span>Zero cross-tenant data latency</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-medium">Active Ping: 18ms (US-East)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <a
              href="http://localhost:8000/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#7651F5]"
            >
              Directory API
            </a>
            <Link href="/audit-logs" className="hover:text-[#7651F5]">
              Audit Logs
            </Link>
            <a
              href="http://localhost:8000/api/schema/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#7651F5]"
            >
              Security Docs
            </a>
            <span>FlowGrid v2.14.0</span>
          </div>
        </div>
      </main>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8ECF3]">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#0B1020]">
                    Create New Workspace
                  </h3>
                  <p className="text-xs text-[#64748B]">Multi-tenant isolated company tenant</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#0B1020] hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  placeholder="e.g. Acme Cloud Systems"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3.5 py-2.5 text-xs text-[#0B1020] focus:border-[#7651F5] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                    Currency
                  </label>
                  <select
                    value={wsCurrency}
                    onChange={(e) => setWsCurrency(e.target.value)}
                    className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3 py-2 text-xs text-[#0B1020] focus:border-[#7651F5] focus:bg-white focus:outline-none font-semibold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                    Timezone
                  </label>
                  <select
                    value={wsTimezone}
                    onChange={(e) => setWsTimezone(e.target.value)}
                    className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3 py-2 text-xs text-[#0B1020] focus:border-[#7651F5] focus:bg-white focus:outline-none font-semibold"
                  >
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  placeholder="e.g. Production SaaS subscription billing"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3.5 py-2 text-xs text-[#0B1020] focus:border-[#7651F5] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8ECF3] flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 text-xs border-[#E8ECF3]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-xs bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold"
                >
                  {isSubmitting ? "Creating..." : "Initialize Workspace"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8ECF3]">
              <h3 className="font-heading font-bold text-base text-[#0B1020]">
                Join via Invitation Code
              </h3>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#0B1020]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {joinSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <div className="font-heading font-bold text-sm text-[#0B1020]">
                  Workspace Joined Successfully!
                </div>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                    Invitation Code
                  </label>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. FG-INV-8921"
                    className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50 px-3.5 py-2.5 text-xs text-[#0B1020] uppercase tracking-widest font-mono font-bold focus:border-[#7651F5] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-xs bg-[#7651F5] hover:bg-[#643ee4] text-white font-bold"
                  >
                    Join
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
