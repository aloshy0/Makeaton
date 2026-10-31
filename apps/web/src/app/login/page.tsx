"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { api } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@brightloop.com");
  const [password, setPassword] = useState("StrongPassword123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.access && typeof window !== "undefined") {
        localStorage.setItem("access_token", res.access);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("StrongPassword123!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30 mb-4">
          BL
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to Brightloop SaaS</h2>
        <p className="mt-1 text-xs text-slate-400">
          Multi-tenant subscription management and external billing engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In to Workspace"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Prototype Role Quick-Select Switches */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Prototype Demo Quick-Fill
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoLogin("owner@brightloop.com")}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:text-indigo-300 transition-colors"
              >
                <span className="font-semibold text-slate-200 block">Workspace Owner</span>
                <span className="text-[10px] text-slate-500">Full Business Authority</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@brightloop.com")}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:text-indigo-300 transition-colors"
              >
                <span className="font-semibold text-slate-200 block">Administrator</span>
                <span className="text-[10px] text-slate-500">Operations & Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("staff@brightloop.com")}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:text-indigo-300 transition-colors"
              >
                <span className="font-semibold text-slate-200 block">Internal Staff</span>
                <span className="text-[10px] text-slate-500">Approval Protected</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("customer@acme.com")}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:text-indigo-300 transition-colors"
              >
                <span className="font-semibold text-slate-200 block">Portal Customer</span>
                <span className="text-[10px] text-slate-500">Personal Subscriptions</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have a workspace?{" "}
            <Link href="/register" className="font-semibold text-indigo-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
