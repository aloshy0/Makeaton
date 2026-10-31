"use client";

import React, { useEffect, useRef } from "react";
import {
  Receipt,
  Calendar,
  Percent,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  CreditCard,
  FileText,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AutomatedBillingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const invoicePanelRef = useRef<HTMLDivElement>(null);
  const customerBadgeRef = useRef<HTMLDivElement>(null);
  const amountCounterRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const paidStampRef = useRef<HTMLDivElement>(null);
  const notif1Ref = useRef<HTMLDivElement>(null);
  const notif2Ref = useRef<HTMLDivElement>(null);
  const notif3Ref = useRef<HTMLDivElement>(null);
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
            invoicePanelRef.current,
            timelineRef.current?.children,
            paidStampRef.current,
            notif1Ref.current,
            notif2Ref.current,
            notif3Ref.current,
            customerBadgeRef.current,
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

      // 1. Left column text
      if (leftColRef.current) {
        tl.fromTo(
          leftColRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }
        );
      }

      // 2. Highlights
      if (highlightsRef.current) {
        tl.fromTo(
          highlightsRef.current.children,
          { opacity: 0, x: -25 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12 },
          "-=0.4"
        );
      }

      // 3. Invoice panel entrance
      tl.fromTo(
        invoicePanelRef.current,
        { opacity: 0, y: 50, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" },
        "-=0.6"
      );

      // 4. Transformation Bridge: Customer subscription from Slide 4 transforms into invoice header
      tl.fromTo(
        customerBadgeRef.current,
        { opacity: 0, y: -30, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" },
        "-=0.5"
      );

      // 5. Total amount count up (₹999 + 18% GST = ₹1,178.82)
      const totalObj = { val: 0 };
      tl.to(
        totalObj,
        {
          val: 1178.82,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            if (amountCounterRef.current) {
              amountCounterRef.current.innerText =
                "₹" +
                totalObj.val.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
            }
          },
        },
        "-=0.4"
      );

      // 6. Timeline steps populate sequentially
      if (timelineRef.current) {
        tl.fromTo(
          timelineRef.current.children,
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.45, stagger: 0.12, ease: "power2.out" },
          "-=0.3"
        );
      }

      // 7. Payment status stamp impacts with scale & rotation bounce
      tl.fromTo(
        paidStampRef.current,
        { opacity: 0, scale: 2.2, rotation: -20 },
        { opacity: 1, scale: 1, rotation: -6, duration: 0.65, ease: "back.out(2.5)" },
        "-=0.1"
      );

      // 8. Connecting curved spline
      if (splineRef.current) {
        const len = splineRef.current.getTotalLength ? splineRef.current.getTotalLength() : 300;
        gsap.set(splineRef.current, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(
          splineRef.current,
          { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
          "-=0.5"
        );
      }

      // 9. Floating notifications appear
      tl.fromTo(
        notif1Ref.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" },
        "-=0.4"
      );

      tl.fromTo(
        notif2Ref.current,
        { opacity: 0, scale: 0.8, x: 20 },
        { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: "back.out(1.5)" },
        "-=0.35"
      );

      tl.fromTo(
        notif3Ref.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" },
        "-=0.3"
      );

      // Idle sine floating on notifications
      [notif1Ref.current, notif2Ref.current, notif3Ref.current].forEach((notif, idx) => {
        if (notif) {
          gsap.to(notif, {
            y: idx % 2 === 0 ? -6 : 6,
            duration: 3.4 + idx * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: idx * 0.25,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="billing"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-white overflow-hidden flex items-center justify-center"
    >
      {/* Ambient Lighting Gradients */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-100/35 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-purple-100/35 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/3 w-[460px] h-[460px] rounded-full bg-blue-100/30 blur-[130px] pointer-events-none"
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold tracking-wider uppercase text-emerald-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                <span>AUTOMATED BILLING</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-black tracking-[-0.035em] text-slate-950 leading-[1.08]">
                Billing that <br />
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  keeps moving.
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-lg">
                Automate recurring invoices, calculate taxes and keep every payment organized
                without the manual work.
              </p>
            </div>

            {/* Three Key Highlights Stacked Vertically */}
            <div ref={highlightsRef} className="space-y-4 pt-2">
              {/* Highlight 1: Automatic Invoice Generation */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Receipt className="w-5 h-5 text-[#8b5cf6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Automatic Invoice Generation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Generate deterministic, sequenced tax invoices automatically on the exact
                    renewal date.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Recurring Billing Schedules */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-5 h-5 text-[#3b82f6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Recurring Billing Schedules
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Seamlessly orchestrate daily, weekly, monthly, and annual subscription cycles
                    with zero failure.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Tax and Discount Management */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Percent className="w-5 h-5 text-[#10b981] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Tax and Discount Management
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Real-time GST and VAT compliance with dynamic discount codes applied right at
                    invoice checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* Right Column: Floating Invoice-Generation Visual             */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[580px]">
            {/* Connecting Curved SVG Splines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
              viewBox="0 0 680 580"
              fill="none"
            >
              <defs>
                <linearGradient id="billingSpline" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.75" />
                </linearGradient>
              </defs>
              <path
                ref={splineRef}
                d="M 140 100 C 190 150, 240 220, 310 240"
                stroke="url(#billingSpline)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* MAIN ELEMENT: Floating Invoice Panel */}
            <div
              ref={invoicePanelRef}
              className="relative w-full max-w-[560px] rounded-[32px] bg-white border border-slate-100/90 shadow-[0_30px_70px_-15px_rgba(20,25,45,0.1),0_15px_35px_-5px_rgba(20,25,45,0.05)] p-6 sm:p-7 z-20 overflow-hidden will-change-transform"
            >
              {/* Glass Sheen */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent pointer-events-none opacity-50"
                aria-hidden="true"
              />

              {/* Transformation Bridge Pill from Slide 4 */}
              <div ref={customerBadgeRef} className="pb-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200/60 text-xs text-purple-900 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>
                    Generating from: <strong>John Smith (Pro Plan)</strong>
                  </span>
                </div>
              </div>

              {/* Invoice Card Top Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Invoice
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                      INV-1042
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                    Pro Plan Subscription
                  </h3>
                </div>

                {/* Status Indicator */}
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Generated
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Oct 31, 2026</div>
                </div>
              </div>

              {/* Customer & Tax Breakdown Table */}
              <div className="py-4 space-y-2.5 text-xs border-b border-slate-100 relative z-10">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Customer</span>
                  <span className="font-bold text-slate-900">John Smith</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Subscription</span>
                  <span className="font-medium text-slate-900">Pro Plan (Monthly)</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Plan Subtotal</span>
                  <span className="font-mono text-slate-900">₹999.00</span>
                </div>

                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <span>Tax Calculation (GST 18%)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-500">
                      Standard
                    </span>
                  </span>
                  <span className="font-mono text-slate-700">+₹179.82</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm font-bold">
                  <span className="text-slate-900">Total Amount</span>
                  <span
                    ref={amountCounterRef}
                    className="font-mono text-base font-extrabold text-slate-950"
                  >
                    ₹1,178.82
                  </span>
                </div>
              </div>

              {/* Invoice Timeline */}
              <div className="pt-4 relative z-10">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Invoice Timeline
                </div>

                <div ref={timelineRef} className="space-y-2.5 text-xs">
                  {/* Step 1: Subscription confirmed */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-medium text-slate-800">Subscription confirmed.</span>
                    <span className="text-[10px] text-slate-400 ml-auto">00:01 AM</span>
                  </div>

                  {/* Step 2: Invoice generated */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-medium text-slate-800">Invoice generated.</span>
                    <span className="text-[10px] text-slate-400 ml-auto font-mono">INV-1042</span>
                  </div>

                  {/* Step 3: Payment received */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-bold text-slate-900">Payment received.</span>
                    <span className="text-[10px] font-semibold text-emerald-600 ml-auto">
                      ₹1,178.82
                    </span>
                  </div>

                  {/* Step 4: Next billing scheduled */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium text-purple-900">Next billing scheduled.</span>
                    <span className="text-[10px] text-purple-600 font-medium ml-auto">
                      Nov 30, 2026
                    </span>
                  </div>
                </div>
              </div>

              {/* Bold Payment Confirmation Stamp */}
              <div
                ref={paidStampRef}
                className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-none z-30 select-none will-change-transform"
              >
                <div className="px-5 py-2 rounded-xl border-3 border-emerald-500 bg-emerald-50/90 text-emerald-600 font-black text-sm tracking-widest uppercase shadow-md flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>PAID • SETTLED</span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 1: Invoice Generated (Top-Left)                 */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif1Ref}
              className="absolute top-2 sm:top-6 -left-2 sm:-left-8 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Invoice Generated
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  INV-1042 for John Smith
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)] ml-auto shrink-0" />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 2: Payment Received (Top-Right)                 */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif2Ref}
              className="absolute -top-4 sm:top-2 -right-2 sm:-right-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Payment Received
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  ₹1,178.82 via Auto-Debit
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] ml-auto shrink-0" />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 3: Next Billing Scheduled (Bottom-Right)        */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif3Ref}
              className="absolute -bottom-4 sm:bottom-4 -right-2 sm:-right-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#3b82f6]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Next Billing Scheduled
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  Nov 30, 2026 • Pro Plan
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.6)] ml-auto shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
