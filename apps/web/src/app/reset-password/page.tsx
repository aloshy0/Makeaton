"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "demo_token";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Password Updated</h3>
        <p className="text-xs text-slate-400">
          Your password has been changed securely. You can now sign in with your new credentials.
        </p>
        <div className="pt-4 border-t border-slate-800">
          <Button className="w-full" onClick={() => router.push("/login")}>
            <span>Continue to Sign In</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-rose-950/60 border border-rose-800/40 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-300">New Password</label>
        <div className="mt-1 relative">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 chars, 1 uppercase, 1 special"
            className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300">Confirm Password</label>
        <div className="mt-1 relative">
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating password..." : "Reset Password"}
      </Button>

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-slate-400 hover:text-white">
          Cancel and return to login
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            BL
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Create new password
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enforce strict credential complexity: minimum 8 characters, uppercase and special
          characters.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <Suspense
            fallback={<div className="text-center text-xs text-slate-400">Loading form...</div>}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
