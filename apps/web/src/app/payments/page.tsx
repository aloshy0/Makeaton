"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Payment, Invoice } from "../../types";
import { DUMMY_PAYMENTS, DUMMY_INVOICES, DUMMY_PAYMENT_PREFILL } from "../../lib/dummy-data";
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Record Payment Form
  const [invoiceId, setInvoiceId] = useState(DUMMY_INVOICES[1]?.id || "");
  const [amount, setAmount] = useState(DUMMY_PAYMENT_PREFILL.amount);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [reference, setReference] = useState(DUMMY_PAYMENT_PREFILL.reference);
  const [notes, setNotes] = useState(DUMMY_PAYMENT_PREFILL.notes);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: payments = DUMMY_PAYMENTS } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: () => api.getPayments(),
  });

  const { data: invoices = DUMMY_INVOICES } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => api.getInvoices(),
  });

  const handlePrefill = () => {
    setAmount("165.00");
    setPaymentMethod("credit_card");
    setReference(`ch_demo_${Math.random().toString(36).substring(2, 9)}`);
    setNotes("Verified prototype settlement");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await api.recordPayment("aac3abe7-18b7-4c5f-a29e-786b63476459", {
        invoice: invoiceId,
        amount,
        payment_method: paymentMethod,
        reference,
      });
      setSuccessMsg(`Payment of $${amount} successfully recorded and matched to invoice.`);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setTimeout(() => {
        setIsRecordModalOpen(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm("Are you sure you want to process a refund for this transaction?")) return;
    try {
      await api.refundPayment(
        "aac3abe7-18b7-4c5f-a29e-786b63476459",
        paymentId,
        "Customer refund request"
      );
      alert("Refund processed successfully. Invoice balance has been updated.");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    } catch (err: any) {
      alert(err.message || "Refund failed");
    }
  };

  const filtered = payments.filter(
    (p: Payment) =>
      p.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Payments & Transactions
          </h1>
          <p className="text-xs text-slate-500">
            Record customer payments, match invoice balances, and process refunds.
          </p>
        </div>
        <Button
          onClick={() => setIsRecordModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="h-3.5 w-3.5" /> Record Payment Transaction
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by payment #, invoice, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} transactions recorded</span>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Payment #</th>
              <th className="px-5 py-3.5">Customer / Organization</th>
              <th className="px-5 py-3.5">Matched Invoice</th>
              <th className="px-5 py-3.5">Method & Reference</th>
              <th className="px-5 py-3.5">Settlement Date</th>
              <th className="px-5 py-3.5 text-right">Amount</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((pay) => (
              <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4 font-mono font-bold text-slate-900">
                  {pay.payment_number}
                </td>
                <td className="px-5 py-4 font-medium text-slate-800">
                  {pay.customer_name || "Corporate Account"}
                </td>
                <td className="px-5 py-4 font-mono text-slate-600">
                  {pay.invoice_number || "Direct Deposit"}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  <span className="capitalize font-medium block">
                    {pay.payment_method.replace("_", " ")}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {pay.reference || "N/A"}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(pay.payment_date || pay.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right font-mono font-bold text-emerald-600">
                  +${Number(pay.amount).toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefund(pay.id)}
                    className="text-[11px] h-7 gap-1 border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300"
                  >
                    <RotateCcw className="h-3 w-3" /> Refund
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Payment Receipt</h3>
                <p className="text-xs text-slate-500">
                  Settle customer invoice and reconcile outstanding balance
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrefill}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md"
              >
                <Sparkles className="h-3 w-3" /> Prefill Dummy Data
              </button>
            </div>

            {successMsg && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Invoice
                </label>
                <select
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} — {inv.customer_details?.company_name} (Due: $
                      {Number(inv.outstanding_balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="credit_card">Credit Card (Stripe)</option>
                    <option value="bank_transfer">ACH / Bank Wire</option>
                    <option value="online">Online Payment</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="ch_3M4o9281Xal0918"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment remarks"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !amount}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  {submitting ? "Recording..." : "Confirm & Settle Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
