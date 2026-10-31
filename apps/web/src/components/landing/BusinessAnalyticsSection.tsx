"use client";

import React, { useEffect, useRef } from "react";
import {
  TrendingUp,
  PieChart,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  Users,
  Receipt,
  FileCheck,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function BusinessAnalyticsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const analyticsCardRef = useRef<HTMLDivElement>(null);
  const metricsGridRef = useRef<HTMLDivElement>(null);
  const lineChartPathRef = useRef<SVGPathElement>(null);
  const distBarRef = useRef<HTMLDivElement>(null);
  const paymentTransferPillRef = useRef<HTMLDivElement>(null);
  const mrrCounterRef = useRef<HTMLSpanElement>(null);
  const subsCounterRef = useRef<HTMLSpanElement>(null);
  const paymentsCounterRef = useRef<HTMLSpanElement>(null);
  const invoicesCounterRef = useRef<HTMLSpanElement>(null);
  const notif1Ref = useRef<HTMLDivElement>(null);
  const notif2Ref = useRef<HTMLDivElement>(null);
  const splineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            leftColRef.current,
            highlightsRef.current?.children,
            analyticsCardRef.current,
            metricsGridRef.current?.children,
            distBarRef.current,
            notif1Ref.current,
            notif2Ref.current,
            paymentTransferPillRef.current,
          ],
          { opacity: 1, y: 0, x: 0, scale: 1 }
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play reverse play reverse",
        },
        defaults: { ease: "power3.out" },
      });

      // 1. Left column text entrance
      if (leftColRef.current) {
        tl.fromTo(
          leftColRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }
        );
      }

      // 2. Highlights entrance
      if (highlightsRef.current) {
        tl.fromTo(
          highlightsRef.current.children,
          { opacity: 0, x: -25 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12 },
          "-=0.4"
        );
      }

      // 3. Main Analytics Panel entrance
      tl.fromTo(
        analyticsCardRef.current,
        { opacity: 0, y: 50, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" },
        "-=0.6"
      );

      // 4. Transformation Bridge: Payment confirmation from Slide 5 feeds into analytics
      tl.fromTo(
        paymentTransferPillRef.current,
        { opacity: 0, y: -30, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" },
        "-=0.5"
      );

      // 5. Metric cards pop in with stagger
      if (metricsGridRef.current) {
        tl.fromTo(
          metricsGridRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.3"
        );
      }

      // 6. Metric Numbers Count Up
      // MRR: ₹1,48,250
      const mrrObj = { val: 0 };
      tl.to(
        mrrObj,
        {
          val: 148250,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            if (mrrCounterRef.current) {
              mrrCounterRef.current.innerText =
                "₹" + Math.round(mrrObj.val).toLocaleString("en-IN");
            }
          },
        },
        "-=0.4"
      );

      // Active Subscriptions: 2,840
      const subsObj = { val: 0 };
      tl.to(
        subsObj,
        {
          val: 2840,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            if (subsCounterRef.current) {
              subsCounterRef.current.innerText = Math.round(subsObj.val).toLocaleString("en-IN");
            }
          },
        },
        "<"
      );

      // Total Payments: ₹18.4L
      const paymentsObj = { val: 0 };
      tl.to(
        paymentsObj,
        {
          val: 18.4,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            if (paymentsCounterRef.current) {
              paymentsCounterRef.current.innerText = "₹" + paymentsObj.val.toFixed(1) + "L";
            }
          },
        },
        "<"
      );

      // Outstanding Invoices: 12
      const invoicesObj = { val: 0 };
      tl.to(
        invoicesObj,
        {
          val: 12,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            if (invoicesCounterRef.current) {
              invoicesCounterRef.current.innerText = Math.round(invoicesObj.val).toString();
            }
          },
        },
        "<"
      );

      // 7. Progressive SVG Line Chart Drawing
      if (lineChartPathRef.current) {
        const len = lineChartPathRef.current.getTotalLength
          ? lineChartPathRef.current.getTotalLength()
          : 600;
        gsap.set(lineChartPathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(
          lineChartPathRef.current,
          {
            strokeDashoffset: 0,
            duration: 1.3,
            ease: "power2.inOut",
          },
          "-=1.0"
        );
      }

      // 8. Revenue Distribution bar expands
      if (distBarRef.current) {
        tl.fromTo(
          distBarRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        );
      }

      // 9. Connecting spline
      if (splineRef.current) {
        const len = splineRef.current.getTotalLength ? splineRef.current.getTotalLength() : 300;
        gsap.set(splineRef.current, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(splineRef.current, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.6");
      }

      // 10. Floating telemetry notifications
      tl.fromTo(
        notif1Ref.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" },
        "-=0.4"
      );

      tl.fromTo(
        notif2Ref.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" },
        "-=0.35"
      );

      // Idle floating
      [notif1Ref.current, notif2Ref.current].forEach((notif, idx) => {
        if (notif) {
          gsap.to(notif, {
            y: idx === 0 ? -6 : 6,
            duration: 3.5 + idx * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: idx * 0.3,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="analytics"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-white overflow-hidden flex items-center justify-center"
    >
      {/* Ambient Lighting Gradients */}
      <div
        className="absolute top-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-blue-100/35 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-100/35 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/3 w-[460px] h-[460px] rounded-full bg-emerald-100/30 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ============================================================ */}
          {/* Left Column: Heading, Description & 3 Feature Highlights     */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-8">
            <div ref={leftColRef} className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[11px] font-bold tracking-wider uppercase text-blue-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                <span>BUSINESS ANALYTICS</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-black tracking-[-0.035em] text-slate-950 leading-[1.08]">
                Your business, <br />
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  clearly in view.
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-lg">
                Understand your recurring revenue, monitor outstanding payments and make smarter
                business decisions.
              </p>
            </div>

            {/* Three Key Highlights Stacked Vertically */}
            <div ref={highlightsRef} className="space-y-4 pt-2">
              {/* Highlight 1: Revenue Tracking */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <TrendingUp className="w-5 h-5 text-[#8b5cf6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Revenue Tracking
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Real-time Monthly Recurring Revenue (MRR) and net volume tracking updated on every settlement.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Subscription Insights */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <PieChart className="w-5 h-5 text-[#3b82f6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Subscription Insights
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Analyze tier distribution between Basic, Pro, and Business plans with churn cohort predictions.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Payment Monitoring */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Activity className="w-5 h-5 text-[#10b981] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Payment Monitoring
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Keep tabs on settled receivables, gateway success rates, and outstanding overdue invoices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* Right Column: Floating Analytics Interface Visual            */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[580px]">
            {/* Connecting Curved SVG Splines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
              viewBox="0 0 680 580"
              fill="none"
            >
              <defs>
                <linearGradient id="analyticsSpline" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path
                ref={splineRef}
                d="M 130 90 C 180 140, 230 200, 310 220"
                stroke="url(#analyticsSpline)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* MAIN ELEMENT: Floating Analytics Panel */}
            <div
              ref={analyticsCardRef}
              className="relative w-full max-w-[580px] rounded-[32px] bg-white border border-slate-100/90 shadow-[0_30px_70px_-15px_rgba(20,25,45,0.1),0_15px_35px_-5px_rgba(20,25,45,0.05)] p-6 sm:p-7 z-20 overflow-hidden will-change-transform"
            >
              {/* Glass Sheen */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent pointer-events-none opacity-50"
                aria-hidden="true"
              />

              {/* Transformation Bridge Pill from Slide 5 */}
              <div ref={paymentTransferPillRef} className="pb-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-900 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Settlement Synced: <strong>₹1,178.82 from INV-1042</strong></span>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Revenue & Health Telemetry
                  </h3>
                  <div className="text-xs text-slate-400 font-normal mt-0.5">
                    Updated live from billing gateway
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-[#7c3aed] text-xs font-bold border border-purple-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
                  <span>Real-Time</span>
                </div>
              </div>

              {/* 4 Compact Metric Cards (2x2 Grid) */}
              <div ref={metricsGridRef} className="grid grid-cols-2 gap-3.5 pt-4 pb-5 relative z-10">
                {/* Metric 1: Monthly Recurring Revenue */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Monthly Recurring Revenue</span>
                    <TrendingUp className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  </div>
                  <div
                    ref={mrrCounterRef}
                    className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight"
                  >
                    ₹1,48,250
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    <span>+18.4% vs last month</span>
                  </div>
                </div>

                {/* Metric 2: Active Subscriptions */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Active Subscriptions</span>
                    <Users className="w-3.5 h-3.5 text-[#3b82f6]" />
                  </div>
                  <div
                    ref={subsCounterRef}
                    className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight"
                  >
                    2,840
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    <span>+124 added this week</span>
                  </div>
                </div>

                {/* Metric 3: Total Payments Received */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Total Payments Received</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  </div>
                  <div
                    ref={paymentsCounterRef}
                    className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight"
                  >
                    ₹18.4L
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    99.8% collection success rate
                  </div>
                </div>

                {/* Metric 4: Outstanding Invoices */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-semibold">Outstanding Invoices</span>
                    <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div
                    ref={invoicesCounterRef}
                    className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight"
                  >
                    12
                  </div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">
                    ₹14,200 pending settlement
                  </div>
                </div>
              </div>

              {/* Elegant Revenue Line Chart */}
              <div className="pt-2 pb-4 border-t border-slate-100 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Revenue Growth Trajectory</span>
                  <span className="text-[11px] text-slate-400">May – Oct 2026</span>
                </div>

                <div className="relative w-full h-[120px] bg-slate-50/60 rounded-2xl p-2 border border-slate-100 overflow-hidden">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 520 100" fill="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="chartArea" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient area under curve */}
                    <path
                      d="M 10 85 Q 90 75, 170 60 T 330 35 T 510 15 L 510 100 L 10 100 Z"
                      fill="url(#chartArea)"
                    />

                    {/* Progressive Line Chart Path */}
                    <path
                      ref={lineChartPathRef}
                      d="M 10 85 Q 90 75, 170 60 T 330 35 T 510 15"
                      stroke="url(#chartGrad)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* Endpoint Glowing Dot */}
                    <circle cx="510" cy="15" r="4.5" fill="#10b981" />
                    <circle cx="510" cy="15" r="8" fill="#10b981" opacity="0.35" />
                  </svg>
                </div>
              </div>

              {/* Small Revenue Distribution Visualization */}
              <div className="pt-2 relative z-10">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span>Revenue by Plan Tier</span>
                  <span className="text-[11px] text-slate-400">Total ₹1.48L</span>
                </div>

                {/* Segmented Distribution Bar */}
                <div
                  ref={distBarRef}
                  className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 will-change-transform"
                >
                  <div
                    style={{ width: "58%" }}
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#7c3aed]"
                    title="Pro Plan: 58%"
                  />
                  <div
                    style={{ width: "32%" }}
                    className="h-full bg-[#06b6d4]"
                    title="Business Plan: 32%"
                  />
                  <div
                    style={{ width: "10%" }}
                    className="h-full bg-[#10b981]"
                    title="Basic Plan: 10%"
                  />
                </div>

                {/* Distribution Legend */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                    <span className="font-medium text-slate-700">Pro (58%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                    <span className="font-medium text-slate-700">Business (32%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="font-medium text-slate-700">Basic (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 1: MRR Growth (Top-Right)                       */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif1Ref}
              className="absolute -top-4 sm:top-2 -right-2 sm:-right-8 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[230px] sm:max-w-[250px]"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  MRR Accelerated
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  +18.4% growth this month
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)] ml-auto shrink-0" />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 2: Payment Success (Bottom-Right)               */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif2Ref}
              className="absolute -bottom-4 sm:bottom-4 -right-2 sm:-right-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Settlement Rate 99.8%
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  Zero churn on active batch
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] ml-auto shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
