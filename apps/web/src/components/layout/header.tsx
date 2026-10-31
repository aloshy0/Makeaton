"use client";

import React, { useState } from "react";
import { Search, Play, BookOpen, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../lib/api";

export function Header() {
  const [isRunningBilling, setIsRunningBilling] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const handleTriggerBilling = async () => {
    setIsRunningBilling(true);
    setBillingResult(null);
    try {
      const res = await api.triggerBillingRun();
      setBillingResult(res.message);
      // Auto dismiss message after 4s
      setTimeout(() => setBillingResult(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Billing run failed";
      setBillingResult(`Error: ${message}`);
    } finally {
      setIsRunningBilling(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions, customers, invoices..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {billingResult && (
          <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 animate-in fade-in">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
            <span>{billingResult}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleTriggerBilling}
          disabled={isRunningBilling}
          className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          {isRunningBilling ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-indigo-600 text-indigo-600" />
          )}
          <span>Execute Billing Run</span>
        </Button>

        <a
          href="http://localhost:8000/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>API Docs</span>
        </a>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900">Admin Lead</div>
            <div className="text-[10px] text-slate-500">Brightloop Staff</div>
          </div>
        </div>
      </div>
    </header>
  );
}
