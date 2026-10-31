"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Database, Repeat, ShieldCheck, ArrowRight } from "lucide-react";

export function FeaturesGridSection() {
  const features = [
    {
      title: "Simplicity",
      desc: "Intuitive interface for business owners and subscribers. Effortless navigation ensures seamless onboarding.",
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Cloud Ledger",
      desc: "Secure relational storage. Our platform offers cutting-edge PostgreSQL consistency and sub-second reporting.",
      icon: <Database className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Recurring Billing",
      desc: "Scheduled, deterministic batch runs for seamless subscription lifecycle management. Zero missed cycles.",
      icon: <Repeat className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Security",
      desc: "High protection and confidentiality standards ensure your subscription records and payments remain secure.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Content (Matching MONELIQ frame_34s.jpg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Core Architecture
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Discover the advantages of FlowGrid
          </h2>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Low latency, robust data isolation, automated billing runs, and peace of mind for every
            recurring transaction.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Right 2x2 Feature Cards Grid (Matching MONELIQ frame_34s.jpg) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#ededf0] border border-slate-200/80 hover:bg-[#e8e8ec] transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
