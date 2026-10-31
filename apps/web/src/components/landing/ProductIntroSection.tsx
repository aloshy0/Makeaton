"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Loader2, Sparkles, User, ArrowRight } from "lucide-react";

export function ProductIntroSection() {
  const [currency, setCurrency] = useState("USD");
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success">("idle");
  const [amount, setAmount] = useState("2,384.00");

  const handleSimulatePayment = () => {
    if (btnState !== "idle") return;
    setBtnState("loading");
    setTimeout(() => {
      setBtnState("success");
      setTimeout(() => {
        setBtnState("idle");
      }, 4000);
    }, 1200);
  };

  return (
    <section id="product-intro" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Centered Intro Header with Pill Badge (Matching MONELIQ frame_06s.jpg) */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Subscription Operations
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Efficiency at its best: FlowGrid&apos;s <br />
          <span className="text-slate-400 font-semibold">recurring billing</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
          Empowering modern businesses with automated billing schedules, accurate proration, and
          instant payment settlement.
        </p>
      </div>

      {/* Two Column Showcase (Matching MONELIQ frame_08s.jpg - frame_12s.jpg) */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Feature Narrative */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Automated Invoicing
          </div>

          <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
            Global subscriptions: your gateway to automated revenue
          </h3>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            FlowGrid orchestrates recurring batch runs, automatically schedules invoices according
            to plan intervals, and applies regional taxes and discount rules without manual
            intervention.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Idempotent Billing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Prorated Upgrades</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Zero Overdues</span>
            </div>
          </div>
        </div>

        {/* Right Column: Elevated Interactive Transaction Card (Matching frame_08s.jpg) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md rounded-[2.5rem] bg-[#ededf0] p-4 sm:p-6 shadow-xl border border-slate-200/80">
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Amount</span>
                <span className="text-[11px] text-slate-400">Generate & bill subscription</span>
              </div>

              {/* Amount Input with Currency Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    ${amount}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Account balance: $68,950.00
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span>{currency}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Customer Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Select subscriber or organization
                </label>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                      JS
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">John Smith</span>
                      <span className="text-[10px] text-slate-400">john.smith@acme.com</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Action Button that animates into Loader & Mint Green Successful (MONELIQ frame_10s - 12s) */}
              <button
                onClick={handleSimulatePayment}
                disabled={btnState !== "idle"}
                className={`w-full py-4 rounded-full font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-md active:scale-98 ${
                  btnState === "idle"
                    ? "bg-black text-white hover:bg-slate-800"
                    : btnState === "loading"
                      ? "bg-black text-white cursor-wait"
                      : "bg-[#7ee787] text-slate-950 font-bold shadow-emerald-200"
                }`}
              >
                {btnState === "idle" && <span>Confirm & Generate Invoice</span>}
                {btnState === "loading" && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing billing cycle...</span>
                  </div>
                )}
                {btnState === "success" && (
                  <div className="flex items-center gap-2 text-slate-950">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Successful!</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staggered Feature Cards (Matching frame_12s.jpg) */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
          <span className="text-sm font-bold text-slate-900 block">Financial Analytics</span>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Gain immediate visibility into Monthly Recurring Revenue (MRR), ARR, and churn rates
            with real-time updates.
          </p>
          <div className="pt-4 h-24 rounded-xl bg-slate-50 border border-slate-100 flex items-end p-3 gap-2">
            <div className="bg-emerald-400 w-1/5 h-[40%] rounded-t" />
            <div className="bg-emerald-400 w-1/5 h-[65%] rounded-t" />
            <div className="bg-emerald-400 w-1/5 h-[50%] rounded-t" />
            <div className="bg-emerald-500 w-1/5 h-[80%] rounded-t" />
            <div className="bg-emerald-600 w-1/5 h-[95%] rounded-t" />
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
          <span className="text-sm font-bold text-slate-900 block">Automated Schedules</span>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Idempotent batch processing guarantees invoices are created exactly once without double
            charges or omissions.
          </p>
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600 font-medium">Monthly Renewal</span>
              <span className="text-emerald-600 font-semibold">Scheduled</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600 font-medium">Tax Calculation</span>
              <span className="text-slate-800 font-semibold">18% Auto</span>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
          <span className="text-sm font-bold text-slate-900 block">Customer Portals</span>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Give your subscribers a dedicated portal to view past invoices, download PDF receipts,
            and manage payment cards.
          </p>
          <div className="pt-4">
            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
              <span>Customer Portal 2.0</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
