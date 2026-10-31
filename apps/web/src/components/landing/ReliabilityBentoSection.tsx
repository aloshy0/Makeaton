"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Layers,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export function ReliabilityBentoSection() {
  const recurringCharges = [
    { label: "Apex Cloud Enterprise", amount: "-$1,250.00", time: "Auto-renewed 10m ago" },
    { label: "Coaching Center SaaS Plan", amount: "-$480.00", time: "Settled via ACH" },
    { label: "24/7 Dedicated Support SLA", amount: "-$150.00", time: "Paid on invoice" },
    { label: "Crossfit Gym Monthly Tiers", amount: "-$2,140.00", time: "38 Active Members" },
  ];

  return (
    <section id="reliability" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header (Matching MONELIQ frame_24s.jpg) */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Enterprise Reliability
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Spend less time chasing, <br />
          <span className="text-slate-400 font-semibold">more time in flow</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto font-normal">
          Engineered for digital businesses, retail services, fitness clubs, and SaaS teams
          requiring sub-second uptime and flawless financial accuracy.
        </p>
      </div>

      {/* Top 2-Column Feature Cards (Matching MONELIQ frame_24s.jpg) */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Security That Never Sleeps */}
        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#ededf0] border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Security that never sleeps
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Built on PCI DSS Level 1 standards, encrypted API tokens, and deterministic state
              machine validation. Every invoice and transaction is cryptographically tamper-evident.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Explore security
              </Link>
            </div>
          </div>

          {/* Visual Dark Card Mockup (Frame 24s) */}
          <div className="relative pt-6 flex justify-center">
            <div className="w-full max-w-xs h-40 rounded-2xl bg-gradient-to-br from-slate-900 via-black to-slate-950 p-5 text-white shadow-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider">FLOWGRID</span>
                <span className="text-[10px] text-emerald-400 font-medium">PCI Verified</span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest block pt-2">
                  •••• 4920 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Instant Automated Invoices */}
        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#ededf0] border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Multi-currency recurring billing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Effortlessly bill across USD, EUR, GBP and regional currencies with automated tax
              deductions, percentage discounts, and instant invoice PDF delivery.
            </p>
            <div className="pt-2">
              <Link
                href="/invoices"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                View invoice engine
              </Link>
            </div>
          </div>

          {/* Transaction Line Mockup (Frame 24s) */}
          <div className="pt-6 space-y-3">
            <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  $
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    US Dollar Billing
                  </span>
                  <span className="text-[10px] text-slate-400">Recurring SaaS Engine</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">+$24,850.00</span>
            </div>

            <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  €
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Euro SEPA Direct
                  </span>
                  <span className="text-[10px] text-slate-400">Automated Direct Debit</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">+€16,420.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Bento Grid (Matching MONELIQ frame_28s.jpg) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Column 1 */}
        <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4">
          <span className="text-base font-bold text-slate-900 block">
            Flexible Plan Hierarchies
          </span>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Configure base product prices with attribute deltas (e.g., Brand Add-on +$560.00, Extra
            Storage +$40.00).
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Standard + SLA Addon</span>
            <span className="font-bold text-slate-900">$200.00/mo</span>
          </div>
        </div>

        {/* Bento Column 2 */}
        <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4">
          <span className="text-base font-bold text-slate-900 block">Idempotent State Machine</span>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            State flow: Draft → Quotation → Confirmed → Active → Paused → Closed. Protect every
            transition with backend safety locks.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Unhandled Edge Cases</span>
          </div>
        </div>

        {/* Bento Column 3: Live Subscriptions Ticker (Frame 28s) */}
        <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-4">
          <span className="text-base font-bold text-slate-900 block">
            Powering 10,000+ Businesses
          </span>
          <div className="space-y-2 pt-1">
            {recurringCharges.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px]">
                    {item.label}
                  </span>
                  <span className="text-[9px] text-slate-400">{item.time}</span>
                </div>
                <span className="font-bold text-emerald-600 text-[11px]">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
