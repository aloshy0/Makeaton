"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Menu, X, Globe, Sparkles } from "lucide-react";

interface NavbarProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function Navbar({ mode, setMode }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left Navigation with Dropdowns */}
        <div className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-slate-700">
          {/* Dropdown 1: Personal */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("personal")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 hover:text-black transition-colors py-2">
              <span>Personal</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeDropdown === "personal" && (
              <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Discover FlowGrid Personal
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Solo-entrepreneur and creator recurring billing.
                  </p>
                </div>
                <div className="mt-2 space-y-1">
                  <Link
                    href="#pricing"
                    className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                  >
                    Simple Price List
                  </Link>
                  <Link
                    href="/portal"
                    className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                  >
                    Customer Self-Service Portal
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown 2: Business */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("business")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 hover:text-black transition-colors py-2 font-semibold text-black">
              <span>Business</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeDropdown === "business" && (
              <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      FlowGrid for High-Growth Teams
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    SaaS, coaching platforms, gyms, and service firms.
                  </p>
                </div>
                <div className="mt-2 space-y-1">
                  <Link
                    href="#lifecycle"
                    className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                  >
                    Automated Recurring Billing Engine
                  </Link>
                  <Link
                    href="#analytics"
                    className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                  >
                    Real-time MRR & ARR Analytics
                  </Link>
                  <Link
                    href="#features"
                    className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                  >
                    Enterprise Dunning & Idempotency
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown 3: Company */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("company")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 hover:text-black transition-colors py-2">
              <span>Company</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeDropdown === "company" && (
              <div className="absolute top-full left-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Link
                  href="#reliability"
                  className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                >
                  Security & Compliance
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-xs text-slate-600 hover:text-black rounded-lg hover:bg-slate-50"
                >
                  Architecture & APIs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Center Brand Logo (MONELIQ inspired: FLOWGRID) */}
        <div className="flex items-center justify-center">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-xl lg:text-2xl font-black tracking-tight text-black transition-transform group-hover:scale-[1.02]">
              FLOWGRID
            </span>
          </Link>
        </div>

        {/* Right Navigation & CTAs */}
        <div className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-700">
          <Link href="#features" className="hover:text-black transition-colors">
            Help
          </Link>
          <Link href="#pricing" className="hover:text-black transition-colors">
            Pricing
          </Link>

          <div className="flex items-center gap-1 text-slate-500 hover:text-black cursor-pointer text-xs transition-colors">
            <span>EN</span>
            <ChevronDown className="w-3 h-3" />
          </div>

          <Link
            href="/dashboard"
            className="text-slate-800 hover:text-black font-semibold transition-colors px-2"
          >
            Log in
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-800"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex rounded-full bg-slate-100 p-1 w-full max-w-xs mx-auto text-xs font-semibold text-center">
            <button
              onClick={() => setMode("personal")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                mode === "personal" ? "bg-white text-black shadow-sm" : "text-slate-600"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setMode("business")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                mode === "business" ? "bg-black text-white shadow-sm" : "text-slate-600"
              }`}
            >
              Business
            </button>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Link
              href="#lifecycle"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800"
            >
              Subscription Lifecycle
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800"
            >
              Automated Billing
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800"
            >
              Pricing Plans
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800"
            >
              Platform Dashboard
            </Link>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="w-full text-center py-2.5 rounded-full bg-black text-white text-xs font-semibold"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
