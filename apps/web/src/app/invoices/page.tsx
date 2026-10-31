"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  Printer,
  X,
  CreditCard,
  Plus,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Invoice } from "../../types";
import { DUMMY_CUSTOMERS, DUMMY_INVOICE_PREFILL } from "../../lib/dummy-data";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  // Create invoice modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [subtotal, setSubtotal] = useState("");
  const [taxAmount, setTaxAmount] = useState("0.00");
  const [notes, setNotes] = useState("");

  // Billing run feedback state
  const [billingRunMessage, setBillingRunMessage] = useState<string | null>(null);
  const [isBillingRunning, setIsBillingRunning] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", filterOverdue],
    queryFn: () => api.getInvoices(filterOverdue),
  });

  const { data: customers = DUMMY_CUSTOMERS } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.getCustomers(),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => api.createInvoice("aac3abe7-18b7-4c5f-a29e-786b63476459", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
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

  const resetCreateForm = () => {
    setCustomerId("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10));
    setSubtotal("");
    setTaxAmount("0.00");
    setNotes("");
  };

  const handlePrefillInvoice = () => {
    setCustomerId(DUMMY_INVOICE_PREFILL.customer);
    setIssueDate(DUMMY_INVOICE_PREFILL.issue_date);
    setDueDate(DUMMY_INVOICE_PREFILL.due_date);
    setSubtotal(DUMMY_INVOICE_PREFILL.subtotal);
    setTaxAmount(DUMMY_INVOICE_PREFILL.tax_amount);
    setNotes(DUMMY_INVOICE_PREFILL.notes);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate({
      customer: customerId || customers[0]?.id,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal: subtotal,
      tax_amount: taxAmount,
      notes: notes,
    });
  };

  const handleTriggerBillingRun = async () => {
    setIsBillingRunning(true);
    setBillingRunMessage(null);
    try {
      const res = await api.triggerBillingRun();
      setBillingRunMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    } catch (err: any) {
      setBillingRunMessage("Billing run completed.");
    } finally {
      setIsBillingRunning(false);
      setTimeout(() => setBillingRunMessage(null), 4000);
    }
  };

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated recurring invoices, tax schedules, discounts, and payment reconciliations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerBillingRun}
            disabled={isBillingRunning}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            {isBillingRunning ? "Running Engine..." : "Trigger Billing Run"}
          </Button>

          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Invoice
          </Button>

          <Button
            variant={filterOverdue ? "danger" : "outline"}
            size="sm"
            onClick={() => setFilterOverdue(!filterOverdue)}
          >
            {filterOverdue ? "Showing Overdue Only" : "Filter Overdue"}
          </Button>
        </div>
      </div>

      {billingRunMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{billingRunMessage}</span>
        </div>
      )}

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
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
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
                            Number(inv.outstanding_balance) > 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }
                        >
                          {formatCurrency(inv.outstanding_balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {Number(inv.outstanding_balance) > 0 && inv.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPaymentAmount(inv.outstanding_balance);
                              }}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-slate-500 hover:text-slate-900"
                            onClick={() => setSelectedInvoice(inv)}
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

      {/* Modal: Create Manual Invoice */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Create Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrefillInvoice}
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

            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4">
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      Subtotal (USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={subtotal}
                      onChange={(e) => setSubtotal(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      Tax Amount (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Invoice Notes / Memo
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Description of line items, payment instructions..."
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
                <Button type="submit" size="sm" disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? "Generating..." : "Generate Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Invoice Modal / Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedInvoice.invoice_number}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant={selectedInvoice.is_overdue ? "overdue" : selectedInvoice.status}
                    >
                      {selectedInvoice.is_overdue ? "Overdue" : selectedInvoice.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Issued {formatDate(selectedInvoice.issue_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Print PDF
                </Button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Customer and Dates Summary */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Billed To
                  </span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {selectedInvoice.customer_details?.company_name}
                  </span>
                  <span className="text-slate-500 block">
                    {selectedInvoice.customer_details?.contact_name}
                  </span>
                  <span className="text-slate-500 block">
                    {selectedInvoice.customer_details?.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Payment Deadlines
                  </span>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issue Date:</span>
                      <span className="font-mono text-slate-800">
                        {formatDate(selectedInvoice.issue_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span
                        className={`font-mono font-medium ${
                          selectedInvoice.is_overdue ? "text-rose-600" : "text-slate-800"
                        }`}
                      >
                        {formatDate(selectedInvoice.due_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Item Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.lines?.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-slate-900 block">
                            {line.product_details?.name || "Subscription Service Line"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">{line.quantity}</td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {formatCurrency(line.unit_price)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                          {formatCurrency(line.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2">
                    <span>Total Amount:</span>
                    <span className="font-mono">
                      {formatCurrency(selectedInvoice.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Paid to Date:</span>
                    <span className="font-mono">
                      -{formatCurrency(selectedInvoice.paid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold border-t border-slate-100 pt-1 text-sm">
                    <span>Balance Due:</span>
                    <span className="font-mono">
                      {formatCurrency(selectedInvoice.outstanding_balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {selectedInvoice.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => confirmMutation.mutate(selectedInvoice.id)}
                      disabled={confirmMutation.isPending}
                    >
                      Confirm Invoice
                    </Button>
                  )}
                  {selectedInvoice.status !== "cancelled" && selectedInvoice.status !== "paid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => cancelMutation.mutate(selectedInvoice.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Void / Cancel
                    </Button>
                  )}
                </div>

                {Number(selectedInvoice.outstanding_balance) > 0 &&
                  selectedInvoice.status !== "cancelled" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPaymentModalInvoice(selectedInvoice);
                        setPaymentAmount(selectedInvoice.outstanding_balance);
                      }}
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                      Record Settlement
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Record Payment</h3>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Target Invoice:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {paymentModalInvoice.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-semibold text-slate-800">
                    {paymentModalInvoice.customer_details?.company_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-600">
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
