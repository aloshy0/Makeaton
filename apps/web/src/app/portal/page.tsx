"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  Repeat,
  Receipt,
  CheckCircle,
  CreditCard,
  X,
  Plus,
  Sparkles,
  Printer,
  Layers,
  ArrowRight,
  CalendarCheck,
  Building2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { Invoice, SubscriptionPlan, Subscription } from "../../types";
import { DUMMY_PLANS, DUMMY_SUBSCRIPTIONS, DUMMY_INVOICES } from "../../lib/dummy-data";
import { useAccount } from "../../context/account-context";

export default function CustomerPortalPage() {
  const queryClient = useQueryClient();
  const { user, personalCustomer } = useAccount();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: subscriptions = DUMMY_SUBSCRIPTIONS.slice(0, 3) } = useQuery({
    queryKey: ["subscriptions", "customerPortal"],
    queryFn: () => api.getPortalSubscriptions(),
  });

  const { data: invoices = DUMMY_INVOICES.slice(0, 4) } = useQuery({
    queryKey: ["invoices", "customerPortal"],
    queryFn: () => api.getPortalInvoices(),
  });

  const { data: availablePlans = DUMMY_PLANS } = useQuery({
    queryKey: ["portal", "availablePlans"],
    queryFn: () => api.getPublishedPlans(),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment("aac3abe7-18b7-4c5f-a29e-786b63476459", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedInvoice(null);
      }, 2000);
    },
  });

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;
    paymentMutation.mutate({
      invoice: selectedInvoice.id,
      amount: paymentAmount,
      payment_method: "online",
    });
  };

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const overdueInvoices = invoices.filter((i) => i.is_overdue);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Customer Header Banner */}
      <div className="rounded-2xl border border-[#E8ECF3] bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-base shadow-xs">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Personal Account
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-[#64748B]">
                  {user?.email || "alexander@flowgrid.com"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0B1020] tracking-tight mt-0.5">
                Welcome back, {user ? `${user.first_name}` : "Subscriber"}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Manage your subscribed software tiers, track automated billing cycles, and settle
                receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/portal/plans">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold px-4 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Browse Published Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF3] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#64748B]">Active Subscriptions</div>
            <div className="text-2xl font-heading font-extrabold text-[#0B1020] mt-1">
              {activeSubs.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Continuous auto-renewal
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF3] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#64748B]">Next Scheduled Renewal</div>
            <div className="text-2xl font-heading font-extrabold text-[#0B1020] mt-1">Nov 15</div>
            <div className="text-[11px] text-[#64748B] font-medium mt-0.5">FlowGrid Pro Tier</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF3] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#64748B]">Outstanding Invoices</div>
            <div className="text-2xl font-heading font-extrabold text-[#0B1020] mt-1">
              {overdueInvoices.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              All accounts in good standing
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#4387F7] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Subscriptions & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Subscriptions Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-[#0B1020]">My Subscriptions</h2>
            <Link
              href="/portal/subscriptions"
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white p-5 rounded-2xl border border-[#E8ECF3] shadow-2xs hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#0B1020]">
                      {sub.subscription_number || sub.id.slice(0, 8)}
                    </span>
                    <Badge variant={sub.status === "active" ? "active" : "paused"}>
                      {sub.status}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#0B1020]">
                    {sub.plan_details?.name || "Enterprise Tier"}
                  </h3>
                  <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                    <span className="font-bold text-[#0B1020] font-mono">
                      {formatCurrency(sub.total_amount)}
                    </span>
                    <span>
                      • Renews:{" "}
                      {formatDate(sub.next_billing_date || sub.expiry_date || sub.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/portal/subscriptions">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-xl border-[#E8ECF3]"
                    >
                      Manage Subscription
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-[#0B1020]">Recent Invoices</h2>
            <Link
              href="/portal/invoices"
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>All Invoices</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8ECF3] divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-[#0B1020] font-mono">
                    {inv.invoice_number || inv.id.slice(0, 8)}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {formatDate(inv.created_at || inv.due_date)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#0B1020] font-mono">
                    {formatCurrency(inv.total_amount)}
                  </div>
                  <div className="mt-1">
                    <Badge variant={inv.status === "paid" ? "active" : "warning"}>
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
