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
        {/* Left: Brand Logo & Main Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-2.5">
            <svg
              className="w-5 h-5 text-black transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 4.5h16l-4.5 6H3v-6z" />
              <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
            </svg>
            <span className="text-lg font-black tracking-tight text-black">FLOWGRID</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-700">
            <Link href="#products" className="hover:text-black transition-colors">
              Products
            </Link>

            <Link href="#plans" className="hover:text-black transition-colors">
              Plans
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("solutions")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-black transition-colors py-2 cursor-pointer">
                <span>Workflow</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {activeDropdown === "solutions" && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <Link
                    href="#customers"
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900">
                      Customer Subscriptions
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Directory & renewal management.
                    </div>
                  </Link>
                  <Link
                    href="#billing"
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900">Automated Billing</div>
                    <div className="text-[11px] text-slate-500">
                      Recurring invoices & GST tax calc.
                    </div>
                  </Link>
                  <Link
                    href="#analytics"
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900">Business Analytics</div>
                    <div className="text-[11px] text-slate-500">Live MRR telemetry & charts.</div>
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("resources")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-black transition-colors py-2">
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/dashboard"
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900">API Documentation</div>
                    <div className="text-[11px] text-slate-500">RESTful specs & webhooks.</div>
                  </Link>
                  <Link
                    href="/portal"
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-900">Customer Portal</div>
                    <div className="text-[11px] text-slate-500">
                      Self-service billing for customers.
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Navigation & CTAs */}
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium">
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
