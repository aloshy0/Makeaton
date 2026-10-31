"use client";

import React, { useState } from "react";
import {
  Mail,
  Plus,
  Send,
  XCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  Search,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { DUMMY_INVITATIONS } from "../../lib/dummy-data";
import { StaffInvitation } from "../../types";

export default function InvitationsPage() {
  const { activeWorkspace } = useAccount();
  const [invitations, setInvitations] = useState<StaffInvitation[]>(DUMMY_INVITATIONS);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "EXPIRED">("ALL");
  const [search, setSearch] = useState("");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [inviteProfile, setInviteProfile] = useState<"READ_ONLY" | "OPERATIONS">("OPERATIONS");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filtered = invitations.filter((inv) => {
    const matchesFilter = filter === "ALL" || inv.status === filter;
    const matchesSearch = inv.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newInv: StaffInvitation = {
      id: `inv-${Date.now()}`,
      workspace: activeWorkspace?.id || "aac3abe7-18b7-4c5f-a29e-786b63476459",
      email: inviteEmail,
      role: inviteRole,
      status: "PENDING",
      token: `inv_token_${Math.random().toString(36).substring(2, 10)}`,
      invited_by: "Alexander Wright",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    };

    setInvitations([newInv, ...invitations]);
    setIsInviteModalOpen(false);
    setInviteEmail("");
  };

  const handleRevoke = (id: string) => {
    setInvitations(invitations.map((inv) => (inv.id === id ? { ...inv, status: "EXPIRED" } : inv)));
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/invitations/accept?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#0B1020] tracking-tight">
            Team & Staff Invitations
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Invite team members, operators, and administrators to{" "}
            {activeWorkspace?.name || "your workspace"}.
          </p>
        </div>

        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="gap-2 bg-[#7651F5] hover:bg-[#6842e6] text-white rounded-xl text-xs font-semibold px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8ECF3] shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invitation by email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E8ECF3] bg-slate-50/70 text-[#0B1020] focus:outline-none focus:border-[#7651F5]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "PENDING", "ACCEPTED", "EXPIRED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === tab
                  ? "bg-[#7651F5] text-white shadow-2xs"
                  : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-[#E8ECF3] text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="py-3 px-4">Invited Member</th>
              <th className="py-3 px-4">Target Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Invited By</th>
              <th className="py-3 px-4">Expires</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#0B1020]">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold text-xs border border-purple-200">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>{inv.email}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-200">
                    {inv.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {inv.status === "PENDING" && <Badge variant="warning">Pending</Badge>}
                  {inv.status === "ACCEPTED" && <Badge variant="active">Accepted</Badge>}
                  {inv.status === "EXPIRED" && <Badge variant="closed">Revoked</Badge>}
                </td>
                <td className="py-3 px-4 text-[#64748B]">{inv.invited_by || "Admin"}</td>
                <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                  {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : "7 days"}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {inv.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleCopyLink(inv.token || "")}
                          className="px-2.5 py-1 rounded-lg border border-[#E8ECF3] bg-white hover:bg-slate-50 text-[11px] font-semibold text-[#0B1020] transition-colors"
                          title="Copy acceptance link"
                        >
                          {copiedToken === inv.token ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Revoke invitation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8ECF3] shadow-2xl p-6 relative">
            <h3 className="font-heading font-bold text-base text-[#0B1020] mb-1">
              Invite Team Member
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Send an invitation link to grant access to {activeWorkspace?.name || "FlowGrid"}.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="operator@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5] bg-white"
                >
                  <option value="STAFF">Staff (Assigned Operations)</option>
                  <option value="ADMIN">Administrator (Full Business Operations)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1020] mb-1">
                  Permission Profile
                </label>
                <select
                  value={inviteProfile}
                  onChange={(e) => setInviteProfile(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF3] focus:outline-none focus:border-[#7651F5] bg-white"
                >
                  <option value="OPERATIONS">Operations & Daily Tasks</option>
                  <option value="READ_ONLY">Read-Only Telemetry</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="bg-[#7651F5] hover:bg-[#6842e6] text-white font-semibold rounded-xl"
                >
                  Create & Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
