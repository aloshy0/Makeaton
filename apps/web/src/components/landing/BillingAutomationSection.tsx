"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

export function BillingAutomationSection() {
  const cards = [
    {
      title: "One-Touch Digital Wallets",
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Smartphone className="w-5 h-5" />
        </div>
      ),
      description:
        "Seamless customer recurring authorizations via Apple Pay, Google Pay, SEPA Direct Debit and international credit cards.",
      cta: "Explore wallets",
      href: "/catalog",
    },
    {
      title: "Zero-Duplication Engine",
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Zap className="w-5 h-5" />
        </div>
      ),
      description:
        "Deterministic idempotency keys prevent accidental double-charging during batch invoice runs and scheduled webhook events.",
      cta: "Read architecture",
      href: "/dashboard",
    },
    {
      title: "Smart Dunning & Auto-Recovery",
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
      ),
      description:
        "Intelligent retry schedules recover up to 48% of failed card transactions automatically, preserving MRR and customer goodwill.",
      cta: "View dunning rules",
      href: "/invoices",
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 w-full max-w-7xl mx-auto">
      {/* Dark Obsidian Rounded Container (Matching MONELIQ frame_22s.jpg) */}
      <div className="relative rounded-[2.5rem] lg:rounded-[3rem] bg-[#0c0c0e] text-white overflow-hidden border border-white/10 shadow-2xl p-8 sm:p-12 lg:p-16">
        {/* Subtle Cyber Grid and Emerald Aurora Ambient Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Recurring Functions
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Unlocking the power of your <br />
            FlowGrid billing engine
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-normal">
            Discover the functions that make your recurring revenue stream resilient, automated and
            scalable.
          </p>
        </div>

        {/* 3 Elevated Cards in Grid (Matching MONELIQ frame_22s.jpg) */}
        <div className="relative z-10 mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {card.icon}
                <h3 className="text-lg font-bold text-white tracking-tight">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              <div className="pt-8">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-emerald-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
