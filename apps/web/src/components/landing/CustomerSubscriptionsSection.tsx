"use client";

import React, { useEffect, useRef } from "react";
import {
  Users,
  Repeat,
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserPlus,
  ShieldCheck,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CustomerSubscriptionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const customerRowsRef = useRef<HTMLDivElement>(null);
  const planTransferPillRef = useRef<HTMLDivElement>(null);
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
            mainCardRef.current,
            customerRowsRef.current?.children,
            notif1Ref.current,
            notif2Ref.current,
            notif3Ref.current,
            planTransferPillRef.current,
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

      // 2. Feature highlights entrance
      if (highlightsRef.current) {
        tl.fromTo(
          highlightsRef.current.children,
          { opacity: 0, x: -25 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12 },
          "-=0.4"
        );
      }

      // 3. Main Customer Subscriptions Panel entrance
      tl.fromTo(
        mainCardRef.current,
        { opacity: 0, y: 50, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" },
        "-=0.6"
      );

      // 4. Plan Transformation Bridge: Selected Pro Plan transforms into John Smith's subscription
      tl.fromTo(
        planTransferPillRef.current,
        { opacity: 0, y: -40, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
        "-=0.5"
      );

      // 5. Customer records appear sequentially
      if (customerRowsRef.current) {
        tl.fromTo(
          customerRowsRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" },
          "-=0.3"
        );
      }

      // 6. Connecting spline draws
      if (splineRef.current) {
        const len = splineRef.current.getTotalLength ? splineRef.current.getTotalLength() : 300;
        gsap.set(splineRef.current, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(splineRef.current, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.4");
      }

      // 7. Floating notifications appear with bounce
      tl.fromTo(
        notif1Ref.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" },
        "-=0.4"
      );

      tl.fromTo(
        notif2Ref.current,
        { opacity: 0, scale: 0.8, x: -20 },
        { opacity: 1, scale: 1, x: 0, duration: 0.55, ease: "back.out(1.5)" },
        "-=0.35"
      );

      tl.fromTo(
        notif3Ref.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" },
        "-=0.3"
      );

      // Subtle ambient bobbing on floating notifications
      [notif1Ref.current, notif2Ref.current, notif3Ref.current].forEach((notif, idx) => {
        if (notif) {
          gsap.to(notif, {
            y: idx % 2 === 0 ? -6 : 6,
            duration: 3.2 + idx * 0.4,
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
      id="customers"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-white overflow-hidden flex items-center justify-center"
    >
      {/* Ambient Lighting Gradients (Matching FlowGrid design language) */}
      <div
        className="absolute top-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-purple-100/40 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[480px] h-[480px] rounded-full bg-blue-100/35 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/3 w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[140px] pointer-events-none"
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200/60 text-[11px] font-bold tracking-wider uppercase text-purple-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                <span>CUSTOMER SUBSCRIPTIONS</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-black tracking-[-0.035em] text-slate-950 leading-[1.08]">
                Every customer. <br />
                Every subscription. <br />
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  In sync.
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-lg">
                Keep track of your customers, manage their subscriptions and stay on top of renewals,
                all from one place.
              </p>
            </div>

            {/* Three Key Highlights Stacked Vertically */}
            <div ref={highlightsRef} className="space-y-4 pt-2">
              {/* Highlight 1: Customer Management */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5 text-[#8b5cf6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Customer Management
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Maintain a unified directory with contact details, plan assignments, and full billing history.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Subscription Tracking */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Repeat className="w-5 h-5 text-[#3b82f6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Subscription Tracking
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Track live lifecycle status, plan upgrades, pauses, and cancellations automatically in real time.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Renewal Management */}
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <CalendarCheck className="w-5 h-5 text-[#10b981] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Renewal Management
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Stay ahead of renewals with automated notifications, upcoming re-billing schedules, and zero churn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* Right Column: Floating Customer-Subscription Interface Visual */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[580px]">
            {/* Connecting Curved SVG Splines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
              viewBox="0 0 680 580"
              fill="none"
            >
              <defs>
                <linearGradient id="custSpline" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path
                ref={splineRef}
                d="M 120 70 C 180 120, 220 180, 290 210"
                stroke="url(#custSpline)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* MAIN ELEMENT: Floating Customer-Subscription Panel */}
            <div
              ref={mainCardRef}
              className="relative w-full max-w-[560px] rounded-[32px] bg-white border border-slate-100/90 shadow-[0_30px_70px_-15px_rgba(20,25,45,0.1),0_15px_35px_-5px_rgba(20,25,45,0.05)] p-6 sm:p-7 z-20 overflow-hidden will-change-transform"
            >
              {/* Glass Sheen */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent pointer-events-none opacity-50"
                aria-hidden="true"
              />

              {/* Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Customer Subscriptions
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    3 Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-600">Live Sync</span>
                </div>
              </div>

              {/* Transformation Bridge Pill (From Slide 3 Pro Plan) */}
              <div ref={planTransferPillRef} className="pt-3 pb-1 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200/60 text-xs text-purple-900 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>Assigned from <strong>Pro Plan (₹999/mo)</strong></span>
                </div>
              </div>

              {/* Customer Records List */}
              <div ref={customerRowsRef} className="space-y-3 pt-3 relative z-10">
                {/* Customer 1: John Smith – Pro Plan – ₹999/month – Active */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50/40 via-white to-white border border-purple-200/70 hover:border-purple-300 transition-all shadow-xs group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        JS
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                          <span>John Smith</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-700 text-[10px] font-bold">
                            Pro Plan
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight mt-1">
                          john.smith@acme.com
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900 font-mono">₹999</div>
                      <div className="text-[10px] text-slate-400 font-normal">/month</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Renews in 14 days (Nov 14, 2026)</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Customer 2: Sarah Wilson – Business Plan – ₹1,999/month – Active */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-2xs group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        SW
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                          <span>Sarah Wilson</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700 text-[10px] font-bold">
                            Business Plan
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight mt-1">
                          sarah.w@nexus.io
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900 font-mono">₹1,999</div>
                      <div className="text-[10px] text-slate-400 font-normal">/month</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Renews in 28 days (Nov 28, 2026)</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Customer 3: Mike Johnson – Basic Plan – ₹499/month – Pending */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-2xs group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        MJ
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                          <span>Mike Johnson</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Basic Plan
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight mt-1">
                          mike.j@startups.co
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900 font-mono">₹499</div>
                      <div className="text-[10px] text-slate-400 font-normal">/month</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-medium">
                      <span>Awaiting gateway authorization</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 1: Subscription Activated (Top-Left)            */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif1Ref}
              className="absolute top-2 sm:top-6 -left-2 sm:-left-8 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[250px] sm:max-w-[270px]"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Subscription Activated
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  John Smith • Pro Plan (₹999)
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)] ml-auto shrink-0" />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 2: New Customer Added (Top-Right)               */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif2Ref}
              className="absolute -top-4 sm:top-2 -right-2 sm:-right-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-[#3b82f6]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  New Customer Added
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  Sarah Wilson joined Business Plan
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.6)] ml-auto shrink-0" />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NOTIFICATION 3: Renewal Upcoming (Bottom-Right)              */}
            {/* ------------------------------------------------------------ */}
            <div
              ref={notif3Ref}
              className="absolute -bottom-4 sm:bottom-4 -right-2 sm:-right-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.07)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4 text-[#10b981]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Renewal Upcoming
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  Auto-charge in 14 days
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
