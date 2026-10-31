"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  Repeat,
  Receipt,
  Users,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function HeroSection({ mode, setMode }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  // Slice-style story tabs carousel state
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const stories = [
    {
      tab: "Recurring Engine",
      title: "Instant automated recurring billing",
      desc: "Scheduled batch cycles execute without manual intervention. Zero double-charging with deterministic keys.",
      tag: "Batch Autopilot",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      previewType: "recurring",
      mrr: "$24,850.00",
      growth: "+18.4%",
    },
    {
      tab: "Smart Dunning",
      title: "Zero-loss automated payment recovery",
      desc: "Recover up to 48% of failed customer renewals with intelligent card retries, SEPA fallbacks and instant email triggers.",
      tag: "Dunning AI",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      previewType: "dunning",
      mrr: "$14,320.00",
      growth: "48% Recovered",
    },
    {
      tab: "Executive MRR",
      title: "Real-time revenue velocity & telemetry",
      desc: "Direct database-layer SQL aggregations guarantee sub-2-second insights into cash flow, ARR, and subscriber churn.",
      tag: "Live Telemetry",
      badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      previewType: "mrr",
      mrr: "$148,250.00",
      growth: "+34.2% YoY",
    },
  ];

  // Auto-advance story timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % stories.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [stories.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hero headline entrance
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 35, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power4.out" }
      );

      // Subtitle
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );

      // CTA Buttons
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.35, ease: "power3.out" }
      );

      // 3D Deck Entrance: cards slide up in depth
      gsap.fromTo(
        deckRef.current,
        { opacity: 0, y: 90, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.3, delay: 0.3, ease: "expo.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToWorkflow = () => {
    const target = document.getElementById("workflow-storytelling");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeStory = stories[activeStoryIndex];

  return (
    <section className="px-3 sm:px-6 lg:px-8 pt-2 pb-12 w-full max-w-7xl mx-auto">
      {/* Slice-Style 100vh Immersive Hero Canvas with 3D Perspective */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden isolate"
        style={{ perspective: "1400px" }}
      >
        {/* Top Hero Typography: Slice.bank.in inspired Massive Bricolage Headline */}
        <div className="pt-6 sm:pt-10 max-w-4xl mx-auto text-center space-y-5 z-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-medium">FlowGrid 2.0 •</span>
            <span>Next-Gen Subscription Platform</span>
          </div>

          <h1
            ref={headlineRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-2px] text-slate-950 leading-[1.04]"
          >
            Keep your business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600">
              in flow.
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Manage subscriptions, automate recurring billing and keep every payment on track. All from
            one unified platform.
          </p>

          <div
            ref={ctaRef}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-black text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Open FlowGrid account
            </Link>
            <button
              onClick={scrollToWorkflow}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm transition-all shadow-xs"
            >
              Explore interactive story ↓
            </button>
          </div>
        </div>

        {/* Slice Bank Signature 3D Layered Card Deck (Bottom Stack) */}
        <div
          ref={deckRef}
          className="relative w-full max-w-6xl mx-auto mt-10 min-h-[460px] sm:min-h-[500px] flex items-end justify-center"
        >
          {/* Card 1 (Back, smallest, width 86%, highest translateY) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-t-[2.5rem] bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-white/10 shadow-2xl transition-all duration-500 pointer-events-none"
            style={{
              width: "86%",
              height: "440px",
              bottom: "40px",
              zIndex: 1,
              opacity: 0.7,
            }}
          />

          {/* Card 2 (Middle, width 91%, medium translateY) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-t-[2.75rem] bg-gradient-to-r from-[#12131a] to-[#161722] border border-white/15 shadow-2xl transition-all duration-500 pointer-events-none"
            style={{
              width: "91%",
              height: "460px",
              bottom: "20px",
              zIndex: 2,
              opacity: 0.9,
            }}
          />

          {/* Card 3 (Front Active Card, width 96% - 100%, highest z-index) */}
          <div
            className="relative w-full rounded-t-[2.5rem] sm:rounded-t-[3.25rem] bg-[#0c0c0e] text-white p-6 sm:p-10 lg:p-12 border-t border-x border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between"
            style={{
              zIndex: 3,
              minHeight: "480px",
            }}
          >
            {/* Cyber Grid & Ambient Glowing Lights */}
            <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />

            {/* Inner Content Grid */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
              {/* Left Side: Slice.bank.in Floating Glassmorphic Story Capsule */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  className="rounded-3xl border border-white/20 bg-white/[0.08] backdrop-blur-[20px] p-6 sm:p-8 space-y-4 transition-all duration-500"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${activeStory.badgeColor}`}
                    >
                      {activeStory.tag}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Story 0{activeStoryIndex + 1} / 03
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {activeStory.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {activeStory.desc}
                  </p>
                </div>
              </div>

              {/* Right Side: Dynamic Interactive Preview Widget */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-white/[0.05] border border-white/15 p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {mode === "business" ? "Active Revenue Stream" : "Personal Subscriptions"}
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {activeStory.mrr}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {activeStory.growth}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      FG
                    </div>
                  </div>

                  {/* Dynamic Micro-Card Preview */}
                  {activeStory.previewType === "recurring" && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-white block">Acme SaaS Tier</span>
                          <span className="text-[10px] text-slate-400">Scheduled: 1st of month</span>
                        </div>
                        <span className="text-emerald-400 font-bold">$1,200.00</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-white block">Gym Pro Annual</span>
                          <span className="text-[10px] text-slate-400">Auto-Renewed</span>
                        </div>
                        <span className="text-emerald-400 font-bold">$480.00</span>
                      </div>
                    </div>
                  )}

                  {activeStory.previewType === "dunning" && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-purple-200 block">Smart Card Retry #2</span>
                          <span className="text-[10px] text-purple-300">Recovered via Visa Backup</span>
                        </div>
                        <span className="text-emerald-400 font-bold">+$850.00</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Zero Subscriber Churn</span>
                        <span className="text-emerald-400 font-semibold">Active</span>
                      </div>
                    </div>
                  )}

                  {activeStory.previewType === "mrr" && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-indigo-200 block">SQL Aggregation</span>
                          <span className="text-[10px] text-indigo-300">PostgreSQL 16 Cluster</span>
                        </div>
                        <span className="text-emerald-400 font-bold">0.12s SLA</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">ARR Run-Rate</span>
                        <span className="text-white font-bold">$1.78M</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Slice.bank.in Carousel Tabs & Progress Bar Indicators */}
            <div className="relative z-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* 3 Story Tabs with Active Progress Bars */}
              <div className="flex w-full sm:max-w-xl gap-4 sm:gap-6">
                {stories.map((s, idx) => {
                  const isActive = activeStoryIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStoryIndex(idx)}
                      className="flex-1 flex flex-col gap-2 text-left transition-colors focus:outline-none"
                    >
                      <span
                        className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                          isActive ? "text-white" : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {s.tab}
                      </span>
                      {/* Animated Progress Bar Line */}
                      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                            isActive
                              ? "bg-white w-full animate-[progress_4.5s_linear]"
                              : "bg-transparent w-0"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mode Toggle Switch Pill (Personal | Business) */}
              <div className="flex rounded-full bg-white/10 p-1 border border-white/15 text-xs font-semibold backdrop-blur-md">
                <button
                  onClick={() => setMode("personal")}
                  className={`px-3.5 py-1 rounded-full transition-all ${
                    mode === "personal"
                      ? "bg-white text-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setMode("business")}
                  className={`px-3.5 py-1 rounded-full transition-all ${
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
        </div>
      </div>
    </section>
  );
}
