"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { formatCurrency } from "../../../lib/utils";
import { DUMMY_PLANS } from "../../../lib/dummy-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

export default function HostedCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId as string) || "cs_demo_sample";

  // Selected plan simulation
  const selectedPlan = DUMMY_PLANS[1] || DUMMY_PLANS[0]; // Scale Enterprise Monthly

  // Customer form state
  const [customerEmail, setCustomerEmail] = useState("alexandra.vance@techlead.io");
  const [customerName, setCustomerName] = useState("Alexandra Vance");
  const [companyName, setCompanyName] = useState("Vance Systems Inc");
  const [billingAddress, setBillingAddress] = useState("100 Tech Boulevard, Austin, TX 78701");

  // Payment form state
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("892");

  // Workflow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedSubNumber, setConfirmedSubNumber] = useState("");

  const handlePrefillCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardExpiry("11/29");
    setCardCvc("123");
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate backend payment verification and subscription activation
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setConfirmedSubNumber(`SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <Badge variant="active" className="mb-3">
            Payment Verified & Subscribed
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome to Brightloop Cloud!
          </h2>

          <p className="text-sm text-slate-600 mb-6">
            Your subscription has been provisioned and your first invoice is fully settled.
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Subscription Ref:</span>
              <span className="font-mono font-bold text-slate-900">{confirmedSubNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subscribed Plan:</span>
              <span className="font-semibold text-slate-900">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Billing Cycle:</span>
              <span className="text-slate-800 capitalize">{selectedPlan.billing_interval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Charged:</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatCurrency(selectedPlan.base_price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Account:</span>
              <span className="text-slate-800">{customerEmail}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => router.push("/portal")}>
              <span>Access Customer Self-Service Portal</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" className="w-full text-xs" onClick={() => router.push("/")}>
              Return to Platform Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              BL
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Brightloop Software</span>
              <span className="text-xs text-slate-500">Secure Hosted Checkout Session</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <Lock className="h-3.5 w-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Summary Side */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Selected Subscription
                </span>
                <CardTitle className="text-xl mt-1 text-slate-900">{selectedPlan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-mono text-3xl font-extrabold text-slate-900">
                    {formatCurrency(selectedPlan.base_price)}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    /{selectedPlan.billing_interval}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Includes up to {selectedPlan.min_seats || 5} user seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Automatic monthly recurring billing engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Self-service customer portal access included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Cancel or adjust terms any time before renewal</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Plan Subtotal:</span>
                    <span>{formatCurrency(selectedPlan.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Tax (0%):</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-xs">
                    <span>Total Due Today:</span>
                    <span className="text-indigo-600">
                      {formatCurrency(selectedPlan.base_price)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 space-y-2">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Guaranteed Tenant Isolation
              </div>
              <p>
                Session <span className="font-mono text-slate-700">{sessionId}</span> is protected
                by Brightloop’s multi-tenant isolation engine. No cross-organization leakage.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              {/* Customer Info Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    1. Customer Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Invoices and portal credentials will be sent to this email
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Billing Address
                      </label>
                      <input
                        type="text"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        2. Payment Details
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Credit / Debit Card Authorization
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrefillCard}
                      className="text-[11px] h-7 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Prefill Demo Card
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Card Number *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">CVC / CVV *</label>
                        <input
                          type="text"
                          required
                          placeholder="CVC"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                      {isProcessing ? (
                        <span>Authorizing & Activating...</span>
                      ) : (
                        <span>
                          Authorize & Subscribe ({formatCurrency(selectedPlan.base_price)})
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
