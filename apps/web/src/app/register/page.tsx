"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Sparkles,
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
      setError(err.message || "Registration failed. Please try again.");
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xl shadow-lg shadow-purple-600/30 mb-4 font-heading">
          FG
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-heading">Join FlowGrid</h2>
        <p className="mt-1 text-xs text-slate-400">
          The unified subscription management and external billing engine
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-sm">
          {/* Account Type Selector */}
          <div className="mb-5">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Select Your Account Path
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  accountType === "business"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" /> Business Owner
              </button>
              <button
                type="button"
                onClick={() => setAccountType("personal")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  accountType === "personal"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Personal Customer
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 px-1">
              {accountType === "business"
                ? "Manage workspace, catalog, recurring billing, and customer operations."
                : "Subscribe to plans, track renewals, pay invoices, and monitor quotas."}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Quick Onboarding</span>
            <button
              type="button"
              onClick={accountType === "business" ? prefillDemoBusiness : prefillDemoCustomer}
              className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 underline"
            >
              Prefill Sample Data
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {accountType === "business" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Cloud Corp"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={accountType === "business" ? "you@company.com" : "you@example.com"}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1 text-[11px] text-slate-400">
              <div className="grid grid-cols-2 gap-1">
                <span
                  className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2 className="h-3 w-3" /> 8+ Characters
                </span>
                <span
                  className={`flex items-center gap-1 ${hasUppercase ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2 className="h-3 w-3" /> Uppercase Letter
                </span>
                <span
                  className={`flex items-center gap-1 ${hasLowercase ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2 className="h-3 w-3" /> Lowercase Letter
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? "text-emerald-400" : ""}`}>
                  <CheckCircle2 className="h-3 w-3" /> Special Char
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading || !isPasswordValid || (accountType === "business" && !companyName.trim())
              }
              className="w-full rounded-xl bg-purple-600 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 font-heading"
            >
              {loading
                ? "Creating Account..."
                : accountType === "business"
                  ? "Create Account & Business Workspace"
                  : "Create Personal Account"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-purple-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
