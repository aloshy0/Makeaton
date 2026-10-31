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
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { ProfileMenu } from "../../components/layout/profile-menu";
import { Button } from "../../components/ui/button";

export default function WorkspacesPage() {
  const router = useRouter();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, user } = useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

  // New workspace wizard state
  const [wsName, setWsName] = useState("");
  const [wsCurrency, setWsCurrency] = useState("USD");
  const [wsTimezone, setWsTimezone] = useState("America/New_York");
  const [wsIndustry, setWsIndustry] = useState("SaaS & Cloud Software");
  const [wsDescription, setWsDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createWorkspace({
        name: wsName.trim(),
        currency: wsCurrency,
        timezone: wsTimezone,
        description: wsDescription || `${wsIndustry} operations on FlowGrid.`,
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
    }, 1800);
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
      {/* Figma-Inspired Sticky Top Bar */}
      <header className="h-16 bg-white border-b border-[#E8ECF3] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-purple-500/15">
              FG
            </div>
            <span className="font-heading font-black text-lg tracking-tight text-[#0B1020]">
              FlowGrid
            </span>
          </Link>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden sm:inline-block text-xs font-semibold text-[#64748B]">
            Workspace Directory
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8ECF3] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#0B1020] transition-colors"
          >
            <span>Personal Account</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>

          <ProfileMenu />
        </div>
      </header>

      {/* Main Workspace Directory Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        {/* Title & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B1020] tracking-tight">
              Your workspaces
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Select an authorized business organization or initialize a new workspace.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-[#E8ECF3] bg-white text-xs font-semibold text-[#0B1020] hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all"
            >
              Join Workspace
            </button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-[#7651F5] hover:bg-[#6842e6] text-white shadow-sm shadow-purple-500/25 rounded-xl text-xs font-semibold px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </Button>
          </div>
        </div>

        {/* Filter Bar with Search and View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8ECF3] shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces by name or description..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[#E8ECF3] bg-slate-50/70 text-[#0B1020] placeholder-slate-400 focus:outline-none focus:border-[#7651F5] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#64748B] font-medium mr-1">
              {filteredWorkspaces.length}{" "}
              {filteredWorkspaces.length === 1 ? "workspace" : "workspaces"}
            </span>

            <div className="flex items-center border border-[#E8ECF3] rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-2xs text-[#7651F5]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-2xs text-[#7651F5]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Cards */}
        {filteredWorkspaces.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkspaces.map((ws) => {
                const isActive = activeWorkspace?.id === ws.id;
                return (
                  <div
                    key={ws.id}
                    className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between hover:shadow-md hover:border-purple-200/80 group ${
                      isActive
                        ? "border-[#7651F5] ring-2 ring-[#7651F5]/10 shadow-sm"
                        : "border-[#E8ECF3]"
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#7651F5]/10 to-[#4387F7]/10 text-[#7651F5] border border-purple-200/60 flex items-center justify-center font-heading font-black text-sm">
                          {ws.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
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

                      {/* Workspace Info */}
                      <h3 className="font-heading font-bold text-base text-[#0B1020] group-hover:text-[#7651F5] transition-colors truncate">
                        {ws.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 min-h-[32px]">
                        {ws.description ||
                          "Subscription billing, catalog and multi-tenant telemetry."}
                      </p>

                      {/* Meta Information */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{ws.last_accessed || "Recently"}</span>
                        </span>
                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                          {ws.currency || "USD"} • {ws.active_members_count || 1} members
                        </span>
                      </div>
                    </div>

                    {/* Open Action */}
                    <div className="mt-5 pt-3">
                      <button
                        onClick={() => {
                          switchWorkspace(ws.id);
                          router.push("/dashboard");
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          isActive
                            ? "bg-[#7651F5] text-white hover:bg-[#6842e6] shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-[#0B1020] border border-[#E8ECF3]"
                        }`}
                      >
                        <span>{isActive ? "Continue Workspace" : "Open Workspace"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8ECF3] divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {filteredWorkspaces.map((ws) => {
                const isActive = activeWorkspace?.id === ws.id;
                return (
                  <div
                    key={ws.id}
                    className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors ${
                      isActive ? "bg-purple-50/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#7651F5] border border-purple-200 flex items-center justify-center font-heading font-black text-xs flex-shrink-0">
                        {ws.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-[#0B1020] truncate">
                            {ws.name}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {ws.description || "FlowGrid workspace"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getRoleBadge(
                          ws.user_role
                        )}`}
                      >
                        {ws.user_role || "STAFF"}
                      </span>

                      <button
                        onClick={() => {
                          switchWorkspace(ws.id);
                          router.push("/dashboard");
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E8ECF3] hover:border-[#7651F5] hover:text-[#7651F5] transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Empty / No Results State */
          <div className="bg-white rounded-2xl border border-[#E8ECF3] p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 text-[#7651F5] flex items-center justify-center mx-auto border border-purple-200">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0B1020]">No workspaces found</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {searchQuery
                ? `No workspace matched "${searchQuery}". Clear your search or create a new workspace.`
                : "You don't have any authorized business workspaces yet. Create your first workspace to begin managing subscriptions."}
            </p>
            <div className="pt-2">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#7651F5] hover:bg-[#6842e6] text-white text-xs font-semibold rounded-xl"
              >
                Create Workspace
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Creation Wizard Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8ECF3] shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center border border-purple-200 font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#0B1020]">
                  Create business workspace
                </h3>
                <p className="text-xs text-[#64748B]">
                  Set up your multi-tenant SaaS organization.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">Workspace Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Software Labs"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1020] mb-1">
                    Billing Currency *
                  </label>
                  <select
                    value={wsCurrency}
                    onChange={(e) => setWsCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5] bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1020] mb-1">Timezone *</label>
                  <select
                    value={wsTimezone}
                    onChange={(e) => setWsTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5] bg-white"
                  >
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">Industry</label>
                <select
                  value={wsIndustry}
                  onChange={(e) => setWsIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5] bg-white"
                >
                  <option value="SaaS & Cloud Software">SaaS & Cloud Software</option>
                  <option value="Media & Creative Services">Media & Creative Services</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                  <option value="Consulting & Agency">Consulting & Agency</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this workspace's subscriptions and purpose..."
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#7651F5] hover:bg-[#6842e6] text-white font-semibold rounded-xl"
                >
                  {isSubmitting ? "Initializing..." : "Create & Open Workspace"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Dialog */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E8ECF3] shadow-2xl p-6 relative">
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 mb-5">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#4387F7] flex items-center justify-center mx-auto border border-blue-200">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#0B1020]">
                Join an existing workspace
              </h3>
              <p className="text-xs text-[#64748B]">
                Enter your invitation token or workspace invite code.
              </p>
            </div>

            {joinSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-xs text-emerald-800">Invitation Accepted!</div>
                <div className="text-[11px] text-emerald-600">
                  Connecting workspace membership...
                </div>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#0B1020] mb-1">
                    Invitation Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. inv_8f29e1a0b3"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] font-mono uppercase focus:outline-none focus:border-[#4387F7]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-[#4387F7] hover:bg-[#3476e3] text-white font-semibold rounded-xl"
                  >
                    Verify & Join
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
