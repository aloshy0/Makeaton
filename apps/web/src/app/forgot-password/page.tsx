"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            BL
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enter your registered business account email to receive recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">Check your email</h3>
              <p className="text-xs text-slate-400">
                If an account exists for <span className="text-white font-medium">{email}</span>, a
                secure password recovery link has been dispatched.
              </p>
              <div className="pt-4 border-t border-slate-800">
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Email address</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center text-xs text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
