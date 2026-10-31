"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowDown,
  Layers,
  Repeat,
  Receipt,
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Sparkles,
  ChevronRight,
  Search,
  Bell,
} from "lucide-react";
import { gsap } from "gsap";

interface HeroSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function HeroSection({ mode, setMode }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle entry animation for headline & mockup
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        mockupRef.current,
        { opacity: 0, y: 50, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: 0.2, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById("product-intro");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full max-w-7xl mx-auto">
      {/* Outer Obsidian Container with Rounded Corners & Aurora Glow */}
      <div
        ref={containerRef}
        className="relative rounded-[2.5rem] lg:rounded-[3rem] bg-[#0c0c0e] text-white overflow-hidden border border-white/10 shadow-2xl p-6 sm:p-10 lg:p-16 min-h-[820px] flex flex-col justify-between"
      >
        {/* Subtle Cyber Grid and Emerald Aurora Ambient Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero Top Content: Heading, Subtitle & Primary CTA */}
        <div className="relative z-10 max-w-3xl mx-auto text-center pt-4 sm:pt-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[11px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Next-Gen Subscription OS
          </div>

          <h1
            ref={headlineRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            Keep your business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-slate-400">
              in flow.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
            Manage subscriptions, automate recurring billing and keep every payment on track. All from
            one place.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/10"
            >
              Open FlowGrid account
            </Link>
            <Link
              href="#lifecycle"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all"
            >
              Explore platform
            </Link>
          </div>
        </div>

        {/* Realistic FlowGrid Dashboard Product Mockup (Matching MONELIQ reference video frame_03s.jpg) */}
        <div
          ref={mockupRef}
          className="relative z-10 mt-12 w-full max-w-5xl mx-auto rounded-3xl bg-[#141418]/90 border border-white/15 p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Mockup Sidebar */}
            <div className="hidden lg:flex lg:col-span-3 flex-col space-y-4 border-r border-white/10 pr-6">
              <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/10">
                <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  FG
                </div>
                <span className="text-xs font-bold tracking-tight text-white">FlowGrid OS</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 text-white font-medium">
                  <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Subscriptions</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Recurring Invoices</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                  <Users className="w-3.5 h-3.5" />
                  <span>Customers</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Financial KPIs</span>
                </div>
              </div>
            </div>

            {/* Mockup Main Display: Balance & Subscription Tiers */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    {mode === "business" ? "Monthly Recurring Revenue (MRR)" : "Active Subscriptions"}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {mode === "business" ? "$24,850.00" : "$6,950.00"}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                      +18.4%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Automated</span>
                </div>
              </div>

              {/* Subscriptions Card Preview */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Acme Enterprise</span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">Annual SLA • $1,200/mo</span>
                  <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[82%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Apex SaaS Pro</span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">Monthly 20 Seats • $480/mo</span>
                  <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full w-[65%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Right Display: Donut Statistic (Matching MONELIQ reference) */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between w-full pb-2 text-[11px] text-slate-400">
                <span>Revenue Split</span>
                <span className="text-white font-medium">Month ⌄</span>
              </div>
              <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray="55 100"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="4"
                    strokeDasharray="25 100"
                    strokeDashoffset="-55"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] font-bold text-white block">98.4%</span>
                  <span className="text-[8px] text-slate-400">Paid</span>
                </div>
              </div>
              <div className="w-full text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Recurring
                  </span>
                  <span className="text-slate-200">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Add-ons & Seats
                  </span>
                  <span className="text-slate-200">32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Controls (Scroll down & Personal/Business Switch pill) */}
        <div className="relative z-10 pt-8 flex items-center justify-between">
          {/* Scroll Down Button */}
          <button
            onClick={scrollToNext}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-all group"
          >
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform text-emerald-400" />
            <span>Scroll</span>
          </button>

          {/* Mode Switch Pill (MONELIQ Reference Style) */}
          <div className="flex rounded-full bg-black/60 p-1 border border-white/15 text-xs font-semibold backdrop-blur-md">
            <button
              onClick={() => setMode("personal")}
              className={`px-4 py-1 rounded-full transition-all ${
                mode === "personal"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setMode("business")}
              className={`px-4 py-1 rounded-full transition-all ${
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
