"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, Printer, X, CreditCard } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Invoice } from "../../types";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", filterOverdue],
    queryFn: () => api.getInvoices(filterOverdue),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.confirmInvoice(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      setSelectedInvoice(updated);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelInvoice(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      setSelectedInvoice(updated);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoice: string; amount: string; payment_method: string }) =>
      api.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      setPaymentModalInvoice(null);
      setSelectedInvoice(null);
      setPaymentAmount("");
    },
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || !paymentAmount) return;
    paymentMutation.mutate({
      invoice: paymentModalInvoice.id,
      amount: paymentAmount,
      payment_method: paymentMethod,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated recurring invoices, tax schedules, discounts, and payment reconciliations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterOverdue ? "danger" : "outline"}
            size="sm"
            onClick={() => setFilterOverdue(!filterOverdue)}
          >
            {filterOverdue ? "Showing Overdue Only" : "Filter Overdue Invoices"}
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Loading billing records...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <Receipt className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              No invoices found for the active criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Issue Date</th>
                    <th className="px-5 py-3.5">Due Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Total</th>
                    <th className="px-5 py-3.5 text-right">Balance</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {inv.invoice_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {inv.customer_details?.company_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inv.customer_details?.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(inv.issue_date)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={
                            inv.is_overdue ? "text-rose-600 font-semibold" : "text-slate-600"
                          }
                        >
                          {formatDate(inv.due_date)}
                        </span>
                      </td>
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
                            parseFloat(inv.outstanding_balance) > 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }
                        >
                          {formatCurrency(inv.outstanding_balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {parseFloat(inv.outstanding_balance) > 0 && inv.status !== "draft" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPaymentAmount(inv.outstanding_balance);
                              }}
                              className="h-7 text-xs"
                            >
                              Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedInvoice(inv)}
                            className="h-7 text-xs text-indigo-600"
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Viewer / Printable Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header / Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <span className="font-mono text-lg font-bold text-slate-900">
                  {selectedInvoice.invoice_number}
                </span>
                <Badge variant={selectedInvoice.is_overdue ? "overdue" : selectedInvoice.status}>
                  {selectedInvoice.is_overdue ? "Overdue" : selectedInvoice.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>Print</span>
                </Button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Transition Actions */}
            {selectedInvoice.status === "draft" && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50/50 border border-blue-200/60 flex items-center justify-between">
                <span className="text-xs text-blue-900 font-medium">
                  This invoice is currently in Draft state. Confirm it to send to customer and
                  request payment.
                </span>
                <Button
                  size="sm"
                  onClick={() => confirmMutation.mutate(selectedInvoice.id)}
                  disabled={confirmMutation.isPending}
                >
                  Confirm Invoice
                </Button>
              </div>
            )}

            {/* Printable Invoice Body */}
            <div className="mt-6 space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
                    Billed To
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedInvoice.customer_details?.company_name}
                  </div>
                  <div className="text-slate-500">
                    {selectedInvoice.customer_details?.contact_name}
                  </div>
                  <div className="text-slate-500">
                    {selectedInvoice.customer_details?.billing_address}
                  </div>
                  {selectedInvoice.customer_details?.tax_id && (
                    <div className="text-slate-500 mt-1">
                      Tax ID: {selectedInvoice.customer_details?.tax_id}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
                    Payment Dates
                  </span>
                  <div className="text-slate-700 mt-0.5">
                    Issue Date:{" "}
                    <span className="font-semibold">{formatDate(selectedInvoice.issue_date)}</span>
                  </div>
                  <div className="text-slate-700">
                    Due Date:{" "}
                    <span className="font-semibold text-rose-600">
                      {formatDate(selectedInvoice.due_date)}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    Paid Amount:{" "}
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(selectedInvoice.paid_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Tax</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{l.description}</td>
                        <td className="px-4 py-2.5 text-center font-mono">{l.quantity}</td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {formatCurrency(l.unit_price)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {formatCurrency(l.tax_amount)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(l.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-mono text-emerald-600">
                      -{formatCurrency(selectedInvoice.discount_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-sm">
                    <span>Total Amount:</span>
                    <span className="font-mono text-indigo-600">
                      {formatCurrency(selectedInvoice.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Outstanding Balance:</span>
                    <span className="font-mono">
                      {formatCurrency(selectedInvoice.outstanding_balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              {selectedInvoice.status !== "paid" && selectedInvoice.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => cancelMutation.mutate(selectedInvoice.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel Invoice
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {parseFloat(selectedInvoice.outstanding_balance) > 0 &&
                  selectedInvoice.status !== "draft" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPaymentModalInvoice(selectedInvoice);
                        setPaymentAmount(selectedInvoice.outstanding_balance);
                      }}
                    >
                      Record Payment
                    </Button>
                  )}
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Record Payment</h3>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Invoice</label>
                <div className="font-mono text-sm font-semibold text-slate-900 mt-1">
                  {paymentModalInvoice.invoice_number} (
                  {paymentModalInvoice.customer_details?.company_name})
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Due:{" "}
                  <span className="font-semibold text-rose-600">
                    {formatCurrency(paymentModalInvoice.outstanding_balance)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Amount Received ($)
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

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="bank_transfer">Bank Transfer (ACH / Wire)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="online">Online Payment</option>
                  <option value="check">Company Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentModalInvoice(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={paymentMutation.isPending}>
                  {paymentMutation.isPending ? "Recording..." : "Confirm & Settle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
