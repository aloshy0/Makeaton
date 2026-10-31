"use client";

import React, { useState } from "react";
import { Search, Play, BookOpen, CheckCircle, RefreshCw, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../lib/api";
import { useAccount } from "../../context/account-context";
import { ProfileMenu } from "./profile-menu";

export function Header() {
  const { activeWorkspace } = useAccount();
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
      const message = err instanceof Error ? err.message : "Billing run failed";
      setBillingResult(`Error: ${message}`);
    } finally {
      setIsRunningBilling(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E8ECF3] bg-white/95 px-6 backdrop-blur-sm">
      {/* Search Input */}
      <div className="flex items-center gap-4 w-72 sm:w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions, customers, invoices..."
            className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/70 pl-9 pr-4 py-1.5 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7651F5]"
          />
        </div>
      </div>

      {/* Action Buttons & Profile Menu */}
      <div className="flex items-center gap-3">
        {billingResult && (
          <div className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-[#7651F5] animate-in fade-in">
            <CheckCircle className="h-3.5 w-3.5 text-[#7651F5]" />
            <span>{billingResult}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleTriggerBilling}
          disabled={isRunningBilling}
          className="hidden sm:inline-flex gap-1.5 text-xs border-purple-200 text-[#7651F5] hover:bg-purple-50"
        >
          {isRunningBilling ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-[#7651F5] text-[#7651F5]" />
          )}
          <span>Execute Billing Run</span>
        </Button>

        <a
          href="http://localhost:8000/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-[#E8ECF3] px-3 py-1.5 text-xs font-semibold text-[#0B1020] hover:bg-slate-50 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>API Docs</span>
        </a>

        <div className="h-4 w-px bg-slate-200" />

        {/* Profile and Account Switcher */}
        <ProfileMenu />
      </div>
    </header>
  );
}
