"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col justify-between selection:bg-purple-100 selection:text-purple-900">
      {/* Ambient gradient lighting accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-[#8b5cf6]/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#3b82f6]/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[520px] h-[520px] rounded-full bg-[#10b981]/6 blur-[120px] pointer-events-none" />

      {/* Floating translucent square decorations */}
      <div className="absolute top-24 left-[10%] w-16 h-16 rounded-2xl bg-white/70 border border-slate-200/70 shadow-lg shadow-purple-500/5 backdrop-blur-md rotate-12 pointer-events-none animate-float-slow hidden sm:block" />
      <div className="absolute top-[52%] left-[5%] w-24 h-24 rounded-3xl bg-white/60 border border-slate-200/70 shadow-xl shadow-blue-500/5 backdrop-blur-md -rotate-6 pointer-events-none animate-float-reverse hidden md:block" />
      <div className="absolute top-28 right-[14%] w-20 h-20 rounded-2xl bg-white/65 border border-slate-200/70 shadow-lg shadow-emerald-500/5 backdrop-blur-md rotate-45 pointer-events-none animate-float-slow hidden sm:block" />
      <div className="absolute bottom-24 right-[8%] w-28 h-28 rounded-3xl bg-white/50 border border-slate-200/60 shadow-xl backdrop-blur-md -rotate-12 pointer-events-none animate-float-reverse hidden sm:block" />

      {/* Top Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 sm:py-8 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <svg
            className="w-5 h-5 text-black transition-transform group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 4.5h16l-4.5 6H3v-6z" />
            <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
          </svg>
          <span className="text-lg font-black tracking-tight text-slate-950 font-heading">
            FLOWGRID
          </span>
        </Link>

        <div className="text-xs sm:text-sm text-slate-500 font-medium">
          Remember password?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors ml-1"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 shadow-sm">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                  Check your inbox
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  If an account exists for{" "}
                  <span className="text-slate-900 font-semibold">{email}</span>, we have dispatched
                  password recovery instructions.
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
                    Reset password
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Enter your registered email address to receive password reset instructions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                      />
                      <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 px-4 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Sending instructions...</span>
                    ) : (
                      <>
                        <span>Send Reset Instructions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                      Back to sign in
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FlowGrid Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}
