"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Globe, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function FinalCtaFooterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);
  const brandIconRef = useRef<HTMLDivElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([ctaContentRef.current, brandIconRef.current, footerContentRef.current], {
          opacity: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom bottom",
          toggleActions: "play reverse play reverse",
        },
        defaults: { ease: "power3.out" },
      });

      // 1. Floating Brand Logo Element entrance
      tl.fromTo(
        brandIconRef.current,
        { opacity: 0, scale: 0.7, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.8)" }
      );

      // 2. CTA content reveals
      if (ctaContentRef.current) {
        tl.fromTo(
          ctaContentRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
          "-=0.5"
        );
      }

      // 3. Footer content fades in
      tl.fromTo(
        footerContentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.3"
      );

      // Idle float on brand icon
      if (brandIconRef.current) {
        gsap.to(brandIconRef.current, {
          y: -8,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta-footer"
      className="relative w-full bg-[#080b16] text-white overflow-hidden pt-24 sm:pt-32 pb-12"
    >
      {/* Deep Navy Ambient Glowing Orbs */}
      <div
        className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-purple-600/15 blur-[160px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 w-[540px] h-[540px] rounded-full bg-indigo-500/15 blur-[150px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
        {/* ============================================================ */}
        {/* HERO CTA BLOCK: Centered High-Impact Call to Action          */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pb-24 sm:pb-32">
          {/* Minimal Floating FlowGrid Brand Element */}
          <div ref={brandIconRef} className="mb-8 relative select-none will-change-transform">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#131938] via-[#1e2756] to-[#0f1430] border border-white/20 shadow-[0_20px_50px_rgba(99,102,241,0.35)] flex items-center justify-center p-3 relative group">
              {/* Outer soft aura */}
              <div
                className="absolute inset-0 rounded-3xl bg-[#6366f1]/30 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 4.5h16l-4.5 6H3v-6z" />
                <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
              </svg>
            </div>
          </div>

          <div ref={ctaContentRef} className="space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold tracking-wider uppercase text-purple-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>GET STARTED TODAY</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-black tracking-[-0.035em] text-white leading-[1.06]">
              Ready to keep your <br />
              <span className="bg-gradient-to-r from-[#a855f7] via-[#818cf8] to-[#38bdf8] bg-clip-text text-transparent">
                business in flow?
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
              Bring products, subscriptions, customers and recurring billing together with FlowGrid.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 text-sm font-bold hover:bg-slate-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95 group cursor-pointer font-heading"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("products");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Explore FlowGrid</span>
              </button>
            </div>

            {/* Trust Micro-badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* COMPREHENSIVE CLOSING FOOTER                                */}
        {/* ============================================================ */}
        <div ref={footerContentRef} className="border-t border-white/10 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 items-start pb-12">
            {/* Column 1: FlowGrid Logo & Brand Identity */}
            <div className="col-span-2 md:col-span-4 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 4.5h16l-4.5 6H3v-6z" />
                  <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
                </svg>
                <span className="text-xl font-black tracking-tight text-white">FLOWGRID</span>
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-normal">
                Next-generation modular subscription management and automated billing engine. Keep
                every product, customer, invoice, and payment in seamless flow.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">
                  All Systems Operational
                </span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Product
              </span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Product Management
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: window.innerHeight * 1.5, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Subscription Plans
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("customers")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Customer Subscriptions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("billing")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Automated Billing
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Business Analytics
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Solutions
              </span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    SaaS Subscriptions
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Usage & Recurring Cycles
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Tax & GST Compliance
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dunning & Collections
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Executive MRR Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources & Pricing */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Resources
              </span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/portal" className="hover:text-white transition-colors">
                    Customer Portal
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Security Architecture
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Integration Guides
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Auth & Legal */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Account & Legal
              </span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors font-semibold text-white"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition-colors font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <span>© 2026 FlowGrid Inc. All rights reserved. Keep your business in flow.</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
              <div className="flex items-center gap-4 text-slate-400 ml-2">
                <a href="#" className="hover:text-white transition-colors font-semibold">
                  𝕏
                </a>
                <a href="#" className="hover:text-white transition-colors font-semibold">
                  GitHub
                </a>
                <a href="#" className="hover:text-white transition-colors font-semibold">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
