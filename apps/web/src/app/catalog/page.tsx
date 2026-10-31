"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, Sparkles, X, Layers, Package } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { DUMMY_PRODUCT_PREFILL, DUMMY_PLAN_PREFILL } from "../../lib/dummy-data";

export default function CatalogPage() {
  const queryClient = useQueryClient();

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Product form state
  const [prodName, setProdName] = useState("");
  const [prodCode, setProdCode] = useState("");
  const [prodType, setProdType] = useState<"software" | "service" | "addon">("software");
  const [prodSalesPrice, setProdSalesPrice] = useState("");
  const [prodCostPrice, setProdCostPrice] = useState("");
  const [prodNotes, setProdNotes] = useState("");

  // Plan form state
  const [planName, setPlanName] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [planInterval, setPlanInterval] = useState<"monthly" | "yearly" | "quarterly">("monthly");
  const [planPrice, setPlanPrice] = useState("");
  const [planMinSeats, setPlanMinSeats] = useState("1");
  const [planAllowPause, setPlanAllowPause] = useState(true);
  const [planAllowRenew, setPlanAllowRenew] = useState(true);
  const [planAllowEarlyClose, setPlanAllowEarlyClose] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["catalog", "products"],
    queryFn: () => api.getProducts(),
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["catalog", "plans"],
    queryFn: () => api.getPlans(),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => api.createProduct("aac3abe7-18b7-4c5f-a29e-786b63476459", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "products"] });
      setIsProductModalOpen(false);
      resetProductForm();
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: any) => api.createPlan("aac3abe7-18b7-4c5f-a29e-786b63476459", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "plans"] });
      setIsPlanModalOpen(false);
      resetPlanForm();
    },
  });

  const resetProductForm = () => {
    setProdName("");
    setProdCode("");
    setProdType("software");
    setProdSalesPrice("");
    setProdCostPrice("");
    setProdNotes("");
  };

  const resetPlanForm = () => {
    setPlanName("");
    setPlanCode("");
    setPlanInterval("monthly");
    setPlanPrice("");
    setPlanMinSeats("1");
    setPlanAllowPause(true);
    setPlanAllowRenew(true);
    setPlanAllowEarlyClose(false);
  };

  const handlePrefillProduct = () => {
    setProdName(DUMMY_PRODUCT_PREFILL.name);
    setProdCode(DUMMY_PRODUCT_PREFILL.code);
    setProdType(DUMMY_PRODUCT_PREFILL.product_type);
    setProdSalesPrice(DUMMY_PRODUCT_PREFILL.sales_price);
    setProdCostPrice(DUMMY_PRODUCT_PREFILL.cost_price);
    setProdNotes(DUMMY_PRODUCT_PREFILL.notes);
  };

  const handlePrefillPlan = () => {
    setPlanName(DUMMY_PLAN_PREFILL.name);
    setPlanCode(DUMMY_PLAN_PREFILL.code);
    setPlanInterval(DUMMY_PLAN_PREFILL.billing_interval);
    setPlanPrice(DUMMY_PLAN_PREFILL.base_price);
    setPlanMinSeats(String(DUMMY_PLAN_PREFILL.min_seats));
    setPlanAllowPause(DUMMY_PLAN_PREFILL.allow_pause);
    setPlanAllowRenew(true);
    setPlanAllowEarlyClose(DUMMY_PLAN_PREFILL.allow_early_close);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate({
      name: prodName,
      code: prodCode,
      product_type: prodType,
      sales_price: prodSalesPrice,
      cost_price: prodCostPrice || "0.00",
      notes: prodNotes,
    });
  };

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    createPlanMutation.mutate({
      name: planName,
      code: planCode,
      billing_interval: planInterval,
      base_price: planPrice,
      min_seats: parseInt(planMinSeats, 10) || 1,
      allow_pause: planAllowPause,
      allow_renew: planAllowRenew,
      allow_early_close: planAllowEarlyClose,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Product Catalog & Subscription Plans
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure software lines, modular add-ons, price delta variants, and recurring billing
            interval policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsProductModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Product
          </Button>
          <Button size="sm" onClick={() => setIsPlanModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Subscription Plan
          </Button>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Subscription Plans & Policies
            </h2>
            <p className="text-xs text-slate-500">
              Recurring intervals, minimum seats, and automated lifecycle policies
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {plans.length} configured plans
          </span>
        </div>

        {plansLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:border-indigo-200 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="confirmed">{plan.billing_interval}</Badge>
                    <span className="font-mono text-xs text-slate-400">{plan.code}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-slate-900">
                      {formatCurrency(plan.base_price)}
                    </span>
                    <span className="text-xs text-slate-500">/{plan.billing_interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Lifecycle Policies
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${plan.allow_pause ? "text-emerald-500" : "text-slate-300"}`}
                      />
                      <span>
                        {plan.allow_pause ? "Pause / Resume permitted" : "Pausing locked"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${plan.allow_early_close ? "text-emerald-500" : "text-slate-300"}`}
                      />
                      <span>
                        {plan.allow_early_close
                          ? "Early cancellation allowed"
                          : "Fixed term contract"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${plan.allow_renew ? "text-emerald-500" : "text-slate-300"}`}
                      />
                      <span>
                        {plan.allow_renew ? "Auto & manual renewals enabled" : "Non-renewable"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Products and Attribute Variants Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Products & Attribute Variants
            </h2>
            <p className="text-xs text-slate-500">
              Catalog base products with attribute price deltas
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {products.length} catalog items
          </span>
        </div>

        {productsLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading products...</div>
        ) : (
          <div className="space-y-4">
            {products.map((prod) => (
              <Card key={prod.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-900 text-base">{prod.name}</span>
                        <Badge variant={prod.is_active ? "active" : "draft"}>
                          {prod.product_type}
                        </Badge>
                      </div>
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">
                        {prod.code}
                      </span>
                      {prod.notes && <p className="text-xs text-slate-500 mt-1">{prod.notes}</p>}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                        Base Price
                      </span>
                      <span className="font-mono text-xl font-bold text-slate-900">
                        {formatCurrency(prod.sales_price)}
                      </span>
                    </div>
                  </div>

                  {/* Attribute Variants */}
                  {prod.variants && prod.variants.length > 0 && (
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                        Configured Attribute Variants
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {prod.variants.map((v) => (
                          <div
                            key={v.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs"
                          >
                            <span className="text-slate-500">{v.attribute_name}:</span>
                            <span className="font-semibold text-slate-800">
                              {v.attribute_value}
                            </span>
                            <span className="font-mono text-emerald-600 font-bold">
                              (+{formatCurrency(v.price_delta)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Add New Product</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrefillProduct}
                  className="text-xs h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Prefill Dummy Data
                </Button>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Analytics Engine"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Product Code *</label>
                  <input
                    type="text"
                    required
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="e.g. PROD-ANA-01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Product Type *</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="software">Software / SaaS</option>
                    <option value="service">Professional Service</option>
                    <option value="addon">Modular Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Sales Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodSalesPrice}
                    onChange={(e) => setProdSalesPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1 text-xs">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={prodNotes}
                  onChange={(e) => setProdNotes(e.target.value)}
                  placeholder="Features, SLA terms, or configuration options..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Plan */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">New Subscription Plan</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrefillPlan}
                  className="text-xs h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Prefill Dummy Data
                </Button>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitPlan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Enterprise Tier"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Plan Code *</label>
                  <input
                    type="text"
                    required
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    placeholder="e.g. ENT-YR"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Billing Interval *
                  </label>
                  <select
                    value={planInterval}
                    onChange={(e) => setPlanInterval(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Base Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Lifecycle Policies
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pausePolicy"
                    checked={planAllowPause}
                    onChange={(e) => setPlanAllowPause(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="pausePolicy" className="text-slate-600">
                    Allow Customer & Staff to Pause / Resume
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="renewPolicy"
                    checked={planAllowRenew}
                    onChange={(e) => setPlanAllowRenew(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="renewPolicy" className="text-slate-600">
                    Enable Automatic Recurring Renewal Runs
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="closePolicy"
                    checked={planAllowEarlyClose}
                    onChange={(e) => setPlanAllowEarlyClose(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="closePolicy" className="text-slate-600">
                    Permit Early Contract Cancellation
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlanModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createPlanMutation.isPending}>
                  {createPlanMutation.isPending ? "Configuring..." : "Save Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
