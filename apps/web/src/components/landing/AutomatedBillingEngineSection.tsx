"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Receipt,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Hash,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AutomatedBillingEngineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const invoiceDocRef = useRef<HTMLDivElement>(null);
  const invoiceNumRef = useRef<HTMLSpanElement>(null);
  const lineItemsRef = useRef<HTMLDivElement>(null);
  const totalAmountRef = useRef<HTMLSpanElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const nextBillingCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 30%",
            toggleActions: "play reverse play reverse",
          },
          defaults: { ease: "power3.out" },
        });

        // 1. Invoice Document container materializes
        tl.fromTo(
          invoiceDocRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9 }
        );

        // 2. Invoice number reveals
        tl.fromTo(
          invoiceNumRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6 },
          "-=0.3"
        );

        // 3. Line items populate sequentially
        if (lineItemsRef.current) {
          const items = lineItemsRef.current.children;
          tl.fromTo(
            items,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
            "-=0.2"
          );
        }

        // 4. Amount calculation counts up
        const totalObj = { val: 0 };
        tl.to(
          totalObj,
          {
            val: 1433.7,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              if (totalAmountRef.current) {
                totalAmountRef.current.innerText =
                  "$" +
                  totalObj.val.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
              }
            },
          },
          "-=0.4"
        );

        // 5. Payment status stamp impacts with scale & rotation
        tl.fromTo(
          stampRef.current,
          { opacity: 0, scale: 2.2, rotation: -18 },
          {
            opacity: 1,
            scale: 1,
            rotation: -4,
            duration: 0.7,
            ease: "back.out(2.5)",
          },
          "-=0.2"
        );

        // 6. Next billing date card slides into place
        tl.fromTo(
          nextBillingCardRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.3"
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section
      ref={containerRef}
      id="automated-billing-engine"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Technical Narrative */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Recurring Batch Engine
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Automated billing that operates without error
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Scheduled Celery beat workers evaluate billing cycles at midnight. Invoices are generated
            with unique deterministic deduplication keys, automatically factoring in attribute price
            deltas, percentage coupons, and local tax requirements.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                #
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Deterministic Deduplication Keys
                </span>
                <span className="text-[11px] text-slate-500">
                  Guarantees no duplicate charges during network reconnects.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                %
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Automated Proration & Taxes
                </span>
                <span className="text-[11px] text-slate-500">
                  Calculates VAT, GST, and mid-cycle plan upgrades instantly.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Real-time Invoice Document */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-lg space-y-4">
            {/* The Realistic Animated Invoice Card */}
            <div
              ref={invoiceDocRef}
              className="relative rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border border-slate-200/90 overflow-hidden"
            >
              {/* Payment Status Stamp (Animated by GSAP) */}
              <div
                ref={stampRef}
                className="absolute top-8 right-8 z-20 px-4 py-1.5 border-2 border-emerald-600 text-emerald-700 bg-emerald-50/90 font-black text-xs uppercase tracking-widest rounded-lg shadow-sm"
              >
                PAID IN FULL ✓
              </div>

              {/* Invoice Header */}
              <div className="border-b border-slate-100 pb-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-xs font-black">
                    FG
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">
                    FLOWGRID INVOICE
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Invoice Number</span>
                    <span ref={invoiceNumRef} className="font-bold text-slate-800 font-mono">
                      INV-2026-1031-4820
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Issue Date</span>
                    <span className="font-medium text-slate-700">Oct 31, 2026</span>
                  </div>
                </div>
              </div>

              {/* Customer Organization Details */}
              <div className="py-4 border-b border-slate-100 text-xs">
                <span className="text-slate-400 text-[10px] block">Billed To</span>
                <span className="font-bold text-slate-900">Apex Cloud Corporation</span>
                <span className="text-slate-500 block text-[11px]">
                  500 Enterprise Way, Suite 400 • billing@apexcloud.io
                </span>
              </div>

              {/* Line Items Populated Sequentially */}
              <div ref={lineItemsRef} className="py-4 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-700 font-medium">
                    Apex SaaS Annual Enterprise (Monthly Installment)
                  </span>
                  <span className="font-bold text-slate-900">$1,200.00</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-700 font-medium">Dedicated 24/7 Support SLA</span>
                  <span className="font-bold text-purple-700">+$150.00</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 text-emerald-800">
                  <span className="font-medium">Annual Growth Discount (10% Off)</span>
                  <span className="font-bold">-$135.00</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500">VAT (18% Regional Compliance)</span>
                  <span className="font-semibold text-slate-700">+$218.70</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Total Amount Settled</span>
                  <span className="text-[10px] text-slate-400">Captured via Primary Credit Card</span>
                </div>
                <span
                  ref={totalAmountRef}
                  className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                >
                  $0.00
                </span>
              </div>
            </div>

            {/* Next Scheduled Billing Card */}
            <div
              ref={nextBillingCardRef}
              className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Next Scheduled Renewal</span>
                  <span className="font-bold text-emerald-400">Nov 30, 2026 at 00:00 UTC</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-semibold text-slate-300">
                Auto-Renew ON
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
