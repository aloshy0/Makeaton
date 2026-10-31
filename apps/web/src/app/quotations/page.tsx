"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Quotation } from "../../types";
import { DUMMY_CUSTOMERS, DUMMY_PLANS } from "../../lib/dummy-data";
import { FileCheck, Plus, CheckCircle2, Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function QuotationsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [customerId, setCustomerId] = useState(DUMMY_CUSTOMERS[0]?.id || "");
  const [planId, setPlanId] = useState(DUMMY_PLANS[1]?.id || "");
  const [validUntil, setValidUntil] = useState("2026-11-30");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: quotations = [] } = useQuery<Quotation[]>({
    queryKey: ["quotations"],
    queryFn: () => api.getQuotations(),
  });

  const handlePrefill = () => {
    setCustomerId(DUMMY_CUSTOMERS[1]?.id || "");
    setPlanId(DUMMY_PLANS[2]?.id || "");
    setValidUntil("2026-12-31");
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("Quotation successfully drafted and ready for customer review.");
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg(null);
      setSubmitting(false);
    }, 1500);
  };

  const handleConvert = async (quoteId: string) => {
    if (!confirm("Convert this approved quotation into an active subscription?")) return;
    try {
      await api.approveQuotation("aac3abe7-18b7-4c5f-a29e-786b63476459", quoteId);
      alert("Quotation approved and successfully converted into a subscription!");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    } catch (err: any) {
      alert(err.message || "Conversion failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Quotations & Proposals
          </h1>
          <p className="text-xs text-slate-500">
            Draft formal pricing quotes, share with prospective clients, and convert to
            subscriptions.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="h-3.5 w-3.5" /> Draft New Quotation
        </Button>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Quotation #</th>
              <th className="px-5 py-3.5">Customer Organization</th>
              <th className="px-5 py-3.5">Associated Plan</th>
              <th className="px-5 py-3.5">Valid Until</th>
              <th className="px-5 py-3.5 text-right">Total Amount</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotations.map((q: Quotation) => (
              <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4 font-mono font-bold text-slate-900">
                  {q.quotation_number}
                </td>
                <td className="px-5 py-4 font-medium text-slate-800">
                  {q.customer_details?.company_name || "Acme Global"}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {q.plan_details?.name || "Professional Growth"}
                </td>
                <td className="px-5 py-4 text-slate-500">{q.valid_until}</td>
                <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                  ${Number(q.total_amount).toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200 uppercase">
                    {q.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    size="sm"
                    onClick={() => handleConvert(q.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 gap-1 shadow-sm"
                  >
                    Convert to Subscription <ArrowRight className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Draft Quotation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Draft New Quotation</h3>
                <p className="text-xs text-slate-500">
                  Configure proposal terms and pricing structure
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

            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  {DUMMY_CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.contact_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Plan
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  {DUMMY_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${Number(p.base_price).toFixed(2)} / {p.billing_interval}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposal Validity Date
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  {submitting ? "Drafting..." : "Save Quotation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
