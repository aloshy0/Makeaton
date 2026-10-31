"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";

export default function CatalogPage() {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["catalog", "products"],
    queryFn: api.getProducts,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["catalog", "plans"],
    queryFn: api.getPlans,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Product Catalog & Subscription Plans
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure software lines, modular add-ons, price delta variants, and recurring billing interval policies.
        </p>
      </div>

      {/* Subscription Plans Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Subscription Plans & Policies</h2>
          <p className="text-xs text-slate-500">Recurring intervals, minimum seats, and automated lifecycle policies</p>
        </div>

        {plansLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:border-indigo-200 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="confirmed">{plan.billing_frequency}</Badge>
                    <span className="font-mono text-xs text-slate-400">{plan.code}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-slate-900">
                      {formatCurrency(plan.cost)}
                    </span>
                    <span className="text-xs text-slate-500">/{plan.billing_frequency}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Lifecycle Policies
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${plan.allow_pause ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>{plan.allow_pause ? "Pause / Resume permitted" : "Pausing locked"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${plan.allow_early_close ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>{plan.allow_early_close ? "Early cancellation allowed" : "Fixed term contract"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${plan.allow_renew ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>{plan.allow_renew ? "Auto & manual renewals enabled" : "Non-renewable"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${plan.auto_close_on_end ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>{plan.auto_close_on_end ? "Auto-close on expiration" : "Manual review required"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Products & Variants Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Products & Attribute Variants</h2>
          <p className="text-xs text-slate-500">Base catalog pricing and attribute price adjustments</p>
        </div>

        {productsLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={product.product_type === "software" ? "quotation" : "draft"}>
                      {product.product_type}
                    </Badge>
                    <span className="font-mono text-xs text-slate-400">{product.code}</span>
                  </div>
                  <CardTitle className="text-base mt-2">{product.name}</CardTitle>
                  <CardDescription>{product.notes || "Core catalog item"}</CardDescription>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900">
                    {formatCurrency(product.sales_price)}
                  </div>
                </CardHeader>
                <CardContent className="pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Configurable Variants
                  </span>
                  {product.variants.length === 0 ? (
                    <div className="text-slate-400 italic">No variants configured (standard pricing only)</div>
                  ) : (
                    <div className="space-y-1.5">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
                        >
                          <span className="font-medium text-slate-700">
                            {v.attribute_name}: {v.attribute_value}
                          </span>
                          <span className="font-mono font-semibold text-indigo-600">
                            +{formatCurrency(v.price_delta)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
