"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function PricingSection({ mode, setMode }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const personalPlans = [
    {
      name: "Standard",
      validity: "Valid for one month",
      price: billingCycle === "yearly" ? "€9,99" : "€14,99",
      period: billingCycle === "yearly" ? "/ yr" : "/ mo",
      desc: "Get started with essential recurring billing for solo practitioners and creators.",
      popular: false,
    },
    {
      name: "Pro",
      validity: "Valid for one year",
      price: billingCycle === "yearly" ? "€19,99" : "€29,99",
      period: billingCycle === "yearly" ? "/ yr" : "/ mo",
      desc: "Enhance your everyday client subscriptions with automated reminders and receipts.",
      popular: true,
    },
    {
      name: "Pro+",
      validity: "Valid for one year",
      price: billingCycle === "yearly" ? "€39,99" : "€49,99",
      period: billingCycle === "yearly" ? "/ yr" : "/ mo",
      desc: "Multiple payment gateways, automated tax deduction and discount codes.",
      popular: false,
    },
    {
      name: "Ultimate",
      validity: "Valid for one year",
      price: billingCycle === "yearly" ? "€59,99" : "€79,99",
      period: billingCycle === "yearly" ? "/ yr" : "/ mo",
      desc: "Experience the best with all-inclusive features, expert support and priority SLAs.",
      popular: false,
    },
  ];

  const businessPlans = [
    {
      name: "Standard",
      validity: "Valid for one month",
      price: billingCycle === "yearly" ? "$49" : "$69",
      period: billingCycle === "yearly" ? "/ mo" : "/ mo",
      desc: "Essential recurring billing for boutique service firms, small gyms and studios.",
      popular: false,
    },
    {
      name: "Pro",
      validity: "Valid for one year",
      price: billingCycle === "yearly" ? "$99" : "$129",
      period: billingCycle === "yearly" ? "/ mo" : "/ mo",
      desc: "Full automated batch engine, idempotent renewals, customer self-service portal.",
      popular: true,
    },
    {
      name: "Pro+",
      validity: "Valid for one year",
      price: billingCycle === "yearly" ? "$199" : "$249",
      period: billingCycle === "yearly" ? "/ mo" : "/ mo",
      desc: "Multi-seat management, custom product attribute deltas, smart dunning retries.",
      popular: false,
    },
    {
      name: "Ultimate",
      validity: "Valid for one year",
      price: billingCycle === "yearly" ? "$399" : "$499",
      period: billingCycle === "yearly" ? "/ mo" : "/ mo",
      desc: "Dedicated PostgreSQL database isolation, custom webhooks and 24/7 dedicated engineer.",
      popular: false,
    },
  ];

  const plans = mode === "personal" ? personalPlans : businessPlans;

  return (
    <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-16 w-full max-w-7xl mx-auto">
      {/* Outer Obsidian Container (Matching MONELIQ frame_36s.jpg) */}
      <div className="relative rounded-[2.5rem] lg:rounded-[3rem] bg-[#0c0c0e] text-white overflow-hidden border border-white/10 shadow-2xl p-8 sm:p-12 lg:p-16">
        {/* Ambient Top Left Glow & Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Transparent Pricing
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover our competitive prices
          </h2>

          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Explore our comprehensive price list for all subscription services and products.
          </p>

          {/* Toggle Switch between Single & Multiple Packages (Matching frame_36s.jpg) */}
          <div className="pt-2 flex justify-center">
            <div className="flex rounded-full bg-white/5 p-1 border border-white/10 text-xs font-semibold backdrop-blur-md">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual Packages (Save 20%)
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pricing Columns Grid (Matching MONELIQ frame_36s.jpg) */}
        <div className="relative z-10 mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((tier, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${
                tier.popular
                  ? "bg-gradient-to-b from-white/[0.08] to-white/[0.03] border-white/30 shadow-xl shadow-emerald-950/20"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white tracking-tight">
                    {tier.name}
                  </span>
                  {tier.popular && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      Popular
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 block">{tier.validity}</span>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-slate-400">{tier.period}</span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className={`w-full py-2.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      tier.popular
                        ? "bg-white text-black hover:bg-slate-200"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    Buy now
                  </Link>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-2 font-normal">
                  {tier.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Bar matching frame_36s.jpg */}
        <div className="relative z-10 mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-all shadow-md active:scale-95"
            >
              Get Started Today
            </Link>
            <Link
              href="#product-intro"
              className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all"
            >
              Contact Sales
            </Link>
          </div>

          {/* Mode Switch Pill on Bottom-Right (Matching MONELIQ reference) */}
          <div className="flex rounded-full bg-black/70 p-1 border border-white/15 text-xs font-semibold backdrop-blur-md">
            <button
              onClick={() => setMode("personal")}
              className={`px-3 py-1 rounded-full transition-all ${
                mode === "personal"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setMode("business")}
              className={`px-3 py-1 rounded-full transition-all ${
                mode === "business"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Business
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
