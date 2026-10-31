"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  ArrowUp,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LegalTab = "privacy" | "terms" | "cookies" | "security";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function FinalCtaFooterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);
  const brandIconRef = useRef<HTMLDivElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null);

  // Legal modal state
  const [activeLegalTab, setActiveLegalTab] = useState<LegalTab | null>(null);

  // Smooth scroll helper respecting Lenis or native
  const smoothScrollTo = useCallback((targetId: string) => {
    if (typeof window === "undefined") return;
    const element = document.getElementById(targetId);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(element || `#${targetId}`, {
        offset: -40,
        duration: 1.2,
      });
    } else if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Close legal modal with ESC key
  useEffect(() => {
    if (!activeLegalTab) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLegalTab(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLegalTab]);

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
                onClick={() => smoothScrollTo("products")}
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
        <footer ref={footerContentRef} className="border-t border-white/10 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10 items-start pb-12">
            {/* Column 1: FlowGrid Brand Identity */}
            <div className="col-span-2 md:col-span-4 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 4.5h16l-4.5 6H3v-6z" />
                  <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
                </svg>
                <span className="text-xl font-black tracking-tight text-white font-heading">
                  FLOWGRID
                </span>
              </Link>

              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-normal">
                Next-generation modular subscription management and automated billing engine. Keep
                every product, customer, invoice, and payment in seamless flow.
              </p>

              {/* Link to the API health response; this does not imply a live status check. */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`${API_ORIGIN}/api/v1/health/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors w-fit group"
                  title="Open the API health endpoint"
                >
                  <span>API health</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            {/* Column 2: In-Page Platform Sections */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Platform
              </span>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("products")}
                    className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none focus-visible:underline"
                  >
                    Product Management
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("plans")}
                    className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none focus-visible:underline"
                  >
                    Subscription Plans
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("customers")}
                    className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none focus-visible:underline"
                  >
                    Customer Subscriptions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("billing")}
                    className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none focus-visible:underline"
                  >
                    Automated Billing
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("analytics")}
                    className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none focus-visible:underline"
                  >
                    Business Analytics
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Business Operations (Functional App Routes) */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Commerce
              </span>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link href="/subscriptions" className="hover:text-white transition-colors">
                    Subscriptions
                  </Link>
                </li>
                <li>
                  <Link href="/invoices" className="hover:text-white transition-colors">
                    Invoices
                  </Link>
                </li>
                <li>
                  <Link href="/payments" className="hover:text-white transition-colors">
                    Payments
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-white transition-colors">
                    Products & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/quotations" className="hover:text-white transition-colors">
                    Quotations
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources & Developers */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Resources
              </span>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("plans")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Pricing Matrix
                  </button>
                </li>
                <li>
                  <Link
                    href="/portal"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    Customer Portal
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-white transition-colors">
                    Webhooks & API Keys
                  </Link>
                </li>
                <li>
                  <Link href="/audit-logs" className="hover:text-white transition-colors">
                    Audit Trail & Logs
                  </Link>
                </li>
                <li>
                  <a
                    href={`${API_ORIGIN}/api/docs/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>OpenAPI / Swagger</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Support and Account */}
            <div className="col-span-2 sm:col-span-1 md:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Account
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Sign in to manage your workspace, subscriptions and billing.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-950 font-bold hover:bg-slate-100 transition-colors"
                >
                  Sign up
                </Link>
              </div>
              <a
                href="mailto:support@brightloop.com"
                className="inline-flex text-xs text-slate-400 hover:text-white transition-colors"
              >
                Contact support
              </a>
            </div>
          </div>

          {/* Copyright & Interactive Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
              <span>© {new Date().getFullYear()} Brightloop Software. All rights reserved.</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400">Keep your business in flow.</span>
            </div>

            {/* Legal Policy Triggers (Opens dedicated interactive dialog) */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => setActiveLegalTab("privacy")}
                aria-haspopup="dialog"
                className="hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:underline"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalTab("terms")}
                aria-haspopup="dialog"
                className="hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:underline"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalTab("cookies")}
                aria-haspopup="dialog"
                className="hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:underline"
              >
                Cookies
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalTab("security")}
                aria-haspopup="dialog"
                className="hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:underline"
              >
                Security
              </button>

              {/* Project repository */}
              <div className="flex items-center gap-3 text-slate-400 pl-2 border-l border-white/10">
                <a
                  href="https://github.com/aloshy0/Makeaton"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-1"
                  aria-label="View FlowGrid GitHub repository"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>
              </div>

              {/* Back to Top Smooth Trigger */}
              <button
                type="button"
                onClick={scrollToTop}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
                title="Scroll back to top"
                aria-label="Scroll back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE LEGAL POLICIES MODAL DIALOG                     */}
      {/* ============================================================ */}
      {activeLegalTab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(event) => {
            if (event.target === event.currentTarget) setActiveLegalTab(null);
          }}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0d1124] border border-white/15 shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-legal-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="footer-legal-dialog-title"
                    className="text-base font-bold tracking-tight text-white font-heading"
                  >
                    FlowGrid Policies & Security
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Brightloop Software • Policy information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveLegalTab(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-white/2 shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveLegalTab("privacy")}
                aria-pressed={activeLegalTab === "privacy"}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeLegalTab === "privacy"
                    ? "border-purple-400 text-white bg-white/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalTab("terms")}
                aria-pressed={activeLegalTab === "terms"}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeLegalTab === "terms"
                    ? "border-purple-400 text-white bg-white/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalTab("cookies")}
                aria-pressed={activeLegalTab === "cookies"}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeLegalTab === "cookies"
                    ? "border-purple-400 text-white bg-white/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Cookies
              </button>
              <button
                type="button"
                onClick={() => setActiveLegalTab("security")}
                aria-pressed={activeLegalTab === "security"}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeLegalTab === "security"
                    ? "border-purple-400 text-white bg-white/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Security
              </button>
            </div>

            {/* Modal Body with Policy Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300 leading-relaxed font-normal">
              {activeLegalTab === "privacy" && (
                <div className="space-y-4">
                  <p>
                    A privacy policy has not been published in this project yet. Contact support for
                    information about how account and workspace data is handled.
                  </p>
                </div>
              )}

              {activeLegalTab === "terms" && (
                <div className="space-y-4">
                  <p>
                    Terms of service have not been published in this project yet. Contact support
                    for current service and subscription terms.
                  </p>
                </div>
              )}

              {activeLegalTab === "cookies" && (
                <div className="space-y-4">
                  <p>
                    Cookie information has not been published in this project yet. Contact support
                    with questions about browser storage and session behavior.
                  </p>
                </div>
              )}

              {activeLegalTab === "security" && (
                <div className="space-y-4">
                  <p>
                    The project includes a security guide, but it does not provide a public security
                    statement or compliance certification. Contact support for security questions.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
              <span className="text-[11px] text-slate-400">
                Questions? Contact{" "}
                <a href="mailto:support@brightloop.com" className="text-purple-300 hover:underline">
                  support@brightloop.com
                </a>
              </span>
              <button
                type="button"
                onClick={() => setActiveLegalTab(null)}
                className="px-5 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
