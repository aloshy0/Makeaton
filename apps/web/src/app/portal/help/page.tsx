"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  FileQuestion,
  CreditCard,
  Layers,
  ChevronRight,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const FAQS = [
  {
    q: "How do I cancel or pause my subscription?",
    a: "Navigate to 'My Subscriptions' in the sidebar or click 'Manage' on any subscription card on your dashboard. From there you can pause the renewal or cancel your subscription at the end of the billing period.",
  },
  {
    q: "How do I update my payment method?",
    a: "Go to 'Payment Methods' from the sidebar. You can add a new credit/debit card, set a default card, or remove old cards.",
  },
  {
    q: "Where can I find and download my invoices?",
    a: "In 'Payments & Invoices' or in the 'Recent Payments' table on your dashboard, click the 'View' button next to any transaction to open and download the PDF invoice.",
  },
  {
    q: "How do coupon codes and discounts work?",
    a: "Check the 'Offers & Discounts' section for exclusive active discounts. Click 'Apply' to instantly attach the promo code to your upcoming subscription renewals.",
  },
];

export default function PortalHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center py-6 px-4 rounded-3xl bg-gradient-to-b from-purple-50/60 to-white border border-[#E8ECF3]">
        <div className="w-12 h-12 rounded-2xl bg-purple-100/60 text-[#7651F5] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1020]">Help & Support Center</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Find answers to frequently asked questions or contact our support team.
        </p>

        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, billing, subscriptions..."
            className="pl-10 h-11 rounded-full border-[#E8ECF3] bg-white text-xs shadow-xs focus:ring-[#7651F5]"
          />
        </div>
      </div>

      {/* Quick Topic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[#E8ECF3] bg-white hover:border-[#7651F5]/40 transition-all cursor-pointer group shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-[#0B1020] mb-1">Subscriptions</h3>
          <p className="text-xs text-slate-500">
            Managing renewals, plan switches, and cancellations.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8ECF3] bg-white hover:border-[#7651F5]/40 transition-all cursor-pointer group shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4387F7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-[#0B1020] mb-1">Billing & Invoices</h3>
          <p className="text-xs text-slate-500">
            Payment methods, receipts, charges, and tax info.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8ECF3] bg-white hover:border-[#7651F5]/40 transition-all cursor-pointer group shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-[#0B1020] mb-1">Contact Support</h3>
          <p className="text-xs text-slate-500">Reach our dedicated support team 24/7 via email.</p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0B1020]">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-[#E8ECF3] bg-white shadow-2xs">
              <h4 className="font-semibold text-sm text-[#0B1020] mb-2">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <p className="text-xs text-slate-500 py-6 text-center">No matching questions found.</p>
          )}
        </div>
      </div>

      {/* Support Contact Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#0B1020]">Need personalized assistance?</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Our customer experience team is ready to help you with any subscription or billing
            inquiry.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#7651F5] to-[#4387F7] text-white text-xs px-5 h-9 rounded-xl shrink-0">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
