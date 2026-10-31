"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Repeat, ChevronRight, X, Layers, Plus, Sparkles, Building2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Subscription, SubscriptionStatus } from "../../types";
import { DUMMY_CUSTOMERS, DUMMY_PLANS, DUMMY_SUBSCRIPTION_PREFILL } from "../../lib/dummy-data";

const statusFilters: { label: string; value: string }[] = [
  { label: "All Subscriptions", value: "all" },
  { label: "Active", value: "active" },
  { label: "Quotations", value: "quotation" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Drafts", value: "draft" },
  { label: "Paused", value: "paused" },
  { label: "Closed", value: "closed" },
];

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  // Creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState<"immediate" | "15_days" | "30_days">("30_days");
  const [notes, setNotes] = useState("");

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions", activeFilter],
    queryFn: () => api.getSubscriptions(activeFilter),
  });

  const { data: customers = DUMMY_CUSTOMERS } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.getCustomers(),
  });

  const { data: plans = DUMMY_PLANS } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.getPlans(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createSubscription("aac3abe7-18b7-4c5f-a29e-786b63476459", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, target }: { id: string; target: string }) =>
      api.transitionSubscription(id, target),
    onSuccess: (updatedSub) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      setSelectedSub(updatedSub);
    },
  });

  const resetForm = () => {
    setCustomerId("");
    setPlanId("");
    setStartDate(new Date().toISOString().slice(0, 10));
    setPaymentTerms("30_days");
    setNotes("");
  };

  const handlePrefill = () => {
    setCustomerId(DUMMY_SUBSCRIPTION_PREFILL.customer);
    setPlanId(DUMMY_SUBSCRIPTION_PREFILL.plan);
    setStartDate(DUMMY_SUBSCRIPTION_PREFILL.start_date);
    setPaymentTerms(DUMMY_SUBSCRIPTION_PREFILL.payment_terms);
    setNotes(DUMMY_SUBSCRIPTION_PREFILL.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      customer: customerId || customers[0]?.id,
      plan: planId || plans[0]?.id,
      start_date: startDate,
      payment_terms: paymentTerms,
      notes,
    });
  };

  const handleTransition = (target: SubscriptionStatus) => {
    if (!selectedSub) return;
    transitionMutation.mutate({ id: selectedSub.id, target });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage contract lifecycles, quotation agreements, and recurring billing anchors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-3">
        {statusFilters.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeFilter === tab.value
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <Repeat className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              No subscriptions match the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Plan / Cycle</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Next Billing</th>
                    <th className="px-5 py-3.5 text-right">Total Amount</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {sub.subscription_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {sub.customer_details?.company_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.customer_details?.contact_name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{sub.plan_details?.name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {sub.plan_details?.billing_interval} •{" "}
                          {sub.payment_terms?.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={sub.status}>{sub.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(sub.next_billing_date)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(sub.total_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-indigo-600 group-hover:bg-indigo-50"
                        >
                          <span>Manage</span>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Create Subscription */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Create Subscription</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrefill}
                  className="text-xs h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Prefill Dummy Data
                </Button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Subscription Plan *
                  </label>
                  <select
                    required
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select plan...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.base_price)}/{p.billing_interval}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Payment Terms *</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="immediate">Due Upon Receipt</option>
                      <option value="15_days">Net 15 Days</option>
                      <option value="30_days">Net 30 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contract notes, billing special arrangements..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Subscription"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Subscription Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Subscription Reference
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedSub.subscription_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-6">
              {/* Lifecycle Actions */}
              <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Current Contract State:{" "}
                    <Badge variant={selectedSub.status} className="ml-1">
                      {selectedSub.status}
                    </Badge>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Execute authorized lifecycle state transition
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSub.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition("confirmed")}
                      disabled={transitionMutation.isPending}
                    >
                      Confirm Agreement
                    </Button>
                  )}
                  {selectedSub.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition("active")}
                      disabled={transitionMutation.isPending}
                    >
                      Activate Contract
                    </Button>
                  )}
                  {selectedSub.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTransition("paused")}
                      disabled={transitionMutation.isPending}
                    >
                      Pause Billing
                    </Button>
                  )}
                  {selectedSub.status === "paused" && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition("active")}
                      disabled={transitionMutation.isPending}
                    >
                      Resume Service
                    </Button>
                  )}
                  {selectedSub.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleTransition("closed")}
                      disabled={transitionMutation.isPending}
                    >
                      Close / Terminate
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer and Plan Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Customer Account
                  </span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {selectedSub.customer_details?.company_name}
                  </span>
                  <span className="text-slate-500">{selectedSub.customer_details?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Assigned Plan
                  </span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {selectedSub.plan_details?.name}
                  </span>
                  <span className="text-slate-500 capitalize">
                    {selectedSub.plan_details?.billing_interval} interval
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Contract Start Date
                  </span>
                  <span className="font-mono text-slate-800">
                    {formatDate(selectedSub.start_date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Next Automated Billing Run
                  </span>
                  <span className="font-mono font-semibold text-indigo-600">
                    {formatDate(selectedSub.next_billing_date)}
                  </span>
                </div>
              </div>

              {/* Lines items */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Contract Line Items
                </span>
                {selectedSub.lines.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between border-b border-slate-100 py-2.5 text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{l.product_details?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Qty: {l.quantity} × {formatCurrency(l.unit_price)}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(l.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="rounded-lg bg-slate-50 p-4 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(selectedSub.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes Calculated</span>
                  <span className="font-mono">{formatCurrency(selectedSub.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Applied Discounts</span>
                  <span className="font-mono text-emerald-600">
                    -{formatCurrency(selectedSub.discount_amount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total Recurring Charge</span>
                  <span className="font-mono text-indigo-600">
                    {formatCurrency(selectedSub.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedSub(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
