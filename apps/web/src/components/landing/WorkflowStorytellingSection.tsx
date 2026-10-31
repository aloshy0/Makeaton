"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Layers,
  Repeat,
  Receipt,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  Zap,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function WorkflowStorytellingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Workflow nodes refs
  const stepProductsRef = useRef<HTMLDivElement>(null);
  const stepPlansRef = useRef<HTMLDivElement>(null);
  const stepSubsRef = useRef<HTMLDivElement>(null);
  const stepInvoiceRef = useRef<HTMLDivElement>(null);
  const stepPaymentRef = useRef<HTMLDivElement>(null);

  // SVG lines refs
  const svgLine1Ref = useRef<SVGPathElement>(null);
  const svgLine2Ref = useRef<SVGPathElement>(null);
  const svgLine3Ref = useRef<SVGPathElement>(null);
  const svgLine4Ref = useRef<SVGPathElement>(null);

  // Dynamic elements
  const paymentBadgeRef = useRef<HTMLDivElement>(null);
  const subStatusBadgeRef = useRef<HTMLSpanElement>(null);
  const invoiceTaxRef = useRef<HTMLDivElement>(null);

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const stepsMeta = [
    { label: "1. Products", title: "Product Catalog & Variants" },
    { label: "2. Plans", title: "Configured Subscription Plans" },
    { label: "3. Subscriptions", title: "Customer Lifecycle Machine" },
    { label: "4. Invoices", title: "Automated Idempotent Billing" },
    { label: "5. Settlement", title: "Instant Payment Reconciliation" },
    { label: "6. Unified Flow", title: "End-to-End Enterprise Operations" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // SVG path lengths setup
      const lines = [
        svgLine1Ref.current,
        svgLine2Ref.current,
        svgLine3Ref.current,
        svgLine4Ref.current,
      ];

      lines.forEach((line) => {
        if (line) {
          const length = line.getTotalLength ? line.getTotalLength() : 300;
          gsap.set(line, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
        }
      });

      // Master Pinned Scroll-Driven Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=2600",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            // Update active step indicator
            if (p < 0.18) setActiveStepIndex(0);
            else if (p < 0.36) setActiveStepIndex(1);
            else if (p < 0.54) setActiveStepIndex(2);
            else if (p < 0.72) setActiveStepIndex(3);
            else if (p < 0.9) setActiveStepIndex(4);
            else setActiveStepIndex(5);

            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${Math.min(100, p * 105)}%`;
            }
          },
        },
      });

      // Initial States
      gsap.set(stepProductsRef.current, { opacity: 1, scale: 1, y: 0 });
      gsap.set([stepPlansRef.current, stepSubsRef.current, stepInvoiceRef.current, stepPaymentRef.current], {
        opacity: 0,
        y: 60,
        scale: 0.9,
      });

      // STEP 1 -> STEP 2: Products Connect to Plans (Progress 0 -> 0.25)
      masterTl
        .to(svgLine1Ref.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "none",
        })
        .to(
          stepPlansRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.8"
        );

      // STEP 2 -> STEP 3: Plan Bound to Customer Subscription (Progress 0.25 -> 0.5)
      masterTl
        .to(svgLine2Ref.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "none",
        })
        .to(
          stepSubsRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.8"
        )
        // Transition subscription status badge from DRAFT -> ACTIVE
        .to(
          subStatusBadgeRef.current,
          {
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            text: "ACTIVE",
            duration: 0.5,
          },
          "-=0.3"
        );

      // STEP 3 -> STEP 4: Automated Batch Invoice Generation (Progress 0.5 -> 0.75)
      masterTl
        .to(svgLine3Ref.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "none",
        })
        .to(
          stepInvoiceRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.8"
        )
        .fromTo(
          invoiceTaxRef.current,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.6 },
          "-=0.4"
        );

      // STEP 4 -> STEP 5: Payment Reconciliation & Settlement (Progress 0.75 -> 0.92)
      masterTl
        .to(svgLine4Ref.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "none",
        })
        .to(
          stepPaymentRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.8"
        )
        // Animate Payment Badge from Pending (Amber) to Paid in Full (Emerald)
        .to(
          paymentBadgeRef.current,
          {
            backgroundColor: "#10b981",
            color: "#000000",
            scale: 1.05,
            duration: 0.8,
            ease: "back.out(2)",
          },
          "-=0.3"
        );

      // STEP 6: Full Unified Ecosystem (Progress 0.92 -> 1.0)
      masterTl.to(
        [
          stepProductsRef.current,
          stepPlansRef.current,
          stepSubsRef.current,
          stepInvoiceRef.current,
          stepPaymentRef.current,
        ],
        {
          borderColor: "rgba(16, 185, 129, 0.4)",
          boxShadow: "0 0 30px rgba(16, 185, 129, 0.12)",
          duration: 1,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workflow-storytelling"
      className="relative w-full min-h-screen bg-[#09090b] text-white z-10 overflow-hidden"
    >
      {/* Pinned Fullscreen Stage */}
      <div
        ref={pinContainerRef}
        className="h-screen w-full flex flex-col justify-between py-8 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden relative"
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Section Header with Step Navigation Indicator */}
        <div className="space-y-4 text-center max-w-3xl mx-auto z-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Scroll-Driven Workflow Architecture
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {stepsMeta[activeStepIndex].title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Scroll to watch the entire recurring revenue lifecycle materialize in real time.
          </p>

          {/* Interactive Step Progress Tracker */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
              {stepsMeta.map((s, idx) => (
                <span
                  key={idx}
                  className={`transition-colors ${
                    activeStepIndex >= idx ? "text-emerald-400 font-bold" : "text-slate-500"
                  }`}
                >
                  {s.label}
                </span>
              ))}
            </div>

            {/* Glowing Progress Track */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-150"
                style={{ width: "16%" }}
              />
            </div>
          </div>
        </div>

        {/* Transforming Central Visual Stage with SVG Circuit Canvas */}
        <div className="relative flex-1 flex items-center justify-center my-4 z-10 w-full overflow-x-auto lg:overflow-visible">
          {/* SVG Connecting Wiring Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
            viewBox="0 0 1200 400"
            fill="none"
          >
            {/* Connection 1: Products -> Plans */}
            <path
              ref={svgLine1Ref}
              d="M 230 200 C 270 200, 270 200, 310 200"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Connection 2: Plans -> Subscriptions */}
            <path
              ref={svgLine2Ref}
              d="M 470 200 C 510 200, 510 200, 550 200"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Connection 3: Subscriptions -> Invoices */}
            <path
              ref={svgLine3Ref}
              d="M 710 200 C 750 200, 750 200, 790 200"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Connection 4: Invoices -> Settlement */}
            <path
              ref={svgLine4Ref}
              d="M 950 200 C 990 200, 990 200, 1030 200"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* 5 Interconnected Workflow Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 w-full max-w-6xl">
            {/* NODE 1: Product Catalog */}
            <div
              ref={stepProductsRef}
              className="p-5 rounded-2xl bg-[#141418] border border-white/15 shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step 1</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Product Catalog</h3>
                <p className="text-[11px] text-slate-400">
                  Base product pricing with configured variants and add-on deltas.
                </p>
                <div className="pt-2 space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                    <span className="text-slate-300">Base API Service</span>
                    <span className="font-bold text-white">$150.00</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <span className="text-purple-300">+24/7 SLA Addon</span>
                    <span className="font-bold text-purple-400">+$150.00</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>SKU: ADDON-SLA</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>
            </div>

            {/* NODE 2: Subscription Plans */}
            <div
              ref={stepPlansRef}
              className="p-5 rounded-2xl bg-[#141418] border border-white/15 shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step 2</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Subscription Plan</h3>
                <p className="text-[11px] text-slate-400">
                  Cadence schedules with pause, renewal and auto-close policies.
                </p>
                <div className="pt-2 space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                    <span className="text-slate-300">Interval</span>
                    <span className="font-bold text-white">Monthly</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <span className="text-emerald-300">Auto Renew</span>
                    <span className="font-bold text-emerald-400">Enabled</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Grace: 7 Days</span>
                <span className="text-emerald-400 font-semibold">Active Tier</span>
              </div>
            </div>

            {/* NODE 3: Customer Organization & Active Subscription */}
            <div
              ref={stepSubsRef}
              className="p-5 rounded-2xl bg-[#141418] border border-white/15 shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step 3</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Active Subscription</h3>
                <p className="text-[11px] text-slate-400">
                  Customer contract bound into the lifecycle state machine.
                </p>
                <div className="pt-2 space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-slate-400 block text-[9px]">Organization</span>
                    <span className="font-semibold text-white">Acme Global Inc</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <span
                      ref={subStatusBadgeRef}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400"
                    >
                      CONFIRMED
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Start: Oct 31</span>
                <span className="text-indigo-400 font-semibold">Bound</span>
              </div>
            </div>

            {/* NODE 4: Generated Invoice */}
            <div
              ref={stepInvoiceRef}
              className="p-5 rounded-2xl bg-[#141418] border border-white/15 shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step 4</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Automated Invoice</h3>
                <p className="text-[11px] text-slate-400">
                  Deterministic idempotent billing engine generates tax invoice.
                </p>
                <div className="pt-2 space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                    <span className="text-slate-300">INV-2026-0892</span>
                    <span className="font-bold text-white">$300.00</span>
                  </div>
                  <div
                    ref={invoiceTaxRef}
                    className="p-2 rounded-lg bg-white/5 flex items-center justify-between text-[10px]"
                  >
                    <span className="text-slate-400">18% VAT included</span>
                    <span className="text-emerald-400 font-semibold">+$54.00</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Key: sub_acme_31</span>
                <span className="text-emerald-400 font-semibold">Idempotent</span>
              </div>
            </div>

            {/* NODE 5: Settlement & Reconciliation */}
            <div
              ref={stepPaymentRef}
              className="p-5 rounded-2xl bg-[#141418] border border-white/15 shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Step 5</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Settlement Reconciled</h3>
                <p className="text-[11px] text-slate-400">
                  Instant balance settlement with zero reconciliation variance.
                </p>
                <div className="pt-2 space-y-2 text-[11px]">
                  <div
                    ref={paymentBadgeRef}
                    className="py-2 px-3 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-center text-xs tracking-wide"
                  >
                    PAID IN FULL ✓
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Method</span>
                    <span className="text-white font-medium">Apple Pay / ACH</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Txn: #884192</span>
                <span className="text-emerald-400 font-bold">100% In Flow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Prompt Bar */}
        <div className="text-center py-2 z-20">
          <span className="text-[11px] text-slate-500 font-mono">
            ↓ Continue scrolling to enter Automated Billing Deep-Dive
          </span>
        </div>
      </div>
    </section>
  );
}
