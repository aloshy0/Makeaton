"use client";

import React, { useEffect, useRef } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  Activity,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AnalyticsDashboardSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const revenueCounterRef = useRef<HTMLSpanElement>(null);
  const subsCounterRef = useRef<HTMLSpanElement>(null);
  const pathGraphRef = useRef<SVGPathElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const indicatorsRef = useRef<HTMLDivElement>(null);

  const months = [
    { label: "May", height: "45%", val: "$62k" },
    { label: "Jun", height: "58%", val: "$81k" },
    { label: "Jul", height: "72%", val: "$102k" },
    { label: "Aug", height: "84%", val: "$119k" },
    { label: "Sep", height: "92%", val: "$134k" },
    { label: "Oct", height: "100%", val: "$148k" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 30%",
            toggleActions: "play reverse play reverse",
          },
          defaults: { ease: "power3.out" },
        });

        // 1. Revenue counter counts up
        const revObj = { val: 0 };
        tl.to(
          revObj,
          {
            val: 148250,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              if (revenueCounterRef.current) {
                revenueCounterRef.current.innerText =
                  "$" +
                  Math.round(revObj.val).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
              }
            },
          },
          0
        );

        // 2. Active subscriptions counter counts up
        const subsObj = { val: 0 };
        tl.to(
          subsObj,
          {
            val: 2840,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              if (subsCounterRef.current) {
                subsCounterRef.current.innerText = Math.round(subsObj.val).toLocaleString("en-US");
              }
            },
          },
          0.1
        );

        // 3. SVG Graph line draws progressively
        if (pathGraphRef.current) {
          const length = pathGraphRef.current.getTotalLength
            ? pathGraphRef.current.getTotalLength()
            : 800;
          gsap.set(pathGraphRef.current, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });

          tl.to(
            pathGraphRef.current,
            {
              strokeDashoffset: 0,
              duration: 2.2,
              ease: "power2.inOut",
            },
            0.2
          );
        }

        // 4. Bar charts grow upwards
        if (barChartRef.current) {
          const bars = barChartRef.current.querySelectorAll(".growth-bar");
          tl.fromTo(
            bars,
            { scaleY: 0, transformOrigin: "bottom" },
            {
              scaleY: 1,
              duration: 1.2,
              stagger: 0.12,
              ease: "back.out(1.2)",
            },
            0.4
          );
        }

        // 5. Payment status indicators appear sequentially
        if (indicatorsRef.current) {
          const badges = indicatorsRef.current.children;
          tl.fromTo(
            badges,
            { opacity: 0, x: 20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: "power2.out",
            },
            0.6
          );
        }
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 w-full max-w-7xl mx-auto">
      {/* Dark Financial Terminal Container */}
      <div
        ref={containerRef}
        id="analytics"
        className="relative rounded-[2.5rem] lg:rounded-[3rem] bg-[#0c0c0e] text-white overflow-hidden border border-white/10 shadow-2xl p-8 sm:p-12 lg:p-16 space-y-12"
      >
        {/* Subtle Cyber Grid and Emerald Aurora Ambient Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Real-Time Financial Telemetry
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Executive Analytics & Revenue Velocity
            </h2>

            <p className="text-sm text-slate-400 max-w-lg font-normal">
              Consolidated real-time aggregations calculated directly in the PostgreSQL database layer
              with guaranteed sub-2-second response SLAs.
            </p>
          </div>

          {/* Top Live Counters */}
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Total MRR Run-Rate
              </span>
              <span
                ref={revenueCounterRef}
                className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
              >
                $0.00
              </span>
            </div>

            <div className="border-l border-white/10 pl-6">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Active Contracts
              </span>
              <span
                ref={subsCounterRef}
                className="text-2xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight"
              >
                0
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Charts Matrix */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main SVG Area Velocity Curve (Progressively Drawn with GSAP) */}
          <div className="lg:col-span-7 rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Cumulative Revenue Trend</span>
                <span className="text-[11px] text-slate-400">Past 6 months growth trajectory</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+34.2% YoY</span>
              </div>
            </div>

            {/* Responsive SVG Graphic with progressively drawn path */}
            <div className="relative h-60 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" fill="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                {/* Animated Path */}
                <path
                  ref={pathGraphRef}
                  d="M 10 180 Q 120 160, 200 130 T 350 90 T 480 50 T 590 20"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Gradient Fill under path */}
                <path
                  d="M 10 180 Q 120 160, 200 130 T 350 90 T 480 50 T 590 20 L 590 200 L 10 200 Z"
                  fill="url(#greenGlowGrad)"
                  opacity="0.15"
                />

                <defs>
                  <linearGradient id="greenGlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10 font-mono">
              <span>May 2026: $62,000</span>
              <span className="text-emerald-400 font-bold">Oct 2026: $148,250</span>
            </div>
          </div>

          {/* Right: Growing Bar Charts & Status Indicators */}
          <div className="lg:col-span-5 space-y-6">
            {/* Growing Bar Chart */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 space-y-4">
              <span className="text-xs font-bold text-white block">Monthly Billing Volume</span>

              <div ref={barChartRef} className="h-36 flex items-end justify-between gap-3 pt-2">
                {months.map((m, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[9px] text-slate-400 font-mono">{m.val}</span>
                    <div
                      className="growth-bar w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 transition-all shadow-sm"
                      style={{ height: m.height }}
                    />
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status Indicators */}
            <div ref={indicatorsRef} className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-medium">Atomic Payment Reconciliation</span>
                </div>
                <span className="text-emerald-400 font-bold">100% Settled</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-medium">Overdue Invoice Auto-Recovery</span>
                </div>
                <span className="text-emerald-400 font-bold">48% Dunning Saved</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-white font-medium">Multi-Tenant Database Isolation</span>
                </div>
                <span className="text-purple-300 font-bold">0ms Variance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
