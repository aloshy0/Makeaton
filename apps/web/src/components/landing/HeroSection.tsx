"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Package,
  Repeat,
  FileText,
  Users,
  BarChart3,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function HeroSection({ mode, setMode }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Left content stagger entrance
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          }
        );
      }

      // Stats row entrance
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          }
        );
      }

      // 3D Dashboard Mockup entrance with perspective tilt
      if (mockupRef.current) {
        gsap.fromTo(
          mockupRef.current,
          {
            opacity: 0,
            y: 60,
            rotateY: -18,
            rotateX: 10,
            scale: 0.92,
          },
          {
            opacity: 1,
            y: 0,
            rotateY: -11,
            rotateX: 5,
            scale: 1,
            duration: 1.3,
            delay: 0.2,
            ease: "expo.out",
          }
        );

        // Subtle floating breathing effect on mouse move or idle
        gsap.to(mockupRef.current, {
          y: -8,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white pt-6 pb-20 lg:pt-10 lg:pb-28">
      <div
        ref={containerRef}
        className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Badge, Typography, CTAs, and Stats Row            */}
          {/* ============================================================== */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col items-start z-10 space-y-6 lg:space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <span className="text-xs font-semibold text-slate-800 tracking-tight">FlowGrid 2.0</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-600">Next-Gen Subscription Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] font-black tracking-[-0.035em] text-slate-950 leading-[1.06]">
              Keep your business <br />
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                in flow.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-lg">
              Manage subscriptions, automate recurring billing and keep every
              payment on track. All from one unified platform.
            </p>

            {/* CTAs Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95 group"
              >
                <span>Open FlowGrid account</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const demoSection = document.getElementById("workflow-storytelling");
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-sm font-semibold transition-all shadow-xs active:scale-95 group"
              >
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Play className="w-2.5 h-2.5 fill-slate-800 text-slate-800 ml-0.5" />
                </div>
                <span>Watch demo</span>
              </button>
            </div>

            {/* Stats Metric Row */}
            <div
              ref={statsRef}
              className="w-full pt-8 lg:pt-10 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  10K+
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Businesses
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  2M+
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Subscriptions
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  99.9%
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Uptime
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  4.8/5
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Customer rating
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: 3D Angled Glowing Dark Dashboard Mockup           */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-end">
            {/* Ambient Aurora Glows */}
            {/* Bottom-Left Cyan Glow */}
            <div
              className="absolute -bottom-8 -left-12 sm:bottom-0 sm:left-4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#06b6d4] opacity-35 blur-[90px] pointer-events-none"
              aria-hidden="true"
            />
            {/* Top-Right Violet / Purple Glow */}
            <div
              className="absolute -top-10 right-0 sm:top-2 sm:right-6 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#8b5cf6] opacity-30 blur-[100px] pointer-events-none"
              aria-hidden="true"
            />

            {/* 3D Perspective Wrapper */}
            <div
              className="w-full max-w-[700px] xl:max-w-[760px] relative"
              style={{ perspective: "1300px" }}
            >
              <div
                ref={mockupRef}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "rotateY(-11deg) rotateX(5deg)",
                }}
                className="w-full bg-[#0d1117] text-slate-100 rounded-[28px] p-5 sm:p-6 border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-500 ease-out hover:rotate-y-[-6deg] hover:rotate-x-[2deg]"
              >
                {/* -------------------------------------------------------- */}
                {/* TOP BAR: Search & User Profile                           */}
                {/* -------------------------------------------------------- */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-3">
                  {/* Left: Brand Mini Logo inside Dashboard */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                      FG
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white">
                      FlowGrid
                    </span>
                  </div>

                  {/* Center: Search Bar with Keyboard Shortcut */}
                  <div className="hidden sm:flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-slate-400 w-56 lg:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span className="flex-1 text-[11px]">Search anything...</span>
                    <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                      ⌘ K
                    </span>
                  </div>

                  {/* Right: Notifications & User Account */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Notifications"
                      className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    </button>

                    <div className="flex items-center gap-2 pl-1 border-l border-white/10">
                      <div className="w-8 h-8 rounded-full bg-white text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs">
                        AA
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-xs font-semibold text-white leading-tight">
                          Alosh Antony
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 leading-tight">
                          <span>Business Account</span>
                          <ChevronDown className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* BODY: Sidebar + Main Widgets Layout                      */}
                {/* -------------------------------------------------------- */}
                <div className="grid grid-cols-12 gap-4 pt-4">
                  {/* Left Mini Sidebar */}
                  <div className="col-span-3 hidden sm:flex flex-col space-y-1 pr-2 border-r border-white/5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold shadow-xs">
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer">
                      <Package className="w-3.5 h-3.5" />
                      <span>Products</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Subscriptions</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoices</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer">
                      <Users className="w-3.5 h-3.5" />
                      <span>Customers</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </div>
                  </div>

                  {/* Right Dashboard Area (Cards & Tables) */}
                  <div className="col-span-12 sm:col-span-9 space-y-4">
                    {/* Top Row: 3 Financial Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Metric 1: Monthly Revenue */}
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Monthly Revenue
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg font-bold text-white tracking-tight">
                              $24,850.00
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded">
                              +18.4%
                            </span>
                          </div>
                        </div>

                        {/* Emerald Glowing Bar Chart */}
                        <div className="mt-3 flex items-end justify-between gap-1 h-12 pt-1">
                          {[25, 40, 32, 52, 68, 45, 78, 92, 80, 100].map((height, i) => (
                            <div
                              key={i}
                              className="w-1.5 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Metric 2: Active Subscriptions */}
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Active Subscriptions
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg font-bold text-white tracking-tight">
                              1,248
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded">
                              +12%
                            </span>
                          </div>
                        </div>

                        {/* Purple Glowing Bar Chart */}
                        <div className="mt-3 flex items-end justify-between gap-1 h-12 pt-1">
                          {[20, 35, 48, 42, 60, 75, 65, 88, 72, 95].map((height, i) => (
                            <div
                              key={i}
                              className="w-1.5 rounded-t bg-gradient-to-t from-purple-600 to-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.3)]"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Metric 3: Revenue Split Donut */}
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-medium">
                            Revenue Split
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                            Monthly <ChevronDown className="w-2.5 h-2.5" />
                          </span>
                        </div>

                        {/* Donut Chart with Center Percentage */}
                        <div className="flex items-center justify-center my-1">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                              {/* Background Circle */}
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="3.5"
                              />
                              {/* Purple Segment (Recurring: 68%) */}
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="3.5"
                                strokeDasharray="59.8 100"
                                strokeDashoffset="0"
                                strokeLinecap="round"
                              />
                              {/* Cyan Segment (Add-ons: 32%) */}
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="3.5"
                                strokeDasharray="28.1 100"
                                strokeDashoffset="-59.8"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[11px] font-bold text-white">
                              96.4%
                            </span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                            <span>Recurring</span>
                            <span className="font-semibold text-white ml-0.5">68%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                            <span>Add-ons</span>
                            <span className="font-semibold text-white ml-0.5">32%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: 2 Data Tables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Table 1: Recent Subscriptions */}
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            Recent Subscriptions
                          </span>
                          <Link
                            href="/dashboard"
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
                          >
                            View all <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>

                        <div className="space-y-1.5">
                          {/* Row 1 */}
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 text-[9px] font-bold flex items-center justify-center">
                                JS
                              </div>
                              <span className="font-medium text-white">John Smith</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Pro Plan</span>
                            <span className="font-semibold text-white">$49.00</span>
                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>

                          {/* Row 2 */}
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-pink-500/30 text-pink-300 text-[9px] font-bold flex items-center justify-center">
                                SW
                              </div>
                              <span className="font-medium text-white">Sarah Wilson</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Business Plan</span>
                            <span className="font-semibold text-white">$129.00</span>
                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>

                          {/* Row 3 */}
                          <div className="flex items-center justify-between text-[11px] py-1">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 text-[9px] font-bold flex items-center justify-center">
                                MJ
                              </div>
                              <span className="font-medium text-white">Mike Johnson</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Starter Plan</span>
                            <span className="font-semibold text-white">$19.00</span>
                            <span className="text-[9px] font-semibold text-slate-300 bg-slate-700/50 px-1.5 py-0.5 rounded-full">
                              Trial
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Table 2: Upcoming Invoices */}
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            Upcoming Invoices
                          </span>
                          <Link
                            href="/dashboard"
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
                          >
                            View all <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>

                        <div className="space-y-1.5">
                          {/* Row 1 */}
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                            <span className="font-mono text-slate-300">#INV-1042</span>
                            <span className="font-semibold text-white">$49.00</span>
                            <span className="text-[10px] text-slate-400">Nov 1, 2026</span>
                          </div>

                          {/* Row 2 */}
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                            <span className="font-mono text-slate-300">#INV-1043</span>
                            <span className="font-semibold text-white">$129.00</span>
                            <span className="text-[10px] text-slate-400">Nov 5, 2026</span>
                          </div>

                          {/* Row 3 */}
                          <div className="flex items-center justify-between text-[11px] py-1">
                            <span className="font-mono text-slate-300">#INV-1044</span>
                            <span className="font-semibold text-white">$19.00</span>
                            <span className="text-[10px] text-slate-400">Nov 8, 2026</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
