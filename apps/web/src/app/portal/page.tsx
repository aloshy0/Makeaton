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
} from "lucide-react";
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
import { Invoice, SubscriptionPlan } from "../../types";
import { DUMMY_PLANS } from "../../lib/dummy-data";

export default function CustomerPortalPage() {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Browse plans modal state
  const [isBrowsePlansOpen, setIsBrowsePlansOpen] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState<string | null>(null);

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["subscriptions", "customerPortal"],
    queryFn: () => api.getPortalSubscriptions(),
  });

  const { data: invoices = [], isLoading: invsLoading } = useQuery({
    queryKey: ["invoices", "customerPortal"],
    queryFn: () => api.getPortalInvoices(),
  });

  const { data: availablePlans = DUMMY_PLANS } = useQuery({
    queryKey: ["portal", "availablePlans"],
    queryFn: () => api.getPublishedPlans(),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, target }: { id: string; target: string }) =>
      api.transitionSubscription(id, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      api.createSubscription("aac3abe7-18b7-4c5f-a29e-786b63476459", {
        customer: "cust-001",
        plan: plan.id,
        start_date: new Date().toISOString().slice(0, 10),
        payment_terms: "immediate",
        notes: `Self-service subscription from Customer Portal: ${plan.name}`,
      }),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setSubscribeSuccess(`Successfully subscribed to plan! Reference: ${sub.subscription_number}`);
      setTimeout(() => {
        setSubscribeSuccess(null);
        setIsBrowsePlansOpen(false);
      }, 2000);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Customer Header Banner */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-indigo-300">
                Customer Self-Service Portal
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Acme Global Technologies
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage your active subscription services, browse new product lines, and settle
                recurring invoices online.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => setIsBrowsePlansOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Subscribe to New Plan
            </Button>
            <div className="text-right sm:border-l sm:border-slate-700 sm:pl-4">
              <div className="text-[11px] text-slate-400">Account Status</div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                <CheckCircle className="h-3.5 w-3.5" /> Good Standing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Subscriptions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-indigo-600" /> Your Active Subscriptions
            </h2>
            <p className="text-xs text-slate-500">
              Self-manage your contract terms without opening support tickets
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBrowsePlansOpen(true)}
            className="text-xs"
          >
            Browse Plans
          </Button>
        </div>

        {subsLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading your plans...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 rounded-xl border border-dashed border-slate-200">
            No active subscriptions on your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {sub.subscription_number}
                    </span>
                    <Badge variant={sub.status}>{sub.status}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-1">{sub.plan_details?.name}</CardTitle>
                  <CardDescription>
                    Started: {formatDate(sub.start_date)} • Next Renewal:{" "}
                    {formatDate(sub.next_billing_date)}
                  </CardDescription>
                  <div className="mt-3 font-mono text-2xl font-bold text-slate-900">
                    {formatCurrency(sub.total_amount)}
                    <span className="text-xs text-slate-400 font-sans font-normal ml-1">
                      /{sub.plan_details?.billing_interval}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 border-t border-slate-100 text-xs">
                  <div className="space-y-1 mb-4 text-slate-600">
                    {sub.lines?.map((l) => (
                      <div key={l.id} className="flex justify-between">
                        <span>
                          {l.product_details?.name} (Qty {l.quantity})
                        </span>
                        <span className="font-mono">{formatCurrency(l.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Self-Serve Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {sub.status === "active" && sub.plan_details?.allow_pause && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => transitionMutation.mutate({ id: sub.id, target: "paused" })}
                        disabled={transitionMutation.isPending}
                        className="text-xs"
                      >
                        Pause Plan
                      </Button>
                    )}
                    {sub.status === "paused" && (
                      <Button
                        size="sm"
                        onClick={() => transitionMutation.mutate({ id: sub.id, target: "active" })}
                        disabled={transitionMutation.isPending}
                        className="text-xs"
                      >
                        Resume Plan
                      </Button>
                    )}
                    {sub.status === "active" && sub.plan_details?.allow_early_close && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => transitionMutation.mutate({ id: sub.id, target: "closed" })}
                        disabled={transitionMutation.isPending}
                        className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 ml-auto"
                      >
                        Cancel Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Customer Invoices */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-600" /> Billing History & Invoices
            </h2>
            <p className="text-xs text-slate-500">
              Download PDF receipts and pay open invoices online
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print Ledger
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {invsLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No invoices issued yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Invoice #</th>
                      <th className="px-5 py-3">Issue Date</th>
                      <th className="px-5 py-3">Due Date</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Total</th>
                      <th className="px-5 py-3 text-right">Balance</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {inv.invoice_number}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{formatDate(inv.issue_date)}</td>
                        <td className="px-5 py-3.5 text-slate-600">{formatDate(inv.due_date)}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={inv.is_overdue ? "overdue" : inv.status}>
                            {inv.is_overdue ? "Overdue" : inv.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-900">
                          {formatCurrency(inv.total_amount)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold">
                          <span
                            className={
                              Number(inv.outstanding_balance) > 0
                                ? "text-rose-600"
                                : "text-emerald-600"
                            }
                          >
                            {formatCurrency(inv.outstanding_balance)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {Number(inv.outstanding_balance) > 0 && inv.status !== "draft" ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentAmount(inv.outstanding_balance);
                              }}
                              className="h-7 text-xs"
                            >
                              Pay Now
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-xs">Paid in full</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Browse and Subscribe to Available Plans */}
      {isBrowsePlansOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  Available Subscription Plans
                </h3>
              </div>
              <button
                onClick={() => setIsBrowsePlansOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {subscribeSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">{subscribeSuccess}</h4>
                  <p className="text-xs text-slate-500">
                    Your portal dashboard is updating with your new subscription.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">
                    Select a plan to start immediately. Invoices will automatically be issued per
                    the contract interval.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availablePlans.map((plan) => (
                      <Card
                        key={plan.id}
                        className="flex flex-col justify-between hover:border-indigo-300 transition-all"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="confirmed">{plan.billing_interval}</Badge>
                            <span className="font-mono text-[10px] text-slate-400">
                              {plan.code}
                            </span>
                          </div>
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                            {formatCurrency(plan.base_price)}
                            <span className="text-xs font-normal text-slate-500 font-sans ml-1">
                              /{plan.billing_interval}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3 border-t border-slate-100 text-xs space-y-3">
                          <div className="space-y-1.5 text-slate-600 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Includes up to {plan.min_seats || 1} seat(s)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span>{plan.allow_pause ? "Pause anytime" : "Non-pauseable"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Auto-renew enabled</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className="w-full text-xs"
                            disabled={subscribeMutation.isPending}
                            onClick={() => subscribeMutation.mutate(plan)}
                          >
                            <span>Subscribe Now</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Online Pay Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Pay Invoice Online</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <div className="text-sm font-semibold text-slate-900">
                  Payment Processed Successfully!
                </div>
                <div className="text-xs text-slate-500">Your account balance has been updated.</div>
              </div>
            ) : (
              <form onSubmit={handlePay} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Invoice Number
                  </label>
                  <div className="font-mono text-sm font-semibold text-slate-900 mt-0.5">
                    {selectedInvoice.invoice_number}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Outstanding Balance
                  </label>
                  <div className="font-mono text-xl font-bold text-rose-600 mt-0.5">
                    {formatCurrency(selectedInvoice.outstanding_balance)}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? "Processing..." : "Authorize Payment"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
