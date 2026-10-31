"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Customer } from "../../types";
import { DUMMY_CUSTOMERS, DUMMY_CUSTOMER_PREFILL } from "../../lib/dummy-data";
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: customers = DUMMY_CUSTOMERS, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => api.getCustomers(),
  });

  const handlePrefill = () => {
    setCompanyName(DUMMY_CUSTOMER_PREFILL.company_name);
    setContactName(DUMMY_CUSTOMER_PREFILL.contact_name);
    setEmail(DUMMY_CUSTOMER_PREFILL.email);
    setPhone(DUMMY_CUSTOMER_PREFILL.phone);
    setBillingAddress(DUMMY_CUSTOMER_PREFILL.billing_address);
    setTaxId(DUMMY_CUSTOMER_PREFILL.tax_id);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await api.createCustomer("aac3abe7-18b7-4c5f-a29e-786b63476459", {
        company_name: companyName,
        contact_name: contactName,
        email,
        phone,
        billing_address: billingAddress,
        tax_id: taxId,
      });
      setSuccessMsg(`Customer "${companyName}" successfully added.`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setCompanyName("");
        setContactName("");
        setEmail("");
        setPhone("");
        setBillingAddress("");
        setTaxId("");
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = customers.filter(
    (c: Customer) =>
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Workspace Customers</h1>
          <p className="text-xs text-slate-500">
            Manage corporate accounts, contacts, and customer self-service access links.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="h-3.5 w-3.5" /> Add Customer Organization
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, contact or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} customers found</span>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Company Organization</th>
              <th className="px-5 py-3.5">Primary Contact</th>
              <th className="px-5 py-3.5">Billing Address</th>
              <th className="px-5 py-3.5">Tax / VAT ID</th>
              <th className="px-5 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {cust.company_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div>{cust.company_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{cust.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  <div className="font-medium">{cust.contact_name}</div>
                  <div className="text-[11px] text-slate-400">{cust.phone || "No phone"}</div>
                </td>
                <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                  {cust.billing_address || "Standard billing address"}
                </td>
                <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                  {cust.tax_id || "Exempt"}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Customer Organization</h3>
                <p className="text-xs text-slate-500">
                  Record customer profile for subscription assignment
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

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Global Technologies"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alice Johnson"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@acme.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax / VAT ID
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="US-94-3829102"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="100 Market St, Suite 400, San Francisco, CA"
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
                  disabled={submitting || !companyName.trim() || !email.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  {submitting ? "Saving Customer..." : "Save Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
