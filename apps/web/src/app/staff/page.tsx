"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { WorkspaceMembership, StaffInvitation } from "../../types";
import { DUMMY_MEMBERSHIPS } from "../../lib/dummy-data";
import {
  UserCog,
  Plus,
  ShieldCheck,
  Mail,
  CheckCircle2,
  UserX,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [submitting, setSubmitting] = useState(false);
  const [invitedToken, setInvitedToken] = useState<string | null>(null);

  const { data: memberships = DUMMY_MEMBERSHIPS } = useQuery<WorkspaceMembership[]>({
    queryKey: ["memberships"],
    queryFn: () => api.getWorkspaceMemberships(),
  });

  const handlePrefill = () => {
    const id = Math.floor(Math.random() * 900) + 100;
    setEmail(`operator${id}@flowgrid.com`);
    setRole("STAFF");
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.inviteStaff("aac3abe7-18b7-4c5f-a29e-786b63476459", { email, role });
      setInvitedToken(res.token || `token_demo_${Math.random().toString(36).substring(2, 9)}`);
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    } catch (err: any) {
      alert(err.message || "Failed to invite staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromote = async (memberId: string) => {
    if (!confirm("Promote this staff member to ADMINISTRATOR?")) return;
    try {
      await api.promoteAdmin("aac3abe7-18b7-4c5f-a29e-786b63476459", memberId);
      alert("Member promoted to ADMIN.");
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    } catch (err: any) {
      alert(err.message || "Promote action failed");
    }
  };

  const handleDemote = async (memberId: string) => {
    if (!confirm("Demote this administrator to STAFF?")) return;
    try {
      await api.demoteStaff("aac3abe7-18b7-4c5f-a29e-786b63476459", memberId);
      alert("Member demoted to STAFF.");
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    } catch (err: any) {
      alert(err.message || "Demote action failed");
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await api.removeMember("aac3abe7-18b7-4c5f-a29e-786b63476459", memberId);
      alert("Membership removed.");
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    } catch (err: any) {
      alert(err.message || "Remove failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workspace Team & Roles
          </h1>
          <p className="text-xs text-slate-500">
            Manage team roles (OWNER, ADMIN, STAFF), dispatch 72-hour invitations, and configure
            permission gates.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsInviteModalOpen(true);
            setInvitedToken(null);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="h-3.5 w-3.5" /> Invite Team Member
        </Button>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">User Profile</th>
              <th className="px-5 py-3.5">Workspace Role</th>
              <th className="px-5 py-3.5">Permission Profile</th>
              <th className="px-5 py-3.5">Member Since</th>
              <th className="px-5 py-3.5 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {memberships.map((m: WorkspaceMembership) => (
              <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {m.user?.first_name ? m.user.first_name[0] : m.user?.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {m.user?.first_name
                          ? `${m.user.first_name} ${m.user.last_name}`
                          : "Team Member"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">{m.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      m.role === "OWNER"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : m.role === "ADMIN"
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {m.role === "OWNER" && "Full Authority (Superuser)"}
                  {m.role === "ADMIN" && "Operations & Team Administration"}
                  {m.role === "STAFF" && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Approval Protected Operations
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(m.joined_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right space-x-1.5">
                  {m.role === "STAFF" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePromote(m.id)}
                      className="text-[11px] h-7 gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <ArrowUp className="h-3 w-3" /> Promote to Admin
                    </Button>
                  )}
                  {m.role === "ADMIN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDemote(m.id)}
                      className="text-[11px] h-7 gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <ArrowDown className="h-3 w-3" /> Demote to Staff
                    </Button>
                  )}
                  {m.role !== "OWNER" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(m.id)}
                      className="text-[11px] h-7 gap-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      <UserX className="h-3 w-3" /> Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Invite Team Member</h3>
                <p className="text-xs text-slate-500">
                  Dispatch cryptographic 72-hour invitation token
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrefill}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md"
              >
                <Sparkles className="h-3 w-3" /> Prefill Dummy Data
              </button>
            </div>

            {invitedToken ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Invitation Created
                    Successfully!
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    In a production environment with SMTP configured, this invitation email is
                    delivered to the invitee. For prototype testing, copy the link below:
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-300 font-mono text-[11px] text-slate-800 break-all select-all">
                    /invitations/accept?token={invitedToken}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setInvitedToken(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteStaff} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invitee Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@flowgrid.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="STAFF">STAFF (Limited operations with approval gates)</option>
                    <option value="ADMIN">
                      ADMINISTRATOR (Full operations and staff management)
                    </option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Security Note:</div>
                  <div>
                    • STAFF cannot execute early cancellation or refunds without Admin review.
                  </div>
                  <div>• Tokens expire automatically after 72 hours.</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    {submitting ? "Dispatching..." : "Generate & Send Invitation"}
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
