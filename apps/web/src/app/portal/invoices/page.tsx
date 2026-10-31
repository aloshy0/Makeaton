"use client";

import React, { useState } from "react";
import {
  Receipt,
  Download,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react";
import { DUMMY_INVOICES } from "../../../lib/dummy-data";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Invoice } from "../../../types";

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(DUMMY_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayNow = (inv: Invoice) => {
    setSelectedInvoice(inv);
  };

  const confirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setInvoices(
      invoices.map((i) =>
        i.id === selectedInvoice.id
          ? {
              ...i,
              status: "paid",
              outstanding_balance: "0.00",
              paid_amount: selectedInvoice.total_amount,
              is_overdue: false,
            }
          : i
      )
    );
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedInvoice(null);
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#0B1020] tracking-tight">
            My Invoices & Statements
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Download PDF receipts, inspect tax line-item charges, and settle pending statements.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8ECF3] overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-[#E8ECF3] text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Invoice Reference</th>
              <th className="py-3.5 px-4">Issued Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#0B1020]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    <span>{inv.invoice_number || inv.id.slice(0, 8)}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-[#64748B]">{formatDate(inv.created_at)}</td>
                <td className="py-3.5 px-4 text-[#64748B]">{formatDate(inv.due_date)}</td>
                <td className="py-3.5 px-4 font-bold font-mono text-sm">
                  {formatCurrency(inv.total_amount)}
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={inv.status === "paid" ? "active" : "warning"}>{inv.status}</Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {inv.status !== "paid" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayNow(inv)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg h-7 px-3"
                      >
                        Settle Now
                      </Button>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-[#E8ECF3] hover:bg-slate-100 text-slate-600"
                      title="Print or Save PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settle Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8ECF3] shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading font-bold text-base text-[#0B1020] mb-1">
              Settle Invoice #{selectedInvoice.invoice_number || selectedInvoice.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Authorized payment method will be charged through secure gateway.
            </p>

            {paymentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-xs text-emerald-800">
                  Invoice Settled Successfully!
                </div>
                <div className="text-[11px] text-emerald-600">Updated receipt generated.</div>
              </div>
            ) : (
              <form onSubmit={confirmPayment} className="space-y-4 text-xs">
                <div>
                  <span className="text-[#64748B] block mb-1">Total Due</span>
                  <div className="font-heading font-black text-2xl text-[#0B1020]">
                    {formatCurrency(
                      selectedInvoice.outstanding_balance || selectedInvoice.total_amount
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1020] mb-1">Payment Method</label>
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">Visa ending in 4242</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">
                      Default
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 rounded-xl border border-[#E8ECF3] hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                  >
                    Authorize Payment
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
