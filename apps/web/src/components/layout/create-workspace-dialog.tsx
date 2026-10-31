"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, X, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { Workspace } from "../../types";
import { useAccount } from "../../context/account-context";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated?: (newWorkspace: Workspace) => void;
  ownedCount: number;
  maxSlots?: number;
}

export function CreateWorkspaceDialog({
  isOpen,
  onClose,
  onWorkspaceCreated,
  ownedCount,
  maxSlots = 3,
}: CreateWorkspaceDialogProps) {
  const { createWorkspace, user } = useAccount();

  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("SaaS & Cloud Software");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = user?.flowgrid_plan?.name || "Pro";
  const planMax = user?.flowgrid_plan?.max_workspaces || maxSlots;
  const isLimitReached = ownedCount >= planMax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a business name.");
      return;
    }
    if (isLimitReached) {
      setError(`Workspace limit reached for ${currentPlan} plan. Please upgrade your FlowGrid plan.`);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const created = await createWorkspace({
        name: name.trim(),
        currency,
        timezone,
        business_type: businessType,
        business_email: businessEmail || undefined,
        phone: phone || undefined,
        address: address || undefined,
        logo_url: logoUrl || undefined,
      });

      setName("");
      setBusinessEmail("");
      setPhone("");
      setAddress("");
      setLogoUrl("");
      if (onWorkspaceCreated) onWorkspaceCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create business workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-[#7651F5] border border-purple-100 shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Create Business Workspace
              </h3>
              <p className="text-xs text-slate-500">
                Launch an independent subscription business with its own products and customers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan Limit Quota Banner */}
        <div className="my-4 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">FlowGrid Plan: {currentPlan}</span>
            <span className={isLimitReached ? "text-amber-600 font-bold" : "text-[#7651F5] font-bold"}>
              {ownedCount} / {planMax < 9999 ? planMax : "Unlimited"} Workspaces Used
            </span>
          </div>
          {planMax < 9999 && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  isLimitReached ? "bg-amber-500" : "bg-[#7651F5]"
                }`}
                style={{ width: `${Math.min(100, (ownedCount / planMax) * 100)}%` }}
              />
            </div>
          )}
          {isLimitReached ? (
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-amber-700 font-medium">Limit reached on {currentPlan} plan.</span>
              <Link
                href="/account"
                onClick={onClose}
                className="font-bold text-[#7651F5] hover:underline flex items-center gap-1"
              >
                Upgrade Plan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <p className="mt-1.5 text-[11px] text-slate-500">
              Each workspace maintains completely isolated products, plans, customers, and invoices.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aloshy Software"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Type / Industry
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="SaaS & Cloud Software">SaaS & Cloud Software</option>
                <option value="Digital Academy & Courses">Digital Academy & Courses</option>
                <option value="Fitness & Health Clubs">Fitness & Health Clubs</option>
                <option value="Consulting & Agency">Consulting & Agency</option>
                <option value="Retail & Hardware">Retail & Hardware</option>
                <option value="Subscription Box & Physical">Subscription Box & Physical</option>
                <option value="Other">Other Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 100 Innovation Way, Suite 400, San Francisco, CA"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Zone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London / UTC</option>
                <option value="Europe/Berlin">Central European Time</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Singapore">Singapore / Hong Kong</option>
                <option value="Asia/Tokyo">Tokyo / Japan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Logo URL (Optional)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isLimitReached}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <span>Creating Workspace...</span>
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
