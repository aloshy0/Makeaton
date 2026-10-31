"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Briefcase,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "../../context/account-context";

export default function LoginPage() {
  const { login, isLoading } = useAccount();
  const [email, setEmail] = useState("demo@flowgrid.local");
  const [password, setPassword] = useState("FlowGrid2026!Demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPassword?: string) => {
    setEmail(demoEmail);
    setPassword(
      demoPassword ||
        (demoEmail === "demo@flowgrid.local" ? "FlowGrid2026!Demo" : "StrongPassword123!")
    );
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-base shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
            FG
          </div>
          <span className="font-heading font-black text-2xl tracking-tight text-[#0B1020]">
            FlowGrid
          </span>
        </Link>
        <h1 className="font-heading font-extrabold text-xl text-[#0B1020] tracking-tight">
          Sign in to your account
        </h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Access professional business workspace or personal customer portal
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-3xl border border-[#E8ECF3] p-8 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@flowgrid.local"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7651F5]/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0B1020] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#7651F5] hover:text-[#5B3CD4] transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7651F5]/20 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2 rounded-xl bg-[#7651F5] hover:bg-[#643ee4] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting || isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-[#E8ECF3]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                1-Click Demo Accounts
              </span>
              <span className="text-[10px] font-semibold text-[#7651F5] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickFill("demo@flowgrid.local", "FlowGrid2026!Demo")}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  email === "demo@flowgrid.local"
                    ? "border-[#7651F5] bg-purple-50/60 font-bold text-[#7651F5]"
                    : "border-[#E8ECF3] bg-slate-50/50 hover:bg-white hover:border-purple-200 text-[#0B1020]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Briefcase className="w-3.5 h-3.5 text-[#7651F5]" />
                  <span>Demo Admin</span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5 truncate">
                  demo@flowgrid.local
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("owner@flowgrid.com")}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  email === "owner@flowgrid.com"
                    ? "border-[#7651F5] bg-purple-50/60 font-bold text-[#7651F5]"
                    : "border-[#E8ECF3] bg-slate-50/50 hover:bg-white hover:border-purple-200 text-[#0B1020]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-[#7651F5]" />
                  <span>Owner</span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5 truncate">owner@flowgrid.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("staff@flowgrid.com")}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  email === "staff@flowgrid.com"
                    ? "border-[#7651F5] bg-purple-50/60 font-bold text-[#7651F5]"
                    : "border-[#E8ECF3] bg-slate-50/50 hover:bg-white hover:border-purple-200 text-[#0B1020]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Operations</span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5 truncate">staff@flowgrid.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("customer@acme.com")}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  email === "customer@acme.com"
                    ? "border-emerald-500 bg-emerald-50/60 font-bold text-emerald-700"
                    : "border-[#E8ECF3] bg-slate-50/50 hover:bg-white hover:border-emerald-200 text-[#0B1020]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer</span>
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5 truncate">customer@acme.com</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            New to FlowGrid?{" "}
            <Link href="/register" className="font-bold text-[#7651F5] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
