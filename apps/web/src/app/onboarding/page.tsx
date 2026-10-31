"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Vanguard SaaS Solutions");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.createWorkspace({
        name,
        currency,
        timezone,
      });
      setStep(4); // Completion step
    } catch (err: any) {
      setError(
        err.message || "Failed to create workspace. 5-workspace limit may have been reached."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-between px-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {s}
              </div>
              <span
                className={`text-xs font-medium ${step >= s ? "text-slate-200" : "text-slate-500"}`}
              >
                {s === 1 && "Welcome"}
                {s === 2 && "Profile"}
                {s === 3 && "Region"}
                {s === 4 && "Ready"}
              </span>
              {s < 4 && <div className="h-0.5 w-8 bg-slate-800" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Create Your Independent Business Workspace
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                FlowGrid operates as a multi-tenant SaaS platform. Each workspace operates in total
                data isolation with its own products, subscription plans, staff members, automated
                invoices, and external API credentials.
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> You will be designated as OWNER
                </div>
                <p className="text-[11px] text-slate-400">
                  As the workspace creator, you obtain complete operational authority. You can
                  invite administrators and operational staff, configure webhook integrations, and
                  manage your billing cycle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 flex items-center justify-center gap-2"
              >
                Continue to Business Information <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Step 2: Business Profile</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Acme Cloud Corp"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                This name will be displayed on all generated customer invoices, quotations, and
                external checkout links.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!name.trim()}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Next: Regional Settings <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">
                Step 3: Currency & Regional Configuration
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Billing Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="CAD">CAD ($) — Canadian Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="America/New_York">Eastern Time (America/New_York)</option>
                  <option value="America/Chicago">Central Time (America/Chicago)</option>
                  <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                  <option value="Europe/London">London (Europe/London)</option>
                  <option value="Europe/Berlin">Berlin (Europe/Berlin)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Creating Workspace..." : "Create Business Workspace"}
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Workspace Successfully Created!</h2>
              <p className="text-xs text-slate-400">
                You are now the active OWNER of <strong className="text-slate-200">{name}</strong> (
                {currency}).
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left space-y-2 text-xs text-slate-300">
                <span className="font-semibold block text-slate-200 mb-1">
                  Recommended Next Steps:
                </span>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    ✓ Create your first SaaS Product & Plan
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ Add customers and generate automated recurring invoices
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ Create an API key to embed subscriptions into your external website
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 flex items-center justify-center gap-2"
              >
                Go to Executive Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
