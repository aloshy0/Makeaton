"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Play,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Command,
  Activity,
} from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../lib/api";
import { useAccount } from "../../context/account-context";
import { ProfileMenu } from "./profile-menu";

export function Header() {
  const { activeWorkspace, switchContext } = useAccount();
  const [isRunningBilling, setIsRunningBilling] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const handleTriggerBilling = async () => {
    setIsRunningBilling(true);
    setBillingResult(null);
    try {
      const res = await api.triggerBillingRun();
      setBillingResult(res.message);
      setTimeout(() => setBillingResult(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Billing run completed";
      setBillingResult(message);
      setTimeout(() => setBillingResult(null), 4000);
    } finally {
      setIsRunningBilling(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E8ECF3] bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-64 sm:w-80 md:w-96">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions, customers, invoices..."
            className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/70 pl-9 pr-12 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7651F5]/15 transition-all"
          />
          <div className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Quick Status, Context Switcher & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {billingResult && (
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 animate-in fade-in">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>{billingResult}</span>
          </div>
        )}

        {/* Live Workspace Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-[#E8ECF3] bg-slate-50/80 px-2.5 py-1 text-[11px] text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#0B1020] truncate max-w-[120px]">
            {activeWorkspace?.name || "FlowGrid"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-bold text-[#7651F5]">{activeWorkspace?.currency || "USD"}</span>
        </div>

        {/* Switch to Personal Customer Portal */}
        <button
          onClick={() => switchContext("PERSONAL")}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/60 px-3 py-1.5 text-xs font-bold text-[#7651F5] hover:bg-purple-100 hover:border-purple-300 transition-all shadow-2xs"
          title="Switch to Personal Customer Experience"
        >
          <span>Personal Portal</span>
          <ExternalLink className="h-3 w-3" />
        </button>

        {/* Execute Billing Run Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTriggerBilling}
          disabled={isRunningBilling}
          className="gap-1.5 text-xs border-[#E8ECF3] bg-white hover:bg-slate-50 text-[#0B1020] font-semibold rounded-xl"
        >
          {isRunningBilling ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#7651F5]" />
          ) : (
            <Play className="h-3 w-3 fill-[#7651F5] text-[#7651F5]" />
          )}
          <span className="hidden md:inline">Run Billing</span>
        </Button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Profile Dropdown */}
        <ProfileMenu />
      </div>
    </header>
  );
}
