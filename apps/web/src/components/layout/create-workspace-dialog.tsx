"use client";

import React, { useState } from "react";
import { Building2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { Workspace } from "../../types";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (newWorkspace: Workspace) => void;
  ownedCount: number;
}

export function CreateWorkspaceDialog({
  isOpen,
  onClose,
  onWorkspaceCreated,
  ownedCount,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const maxWorkspaces = 5;
  const isLimitReached = ownedCount >= maxWorkspaces;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a business workspace name.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const created = await api.createWorkspace({
        name: name.trim(),
        currency,
        timezone,
      });
      setName("");
      onWorkspaceCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Start New Business Workspace</h3>
              <p className="text-xs text-slate-400">Launch an independent subscription business</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Ownership quota banner */}
        <div className="my-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300">Creator Workspace Limit</span>
            <span
              className={isLimitReached ? "text-amber-400 font-bold" : "text-indigo-400 font-bold"}
            >
              {ownedCount} / {maxWorkspaces} Used
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                isLimitReached ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${(ownedCount / maxWorkspaces) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {isLimitReached
              ? "You have reached the maximum allowed limit of 5 owned workspaces."
              : `You can launch up to ${maxWorkspaces - ownedCount} more independent business workspaces.`}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-800 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Business Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Cloud Solutions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLimitReached || loading}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isLimitReached || loading}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isLimitReached || loading}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="America/Chicago">Central Time (US)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLimitReached || loading || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Launch Business Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
