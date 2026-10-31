"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Clock,
  Tag,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Percent,
  Star,
  Gift,
  Download,
  Calendar,
  CreditCard,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { api } from "../../lib/api";
import { Subscription, Invoice } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { formatDate } from "../../lib/utils";

// Service brand SVGs
const NotionIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
    N
  </div>
);

const FigmaIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 shadow-xs">
    <svg width="15" height="15" viewBox="0 0 38 57" fill="none">
      <path
        d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
        fill="#0ACF83"
      />
      <path
        d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
        fill="#FF7262"
      />
      <path
        d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
        fill="#F24E1E"
      />
      <path
        d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
        fill="#A259FF"
      />
    </svg>
  </div>
);

const GitHubIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#24292E] text-white flex items-center justify-center shrink-0 shadow-xs">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  </div>
);

// Animated 4-Color Pinwheel matching FlowGrid visual system
const FlowGridPinwheel = () => (
  <div
    className="inline-flex w-5 h-5 ml-1.5 align-middle animate-spin"
    style={{ animationDuration: "16s" }}
  >
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path
        d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z"
        fill="url(#pinwheel-grad)"
      />
      <defs>
        <linearGradient
          id="pinwheel-grad"
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7651F5" />
          <stop offset="0.5" stopColor="#4387F7" />
          <stop offset="1" stopColor="#00D2B4" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Fallback Subscriptions matching reference image if backend is fresh
const REFERENCE_SUBSCRIPTIONS = [
  {
    id: "sub-notion",
    service: "Notion",
    plan: "Pro",
    price: "₹899",
    billing_interval: "mo",
    next_renewal: "Nov 15, 2026",
    days_left: 12,
    status: "Active",
    icon: NotionIcon,
  },
  {
    id: "sub-figma",
    service: "Figma",
    plan: "Professional",
    price: "₹1,200",
    billing_interval: "mo",
    next_renewal: "Dec 03, 2026",
    days_left: 30,
    status: "Active",
    icon: FigmaIcon,
  },
  {
    id: "sub-github",
    service: "GitHub",
    plan: "Team",
    price: "₹400",
    billing_interval: "mo",
    next_renewal: "Dec 20, 2026",
    days_left: 47,
    status: "Active",
    icon: GitHubIcon,
  },
];

// Fallback Offers matching reference image
const REFERENCE_OFFERS = [
  {
    id: "offer-1",
    name: "20% Off on Annual Plans",
    description: "Save 20% on selected tools",
    valid_until: "Valid till Oct 31, 2026",
    code: "ANNUAL20",
    type: "percentage",
    icon: Percent,
    iconBg: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    id: "offer-2",
    name: "Buy 2 Get 1 Free",
    description: "On productivity tools",
    valid_until: "Valid till Nov 15, 2026",
    code: "B2G1PROD",
    type: "bundle",
    icon: Star,
    iconBg: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    id: "offer-3",
    name: "₹500 Cashback",
    description: "On first annual subscription",
    valid_until: "Valid till Nov 30, 2026",
    code: "CASHBACK500",
    type: "fixed",
    icon: Gift,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
];

// Fallback Payments matching reference image
const REFERENCE_PAYMENTS = [
  {
    id: "pay-1",
    date: "Oct 03, 2026",
    description: "Notion Pro (Monthly)",
    amount: "₹899",
    status: "Paid",
    invoice_number: "INV-2026-0041",
  },
  {
    id: "pay-2",
    date: "Sep 20, 2026",
    description: "Figma Professional",
    amount: "₹1,200",
    status: "Paid",
    invoice_number: "INV-2026-0038",
  },
  {
    id: "pay-3",
    date: "Aug 20, 2026",
    description: "GitHub Team",
    amount: "₹400",
    status: "Paid",
    invoice_number: "INV-2026-0029",
  },
];

export default function NormalUserDashboard() {
  const { user } = useAccount();

  // State
  const [subscriptions, setSubscriptions] = useState(REFERENCE_SUBSCRIPTIONS);
  const [offers] = useState(REFERENCE_OFFERS);
  const [payments] = useState(REFERENCE_PAYMENTS);
  const [loading, setLoading] = useState(true);

  // Modals & User Feedback
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [apiSubs, apiInvoices] = await Promise.all([
          api.getPortalSubscriptions().catch(() => []),
          api.getPortalInvoices().catch(() => []),
        ]);

        if (apiSubs && apiSubs.length > 0) {
          const mapped = apiSubs.slice(0, 3).map((s: Subscription, index) => {
            const icons = [NotionIcon, FigmaIcon, GitHubIcon];
            const daysLeft = s.next_billing_date
              ? Math.max(
                  0,
                  Math.ceil(
                    (new Date(s.next_billing_date).getTime() - Date.now()) / (1000 * 3600 * 24)
                  )
                )
              : 14;
            return {
              id: s.id,
              service: s.plan_details?.name || REFERENCE_SUBSCRIPTIONS[index % 3].service,
              plan: s.plan_details?.code || REFERENCE_SUBSCRIPTIONS[index % 3].plan,
              price: `₹${Number(s.total_amount || 899).toFixed(0)}`,
              billing_interval: "mo",
              next_renewal: s.next_billing_date ? formatDate(s.next_billing_date) : "Nov 15, 2026",
              days_left: daysLeft,
              status: s.status === "active" ? "Active" : s.status,
              icon: icons[index % icons.length],
            };
          });
          setSubscriptions(mapped);
        }
      } catch (err) {
        console.error("Failed to load portal data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyOffer = (offer: (typeof REFERENCE_OFFERS)[0]) => {
    setAppliedOffer(offer.code);
    setToastMessage(
      `Coupon "${offer.code}" applied! You'll receive discount on your next renewal.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePauseSubscription = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subId ? { ...s, status: s.status === "Paused" ? "Active" : "Paused" } : s
      )
    );
    setSelectedSub(null);
    setToastMessage("Subscription status updated successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelSubscription = (subId: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
    setSelectedSub(null);
    setToastMessage("Subscription cancelled per request.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const firstName = user?.first_name || "Aloshy";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Welcome Heading matching reference image */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-[#0B1020] flex items-center">
          <span>Welcome back, {firstName}.</span>
          <FlowGridPinwheel />
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
          Here&apos;s an overview of your subscriptions and recent activity.
        </p>
      </div>

      {/* 4 Summary Cards (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscriptions */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
              <span>↑</span>
              <span>0%</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1020]">
              {subscriptions.filter((s) => s.status === "Active").length}
            </div>
            <div className="text-xs font-semibold text-[#64748B] mt-0.5">Active Subscriptions</div>
          </div>
        </div>

        {/* Card 2: Expiring Soon */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ! 7 days
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1020]">1</div>
            <div className="text-xs font-semibold text-[#64748B] mt-0.5">Expiring Soon</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Renew before it expires</p>
          </div>
        </div>

        {/* Card 3: Available Offers */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Tag className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              New
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1020]">4</div>
            <div className="text-xs font-semibold text-[#64748B] mt-0.5">Available Offers</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Save on your next plan</p>
          </div>
        </div>

        {/* Card 4: Total Monthly Cost */}
        <div className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5">
              <span>↑</span>
              <span>12%</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1020]">
              ₹2,499
            </div>
            <div className="text-xs font-semibold text-[#64748B] mt-0.5">Total Monthly Cost</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all subscriptions</p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Your Subscriptions (Left) & Latest Offers (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Your Subscriptions Table (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[#0B1020]">Your Subscriptions</h2>
            <Link
              href="/portal/subscriptions"
              className="text-xs font-semibold text-[#7651F5] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECF3] text-slate-400 font-semibold">
                  <th className="pb-3 px-2">Service</th>
                  <th className="pb-3 px-2">Plan</th>
                  <th className="pb-3 px-2">Price</th>
                  <th className="pb-3 px-2">Next Renewal</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3]/70">
                {subscriptions.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <Icon />
                          <span className="font-bold text-[#0B1020]">{sub.service}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-[#64748B] font-medium">{sub.plan}</td>
                      <td className="py-3.5 px-2 font-mono font-semibold text-[#0B1020]">
                        {sub.price}/{sub.billing_interval}
                      </td>
                      <td className="py-3.5 px-2 text-[#64748B]">{sub.next_renewal}</td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            sub.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="px-3 py-1 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-[#7651F5] font-semibold text-xs transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Offers Cards (Col span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[#0B1020]">Latest Offers</h2>
            <Link
              href="/portal/plans"
              className="text-xs font-semibold text-[#7651F5] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {offers.map((offer) => {
              const Icon = offer.icon;
              const isApplied = appliedOffer === offer.code;

              return (
                <div
                  key={offer.id}
                  className="p-3.5 rounded-2xl border border-[#E8ECF3] bg-slate-50/40 hover:bg-white hover:border-purple-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${offer.iconBg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-[#0B1020] truncate">{offer.name}</h3>
                      <p className="text-[11px] text-[#64748B] truncate">{offer.description}</p>
                      <span className="text-[10px] font-medium text-blue-600 block mt-0.5">
                        {offer.valid_until}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyOffer(offer)}
                    disabled={isApplied}
                    className={`px-4 py-1.5 rounded-xl font-semibold text-xs transition-all shrink-0 shadow-xs ${
                      isApplied
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-[#7651F5] hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isApplied ? "Applied ✓" : "Apply"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Payments (Left) & Upcoming Renewals (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Payments Table (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[#0B1020]">Recent Payments</h2>
            <Link
              href="/portal/invoices"
              className="text-xs font-semibold text-[#7651F5] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECF3] text-slate-400 font-semibold">
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Description</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3]/70">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-2 text-[#64748B]">{pay.date}</td>
                    <td className="py-3.5 px-2 font-medium text-[#0B1020]">{pay.description}</td>
                    <td className="py-3.5 px-2 font-mono font-bold text-[#0B1020]">{pay.amount}</td>
                    <td className="py-3.5 px-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => setSelectedInvoice(pay)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7651F5] hover:underline"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Renewals List (Col span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[#0B1020]">Upcoming Renewals</h2>
            <Link
              href="/portal/subscriptions"
              className="text-xs font-semibold text-[#7651F5] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub, idx) => {
              const Icon = sub.icon;
              const badgeColors = [
                "bg-amber-50 text-amber-700 border-amber-200",
                "bg-blue-50 text-blue-700 border-blue-200",
                "bg-indigo-50 text-indigo-700 border-indigo-200",
              ];

              return (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl border border-[#E8ECF3] bg-slate-50/40 hover:bg-white hover:border-purple-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <Icon />
                    <div>
                      <h3 className="font-bold text-xs text-[#0B1020]">
                        {sub.service} {sub.plan}
                      </h3>
                      <p className="text-[11px] text-[#64748B]">
                        {sub.price}/{sub.billing_interval} • {sub.next_renewal}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      badgeColors[idx % badgeColors.length]
                    }`}
                  >
                    {sub.days_left} days left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subscription Management Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] shadow-2xl p-6 w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8ECF3]">
              <div className="flex items-center gap-3">
                {selectedSub.icon && <selectedSub.icon />}
                <div>
                  <h3 className="font-bold font-heading text-base text-[#0B1020]">
                    Manage {selectedSub.service}
                  </h3>
                  <p className="text-xs text-[#64748B]">{selectedSub.plan} Plan Subscription</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Recurring Price:</span>
                <span className="font-bold text-[#0B1020] font-mono">
                  {selectedSub.price}/month
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Next Renewal Date:</span>
                <span className="font-medium text-[#0B1020]">{selectedSub.next_renewal}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedSub.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Payment Method:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Visa ending in 4242</span>
                </span>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
              <Button
                onClick={() => handlePauseSubscription(selectedSub.id)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-[#E8ECF3] rounded-xl font-semibold h-auto py-2.5 flex items-center justify-center gap-1.5"
              >
                {selectedSub.status === "Paused" ? (
                  <Play className="w-3.5 h-3.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
                <span>
                  {selectedSub.status === "Paused" ? "Resume Subscription" : "Pause Subscription"}
                </span>
              </Button>

              <Button
                onClick={() => {
                  setToastMessage(`Renewed ${selectedSub.service} successfully!`);
                  setSelectedSub(null);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-[#7651F5] hover:bg-purple-700 text-white rounded-xl font-semibold h-auto py-2.5 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Renew Now</span>
              </Button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => handleCancelSubscription(selectedSub.id)}
                className="text-rose-600 hover:text-rose-700 font-semibold text-xs hover:underline"
              >
                Request Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8ECF3]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Official Receipt
                </span>
                <h3 className="font-bold font-heading text-base text-[#0B1020] font-mono">
                  {selectedInvoice.invoice_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Service:</span>
                <span className="font-bold text-[#0B1020]">{selectedInvoice.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Date Paid:</span>
                <span className="text-[#0B1020]">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Amount Paid:</span>
                <span className="font-mono font-bold text-base text-[#0B1020]">
                  {selectedInvoice.amount}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Payment Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                onClick={() => setSelectedInvoice(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-xl h-auto"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  alert(`Downloading official PDF for ${selectedInvoice.invoice_number}`);
                }}
                className="bg-[#7651F5] hover:bg-purple-700 text-white text-xs font-semibold py-2 px-4 rounded-xl h-auto flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
