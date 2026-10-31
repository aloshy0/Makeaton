"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

export default function RenewalsPage() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [simulatedRenewal, setSimulatedRenewal] = useState<string | null>(null);

  const renewals = [
    {
      id: "ren-001",
      planName: "FlowGrid Enterprise Tier",
      amount: 149.0,
      dueDate: "2026-11-15T00:00:00Z",
      status: "UPCOMING",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "ren-002",
      planName: "FlowGrid Team Cloud Workspace",
      amount: 49.0,
      dueDate: "2026-11-28T00:00:00Z",
      status: "SCHEDULED",
      paymentMethod: "Mastercard ending in 8891",
    },
  ];

  const handleManualRenew = (id: string) => {
    setSimulatedRenewal(id);
    setTimeout(() => {
      setSimulatedRenewal(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-[#0B1020] tracking-tight">
            Upcoming Renewals & Payment Schedules
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Review automatic contract renewals, settlement accounts, and grace period settings.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E8ECF3] shadow-2xs text-xs">
          <span className="font-semibold text-[#0B1020]">Auto-Renew Protocol:</span>
          <button
            onClick={() => setAutoPayEnabled(!autoPayEnabled)}
            className={`px-2 py-0.5 rounded-full font-bold text-[10px] transition-colors ${
              autoPayEnabled
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {autoPayEnabled ? "ENABLED" : "PAUSED"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {renewals.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E8ECF3] p-6 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-[#7651F5] flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-[#0B1020]">
                    {item.planName}
                  </span>
                  <Badge variant="active">Auto-Scheduled</Badge>
                </div>
                <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.paymentMethod}</span>
                  <span>•</span>
                  <span>Due: {formatDate(item.dueDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-heading font-black text-xl text-[#0B1020]">
                  {formatCurrency(item.amount)}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">Automatic execution</div>
              </div>

              <div>
                {simulatedRenewal === item.id ? (
                  <Button
                    size="sm"
                    disabled
                    className="bg-emerald-600 text-white rounded-xl text-xs"
                  >
                    Renewed Successfully!
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleManualRenew(item.id)}
                    className="border-[#E8ECF3] hover:border-emerald-600 text-xs rounded-xl"
                  >
                    Renew Early
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
