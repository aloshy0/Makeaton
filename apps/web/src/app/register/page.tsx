"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  AlertCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAccount } from "../../context/account-context";

export default function RegisterPage() {
  const router = useRouter();
  const { switchContext } = useAccount();

  const [accountType, setAccountType] = useState<"business" | "personal">("business");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Please ensure password satisfies all security requirements.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.register({
        email,
        password,
        company_name: accountType === "business" ? companyName : undefined,
        first_name: firstName,
        last_name: lastName,
      });
      if (res.access && typeof window !== "undefined") {
        localStorage.setItem("access_token", res.access);
      }

      if (accountType === "personal") {
        switchContext("PERSONAL");
        router.push("/portal");
      } else {
        switchContext("PROFESSIONAL");
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const prefillDemoBusiness = () => {
    const id = Math.floor(Math.random() * 900) + 100;
    setEmail(`founder${id}@cloudscale.io`);
    setPassword("SecurePassword2026!");
    setConfirmPassword("SecurePassword2026!");
    setCompanyName(`CloudScale Systems ${id}`);
    setFirstName("Evelyn");
    setLastName("Vance");
  };

  const prefillDemoCustomer = () => {
    const id = Math.floor(Math.random() * 900) + 100;
    setEmail(`customer${id}@example.com`);
    setPassword("SecurePassword2026!");
    setConfirmPassword("SecurePassword2026!");
    setFirstName("Jordan");
    setLastName("Miller");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-base shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
            FG
          </div>
          <span className="font-heading font-black text-2xl tracking-tight text-[#0B1020]">
            FlowGrid
          </span>
        </Link>
        <h1 className="font-heading font-extrabold text-xl text-[#0B1020] tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Join the multi-tenant subscription and recurring revenue engine
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-3xl border border-[#E8ECF3] p-7 sm:p-8 shadow-xl shadow-slate-200/50">
          {/* Account Type Selector */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Select Account Path
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-[#E8ECF3]">
              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  accountType === "business"
                    ? "bg-[#7651F5] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0B1020]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" /> Business Owner
              </button>
              <button
                type="button"
                onClick={() => setAccountType("personal")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  accountType === "personal"
                    ? "bg-[#7651F5] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0B1020]"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Personal Customer
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] mt-2 px-1">
              {accountType === "business"
                ? "Manage workspace, catalog, recurring billing, and customer operations."
                : "Discover plans, track renewals, pay invoices, and manage subscriptions."}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8ECF3]">
            <span className="text-xs text-[#64748B] font-medium">Quick testing</span>
            <button
              type="button"
              onClick={accountType === "business" ? prefillDemoBusiness : prefillDemoCustomer}
              className="text-xs font-bold text-[#7651F5] hover:text-[#5B3CD4] underline"
            >
              Prefill Sample Data
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {accountType === "business" && (
              <div>
                <label className="block text-[11px] font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                  Company / Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Cloud Corp"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 px-3.5 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7651F5]/15 font-medium"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 px-3 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 px-3 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={accountType === "business" ? "you@company.com" : "you@example.com"}
                className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 px-3.5 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 px-3.5 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0B1020] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-[#E8ECF3] bg-slate-50/50 px-3.5 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Password Validation Grid */}
            <div className="rounded-2xl border border-[#E8ECF3] bg-slate-50 p-3 space-y-1 text-[11px] text-[#64748B]">
              <div className="grid grid-cols-2 gap-1.5">
                <span
                  className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-bold" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasMinLength ? "text-emerald-600" : "text-slate-300"}`}
                  />
                  8+ Characters
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-bold" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasUppercase ? "text-emerald-600" : "text-slate-300"}`}
                  />
                  Uppercase Letter
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-bold" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasLowercase ? "text-emerald-600" : "text-slate-300"}`}
                  />
                  Lowercase Letter
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-700 font-bold" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasSpecial ? "text-emerald-600" : "text-slate-300"}`}
                  />
                  Special Char
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading || !isPasswordValid || (accountType === "business" && !companyName.trim())
              }
              className="w-full rounded-xl bg-[#7651F5] hover:bg-[#643ee4] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 font-heading"
            >
              {loading
                ? "Creating Account..."
                : accountType === "business"
                  ? "Create Account & Business Workspace"
                  : "Create Personal Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#7651F5] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
