"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, ShieldCheck, Building2, Zap, HelpCircle } from "lucide-react";
import { DUMMY_PLANS } from "../../../lib/dummy-data";
import { formatCurrency } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";

export default function BrowsePlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    setSubscribedPlan(planId);
    setTimeout(() => {
      setSubscribedPlan(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FlowGrid Plan Storefront</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B1020] tracking-tight">
          Explore Published Subscription Tiers
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Discover self-service plans published by FlowGrid business organizations. Transparent
          billing with no hidden fees.
        </p>

        {/* Billing Cycle Selector */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-[#E8ECF3] mt-2">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-[#0B1020] shadow-xs"
                : "text-[#64748B] hover:text-[#0B1020]"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-white text-[#0B1020] shadow-xs"
                : "text-[#64748B] hover:text-[#0B1020]"
            }`}
          >
            <span>Annual (Save 20%)</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded">
              Popular
            </span>
          </button>
        </div>
      </div>

      {/* Plans Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DUMMY_PLANS.map((plan, idx) => {
          const isFeatured = idx === 1;
          const price =
            billingCycle === "yearly" ? Number(plan.base_price) * 10 : Number(plan.base_price);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isFeatured
                  ? "border-[#7651F5] ring-2 ring-[#7651F5]/10 shadow-lg relative"
                  : "border-[#E8ECF3] shadow-2xs hover:shadow-md"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7651F5] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-lg text-[#0B1020]">{plan.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {plan.code}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading font-black text-3xl text-[#0B1020]">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    /{billingCycle === "yearly" ? "year" : "month"}
                  </span>
                </div>

                <p className="text-xs text-[#64748B] mt-2">
                  Full self-service recurring billing lifecycle with automated dunning recovery and
                  invoices.
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-[#0B1020]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Real-time subscription renewal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Self-service pause & resume controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Printable invoices & payment receipts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Enterprise SLA & multi-currency support</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                {subscribedPlan === plan.id ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200">
                    Subscription Activated!
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold ${
                      isFeatured
                        ? "bg-[#7651F5] hover:bg-[#6842e6] text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    Subscribe to {plan.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
