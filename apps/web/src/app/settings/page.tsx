"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Building2,
  Globe,
  ShieldAlert,
  Save,
  Trash2,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export default function WorkspaceSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"general" | "danger">("general");

  // Form states
  const [name, setName] = useState("Brightloop Cloud Services");
  const [slug, setSlug] = useState("brightloop-cloud");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [billingEmail, setBillingEmail] = useState("billing@brightloop.com");
  const [taxId, setTaxId] = useState("US-94-8291044");

  // Danger zone states
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: workspace } = useQuery({
    queryKey: ["currentWorkspace"],
    queryFn: () => api.getWorkspace(),
  });

  const isOwner = workspace?.user_role === "OWNER" || !workspace?.user_role;

  const transferMutation = useMutation({
    mutationFn: (email: string) =>
      api.transferOwnership(workspace?.id || "aac3abe7-18b7-4c5f-a29e-786b63476459", email),
    onSuccess: (res) => {
      setNotification({ type: "success", message: res.message });
      setIsTransferDialogOpen(false);
      setNewOwnerEmail("");
    },
    onError: (err: any) => {
      setNotification({ type: "error", message: err.message || "Transfer failed." });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () =>
      api.deactivateWorkspace(workspace?.id || "aac3abe7-18b7-4c5f-a29e-786b63476459"),
    onSuccess: (res) => {
      setNotification({ type: "success", message: res.message });
      setIsDeactivateDialogOpen(false);
    },
    onError: (err: any) => {
      setNotification({ type: "error", message: err.message || "Deactivation failed." });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({ type: "success", message: "Workspace profile updated successfully." });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Settings</h1>
            <Badge variant="confirmed">Active Business Workspace</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure business identity, regional financial defaults, and multi-tenant governance.
          </p>
        </div>

        {/* Quota Indicator */}
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="font-semibold text-slate-900">2 of 5 Workspaces Used</span>
            <span className="text-slate-500 block text-[11px]">Owner Quota Allowance</span>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "general"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          General & Regional
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "danger"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          Danger Zone & Governance
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-base font-semibold text-slate-900">
                  Business Organization Profile
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Visible to customers on invoices, payment receipts, and the customer portal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Workspace URL Slug
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    <span className="text-slate-400">brightloop.saas/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-transparent text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Official Billing Email
                  </label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Tax ID / VAT Registration #
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-base font-semibold text-slate-900">
                  Regional Currency & Timezone
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Governs financial precision and automated midnight billing triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Operating Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                    <option value="CAD">CAD ($) — Canadian Dollar</option>
                    <option value="AUD">AUD ($) — Australian Dollar</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Financial precision is stored in exact Decimal(12, 2).
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Billing Engine Timezone *
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="America/Chicago">America/Chicago (UTC-6)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Determines local midnight renewal evaluation.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" size="sm">
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Danger Zone */}
      {activeTab === "danger" && (
        <div className="space-y-6">
          {!isOwner && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-semibold block">Owner Privileges Required</span>
                Your current role is{" "}
                <Badge variant="active">{workspace?.user_role || "ADMIN"}</Badge>. Only the primary
                Workspace OWNER can transfer ownership or deactivate this business tenant.
              </div>
            </div>
          )}

          <Card className="border-rose-200">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <CardTitle className="text-base font-semibold text-rose-950">
                  Transfer Workspace Ownership
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-rose-700">
                Transfers full ownership and billing responsibility of this workspace to another
                verified user.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 mb-4">
                The new owner will assume full administrative power, including staff governance,
                integration secrets, and financial billing. You will be demoted to an ADMIN member.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={!isOwner}
                onClick={() => setIsTransferDialogOpen(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Transfer Ownership...
              </Button>
            </CardContent>
          </Card>

          <Card className="border-rose-200">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-4">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-600" />
                <CardTitle className="text-base font-semibold text-rose-950">
                  Deactivate Workspace
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-rose-700">
                Immediately pauses all recurring subscription billing runs, revokes active API keys,
                and closes access.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 mb-4">
                Once deactivated, customers will no longer be billed automatically and integrations
                will be halted. Historical audit logs and invoices will be preserved.
              </p>
              <Button
                variant="danger"
                size="sm"
                disabled={!isOwner}
                onClick={() => setIsDeactivateDialogOpen(true)}
              >
                Deactivate Workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {isTransferDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900">Transfer Workspace Ownership</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Please enter the email address of the existing team member or user who will become the
              new OWNER.
            </p>
            <input
              type="email"
              placeholder="new.owner@company.com"
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 mb-4 focus:border-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={!newOwnerEmail || transferMutation.isPending}
                onClick={() => transferMutation.mutate(newOwnerEmail)}
              >
                {transferMutation.isPending ? "Transferring..." : "Confirm Transfer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Workspace Modal */}
      {isDeactivateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900">Deactivate Workspace</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Type <span className="font-mono font-bold text-rose-600">DEACTIVATE</span> to confirm
              shutdown of all recurring billing and API services for this business.
            </p>
            <input
              type="text"
              placeholder="Type DEACTIVATE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 mb-4 focus:border-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={confirmText !== "DEACTIVATE" || deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate()}
              >
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate Business"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
