"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Repeat, ChevronRight, X, Layers } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Subscription, SubscriptionStatus } from "../../types";

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

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions", activeFilter],
    queryFn: () => api.getSubscriptions(activeFilter),
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

  const handleTransition = (target: SubscriptionStatus) => {
    if (!selectedSub) return;
    transitionMutation.mutate({ id: selectedSub.id, target });
  };

  return (
    <div className="space-y-6">
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
                          {sub.plan_details?.billing_frequency} • {sub.payment_terms.replace("_", " ")}
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

      {/* Subscription Detail Slide-over / Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-900">
                    {selectedSub.subscription_number}
                  </span>
                  <Badge variant={selectedSub.status}>{selectedSub.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: {selectedSub.customer_details?.company_name} ({selectedSub.customer_details?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lifecycle State Transitions Action Bar */}
            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                State Machine Transitions
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedSub.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => handleTransition("quotation")}
                    disabled={transitionMutation.isPending}
                  >
                    Convert to Formal Quotation
                  </Button>
                )}
                {selectedSub.status === "quotation" && (
                  <Button
                    size="sm"
                    onClick={() => handleTransition("confirmed")}
                    disabled={transitionMutation.isPending}
                  >
                    Confirm Customer Order
                  </Button>
                )}
                {selectedSub.status === "confirmed" && (
                  <Button
                    size="sm"
                    onClick={() => handleTransition("active")}
                    disabled={transitionMutation.isPending}
                  >
                    Activate Subscription & Billing
                  </Button>
                )}
                {selectedSub.status === "active" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTransition("paused")}
                      disabled={transitionMutation.isPending}
                    >
                      Pause Subscription
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleTransition("closed")}
                      disabled={transitionMutation.isPending}
                    >
                      Terminate / Close
                    </Button>
                  </>
                )}
                {selectedSub.status === "paused" && (
                  <Button
                    size="sm"
                    onClick={() => handleTransition("active")}
                    disabled={transitionMutation.isPending}
                  >
                    Resume Active Billing
                  </Button>
                )}
              </div>
            </div>

            {/* Plan Details & Line Items */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" /> Contracted Line Items
              </h4>
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
                {/* Base Plan */}
                <div className="flex items-center justify-between p-3 bg-slate-50/50">
                  <div>
                    <span className="font-semibold text-slate-900">{selectedSub.plan_details?.name}</span>
                    <span className="text-slate-500 block text-[11px]">Base Subscription Frequency Fee</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(selectedSub.plan_details?.cost)}
                  </span>
                </div>

                {/* Products */}
                {selectedSub.lines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3">
                    <div>
                      <span className="font-medium text-slate-900">{l.product_details?.name}</span>
                      {l.variant_details && (
                        <span className="ml-2 text-indigo-600 font-medium">
                          ({l.variant_details.attribute_value} +{formatCurrency(l.variant_details.price_delta)})
                        </span>
                      )}
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
                  <span className="font-mono text-emerald-600">-{formatCurrency(selectedSub.discount_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total Recurring Charge</span>
                  <span className="font-mono text-indigo-600">{formatCurrency(selectedSub.total_amount)}</span>
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
