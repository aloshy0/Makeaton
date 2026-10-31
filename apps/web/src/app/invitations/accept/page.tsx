"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, AlertCircle, Building2, KeyRound } from "lucide-react";
import { api } from "../../../lib/api";

function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  // Password complexity checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please provide an invitation token.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please ensure password satisfies all security requirements.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.acceptInvitation({
        token: token.trim(),
        password,
        first_name: firstName,
        last_name: lastName,
      });

      setSuccess(
        `Invitation accepted! You have successfully joined "${res.workspace.name}" as ${res.workspace.user_role || "Staff"}.`
      );
      if (res.access && typeof window !== "undefined") {
        localStorage.setItem("access_token", res.access);
      }
      setTimeout(() => {
        router.push("/");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation. The token may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Accept Staff Invitation</h1>
            <p className="text-xs text-slate-400">
              Join your workspace team & set your account password
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-800 bg-red-950/60 p-3.5 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="my-6 space-y-4 rounded-xl border border-emerald-800/80 bg-emerald-950/40 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h3 className="text-base font-semibold text-emerald-200">{success}</h3>
            <p className="text-xs text-slate-400">
              Redirecting to executive dashboard in a moment...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Invitation Token
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your 64-character token"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Set Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Visual Password Complexity Checklist */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5 text-[11px]">
              <span className="font-semibold text-slate-300 block mb-1">Security Checklist:</span>
              <div className="grid grid-cols-2 gap-1.5 text-slate-400">
                <div
                  className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasMinLength ? "text-emerald-400" : "text-slate-600"}`}
                  />
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasUppercase ? "text-emerald-400" : "text-slate-600"}`}
                  />
                  <span>One uppercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasLowercase ? "text-emerald-400" : "text-slate-600"}`}
                  />
                  <span>One lowercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-400" : ""}`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${hasSpecial ? "text-emerald-400" : "text-slate-600"}`}
                  />
                  <span>One special character</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !token.trim()}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Verifying Token..." : "Accept Invitation & Join Workspace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading invitation...
        </div>
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}
