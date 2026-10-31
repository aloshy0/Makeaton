"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Filter,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { api } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { DUMMY_PAYMENTS } from "../../../lib/dummy-data";
import { useAccount } from "../../../context/account-context";

export default function CustomerPortalPaymentsPage() {
  const { user } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const { data: payments = DUMMY_PAYMENTS, isLoading } = useQuery({
    queryKey: ["portal", "payments"],
    queryFn: () => api.getPortalPayments(),
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.invoice_number &&
        payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = selectedMethod === "ALL" || payment.payment_method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const totalPaid = payments.reduce((acc, p) => acc + parseFloat(p.amount || "0"), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Billing Ledger
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#64748B]">Personal Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1020] tracking-tight">
            Payments & Receipts
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Review your historical transactions, download settlement receipts, and manage saved
            payment methods.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs hover:border-purple-200 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Total Settled
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1020] mt-1.5 tabular-nums">
                  {formatCurrency(totalPaid)}
                </h3>
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> All invoices in good standing
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs hover:border-blue-200 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Active Card
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1020] mt-1.5 flex items-center gap-2">
                  <span>•••• 4242</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-1">Visa • Expires 08/29</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs hover:border-emerald-200 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Payment Security
                </p>
                <h3 className="text-lg font-heading font-bold text-emerald-700 mt-1.5">
                  PCI-DSS Level 1
                </h3>
                <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> End-to-end tokenized via
                  Stripe
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Payment Methods Section */}
      <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-[#E8ECF3] px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-heading font-bold text-[#0B1020]">
              Saved Payment Methods
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Cards and bank accounts used for automatic subscription renewals
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E8ECF3] text-xs font-semibold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Method
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-purple-200 bg-purple-50/20 rounded-2xl p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-12 rounded-lg bg-[#0B1020] text-white flex items-center justify-center font-bold text-xs">
                  VISA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-bold text-sm text-[#0B1020]">
                      Visa ending in 4242
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-700 text-[10px] font-bold py-0"
                    >
                      Default
                    </Badge>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">Expires 08/2029 • Added Oct 2026</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs">
                Active
              </Badge>
            </div>

            <div className="border border-[#E8ECF3] bg-white rounded-2xl p-4.5 flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  MC
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-[#0B1020]">
                    Mastercard ending in 8831
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">Expires 11/2028 • Backup card</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#64748B] hover:text-[#0B1020]"
              >
                Make Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Section */}
      <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-[#E8ECF3] bg-white px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-heading font-bold text-[#0B1020]">
                Payment History
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B] mt-0.5">
                Complete log of subscription charges and processed transactions
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search receipt or invoice..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9 h-9 text-xs rounded-xl border-[#E8ECF3]"
                />
              </div>

              <select
                aria-label="Filter payment method"
                value={selectedMethod}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedMethod(e.target.value)
                }
                className="h-9 px-3 text-xs rounded-xl border border-[#E8ECF3] bg-white text-[#0B1020] font-medium outline-none focus:border-purple-500"
              >
                <option value="ALL">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8ECF3] bg-slate-50/60 text-[#64748B] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Payment Ref</th>
                  <th className="py-3 px-6">Invoice</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Method</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3]">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B]">
                      <FileCheck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-sm text-[#0B1020]">
                        No payment records found
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Try adjusting your search criteria
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#0B1020]">
                        {p.payment_number}
                        {p.reference && (
                          <span className="block text-[10px] text-[#64748B] font-normal font-sans">
                            Ref: {p.reference}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#64748B]">
                        {p.invoice_number || p.invoice}
                      </td>
                      <td className="py-4 px-6 text-[#64748B]">
                        {formatDate(p.payment_date || p.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className="capitalize text-[11px] font-semibold border-[#E8ECF3] bg-white text-[#0B1020]"
                        >
                          {p.payment_method.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right font-heading font-extrabold text-[#0B1020] text-sm tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Settled
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveReceipt(p)}
                          className="h-8 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs font-semibold gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E8ECF3] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8ECF3]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-heading font-extrabold text-sm">
                  FG
                </div>
                <span className="font-heading font-bold text-base text-[#0B1020]">
                  FlowGrid Receipt
                </span>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Payment Confirmed
              </Badge>
            </div>

            <div className="py-6 space-y-4 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed border-[#E8ECF3]">
                <span className="text-[#64748B]">Receipt Number</span>
                <span className="font-mono font-bold text-[#0B1020]">
                  {activeReceipt.payment_number}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-[#E8ECF3]">
                <span className="text-[#64748B]">Associated Invoice</span>
                <span className="font-mono font-bold text-[#0B1020]">
                  {activeReceipt.invoice_number || activeReceipt.invoice}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-[#E8ECF3]">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="text-[#0B1020] font-medium">
                  {formatDate(activeReceipt.payment_date || activeReceipt.created_at)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-[#E8ECF3]">
                <span className="text-[#64748B]">Payment Channel</span>
                <span className="capitalize font-medium text-[#0B1020]">
                  {activeReceipt.payment_method.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-[#E8ECF3]">
                <span className="text-[#64748B]">Gateway Reference</span>
                <span className="font-mono text-[#64748B]">
                  {activeReceipt.reference || "GATEWAY_CONFIRMED"}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-[#E8ECF3] mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase">
                    Total Amount Paid
                  </p>
                  <p className="text-xl font-heading font-extrabold text-[#0B1020] tabular-nums mt-0.5">
                    {formatCurrency(activeReceipt.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Settled in full
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8ECF3]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReceipt(null)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
