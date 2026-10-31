"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Repeat,
  PauseCircle,
  PlayCircle,
  XCircle,
  CalendarCheck,
  CheckCircle,
  Receipt,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DUMMY_SUBSCRIPTIONS } from "../../../lib/dummy-data";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Subscription } from "../../../types";

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DUMMY_SUBSCRIPTIONS);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleStateChange = (id: string, newStatus: "active" | "paused" | "closed") => {
    setSubscriptions(subscriptions.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    setActionMessage(`Subscription updated to ${newStatus}`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#0B1020] tracking-tight">
            My Subscriptions
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage your active subscription services, modify recurring cycles, or request
            cancellation.
          </p>
        </div>

        <Link href="/portal/plans">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Discover More Services</span>
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.map((sub) => {
          const isActive = sub.status === "active";
          const isPaused = sub.status === "paused";
          const isClosed = sub.status === "closed";

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-base text-[#0B1020]">
                        {sub.plan_details?.name || "Enterprise Tier"}
                      </span>
                      <Badge variant={isActive ? "active" : isPaused ? "paused" : "closed"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-[#64748B]">
                      Ref: {sub.subscription_number || sub.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-black text-2xl text-[#0B1020]">
                    {formatCurrency(sub.total_amount)}
                  </span>
                  <span className="text-xs text-[#64748B]">/ billing cycle</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                <div>
                  <span className="text-[#64748B] block">Started Date</span>
                  <span className="font-semibold text-[#0B1020] mt-0.5 block">
                    {formatDate(sub.start_date || sub.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Next Renewal</span>
                  <span className="font-semibold text-[#0B1020] mt-0.5 block">
                    {formatDate(sub.next_billing_date || sub.expiry_date || sub.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Payment Terms</span>
                  <span className="font-semibold text-[#0B1020] mt-0.5 block capitalize">
                    {sub.payment_terms?.replace("_", " ") || "Immediate Auto-debit"}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Provider</span>
                  <span className="font-semibold text-[#7651F5] mt-0.5 block">
                    FlowGrid Cloud Tech
                  </span>
                </div>
              </div>

              {/* State Machine Transition Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <Link
                  href="/portal/invoices"
                  className="text-xs font-semibold text-[#64748B] hover:text-[#0B1020] flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View Billing Receipts</span>
                </Link>

                <div className="flex items-center gap-2">
                  {isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStateChange(sub.id, "paused")}
                      className="text-xs rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50"
                    >
                      <PauseCircle className="w-3.5 h-3.5 mr-1" />
                      Pause Service
                    </Button>
                  )}

                  {isPaused && (
                    <Button
                      size="sm"
                      onClick={() => handleStateChange(sub.id, "active")}
                      className="text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" />
                      Resume Subscription
                    </Button>
                  )}

                  {!isClosed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStateChange(sub.id, "closed")}
                      className="text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Cancel Plan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
