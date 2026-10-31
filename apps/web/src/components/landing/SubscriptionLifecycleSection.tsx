"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Repeat,
  Receipt,
  Users,
  ShieldCheck,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const chartData = [
  { time: "5:24 PM", value: 12400 },
  { time: "8:33 PM", value: 18200 },
  { time: "1:42 AM", value: 15600 },
  { time: "5:52 AM", value: 24800 },
  { time: "10:01 AM", value: 22100 },
  { time: "2:10 PM", value: 31400 },
  { time: "6:15 PM", value: 38950 },
];

const lifecycleSteps = [
  {
    id: "analytics",
    title: "Financial Analytics & MRR Tracking",
    subtitle: "Real-time revenue monitoring and churn mitigation metrics.",
    kpi: "$38,950.00",
    badge: "+24.8% growth",
  },
  {
    id: "lifecycle",
    title: "Subscription Lifecycle Management",
    subtitle: "Automate Draft → Quotation → Active → Paused → Renewed states.",
    kpi: "1,420 Active Plans",
    badge: "99.2% Retention",
  },
  {
    id: "billing",
    title: "Idempotent Recurring Billing",
    subtitle: "Deterministic batch runs ensure zero duplicate charges.",
    kpi: "100% On-Time Invoices",
    badge: "Deterministic",
  },
  {
    id: "customers",
    title: "Customer Organization Accounts",
    subtitle: "Manage billing contacts, tax exemption certificates and seats.",
    kpi: "348 Enterprise Orgs",
    badge: "Multi-tenant",
  },
  {
    id: "payments",
    title: "Payment Reconciliation Engine",
    subtitle: "Atomic ledger balance calculations with multi-channel capture.",
    kpi: "$1.4M Settled Volume",
    badge: "Zero Discrepancy",
  },
  {
    id: "taxes",
    title: "Tax Rules & Volume Discounts",
    subtitle: "Configure regional tax compliance and percentage coupon limits.",
    kpi: "Automatic Compliance",
    badge: "Global Rules",
  },
];

export function SubscriptionLifecycleSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="lifecycle" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Vertical Navigation List (Matching MONELIQ frame_16s.jpg) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Platform Capabilities
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Comprehensive subscription solutions for every business need
          </h2>

          <p className="text-sm text-slate-500 pb-4">
            FlowGrid delivers an enterprise-grade digital backbone for recurring revenue operations.
          </p>

          {/* Interactive Navigation Steps */}
          <div className="space-y-2 border-l-2 border-slate-200 pl-4">
            {lifecycleSteps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`group cursor-pointer py-2.5 transition-all ${
                    isActive ? "translate-x-1" : "hover:translate-x-0.5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full transition-all ${
                        isActive ? "bg-black scale-125" : "bg-slate-300 group-hover:bg-slate-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isActive
                          ? "text-slate-950 font-bold"
                          : "text-slate-500 group-hover:text-slate-800"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {isActive && (
                    <p className="text-xs text-slate-500 pl-4 mt-1 leading-relaxed animate-in fade-in duration-200">
                      {step.subtitle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Large Interactive Showcase Card (Matching MONELIQ frame_16s.jpg) */}
        <div className="lg:col-span-7">
          <div className="rounded-[2.5rem] bg-[#ededf0] p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            {/* Top Stats Banner */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  {lifecycleSteps[activeStep].title}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {lifecycleSteps[activeStep].kpi}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {lifecycleSteps[activeStep].badge}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>Live Telemetry</span>
              </div>
            </div>

            {/* Real-time Green Glowing Area Chart (Matching MONELIQ frame_16s.jpg) */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs font-bold text-slate-800">Recurring Revenue Velocity</span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Sub-second aggregation</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val: number) => [`$${val.toLocaleString()}`, "MRR Volume"]}
                      contentStyle={{
                        borderRadius: "12px",
                        backgroundColor: "#18181b",
                        color: "#fff",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Timestamp range: Today 24h</span>
                <span className="font-semibold text-slate-800">
                  Deterministic Key: RECUR-BATCH-2026-10-31
                </span>
              </div>
            </div>

            {/* Bottom Caption matching reference */}
            <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900">
                Tailored financial solutions for modern commerce:
              </span>{" "}
              Whether managing monthly $15 add-ons for boutique retail or $50k annual enterprise
              contracts, FlowGrid guarantees real-time financial accuracy and automated tax
              handling.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
