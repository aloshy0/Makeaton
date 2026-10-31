"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { ApiRequestError, api, AuthenticationResponse } from "../../lib/api";

interface GoogleCodeResponse {
  code?: string;
  error?: string;
}

interface GoogleCodeClient {
  requestCode: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: "popup";
            select_account: boolean;
            callback: (response: GoogleCodeResponse) => void;
            error_callback: (error: { type: string }) => void;
          }) => GoogleCodeClient;
        };
      };
    };
  }
}

interface GoogleSignInProps {
  onAuthenticated: (response: AuthenticationResponse) => Promise<void> | void;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function GoogleSignIn({ onAuthenticated }: GoogleSignInProps) {
  const [codeClient, setCodeClient] = useState<GoogleCodeClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkPassword, setLinkPassword] = useState("");

  const finishSignIn = useCallback(
    async (response: AuthenticationResponse) => {
      window.localStorage.setItem("access_token", response.access);
      await onAuthenticated(response);
    },
    [onAuthenticated]
  );

  const handleGoogleCode = useCallback(
    async (response: GoogleCodeResponse) => {
      if (response.error || !response.code) {
        setLoading(false);
        setError(
          response.error === "access_denied"
            ? "Google sign-in was canceled. You can try again whenever you’re ready."
            : "Google sign-in could not be completed. Please try again."
        );
        return;
      }

      setError(null);
      try {
        const authResponse = await api.googleLogin({ code: response.code });
        await finishSignIn(authResponse);
      } catch (authError) {
        if (
          authError instanceof ApiRequestError &&
          authError.code === "account_link_required" &&
          typeof authError.details.link_token === "string"
        ) {
          setLinkToken(authError.details.link_token);
          setLinkPassword("");
          setError(
            "This verified email already has a FlowGrid account. Enter that account’s password to link it to Google."
          );
        } else {
          setError(
            authError instanceof Error
              ? authError.message
              : "Google sign-in failed. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [finishSignIn]
  );

  const initializeGoogle = useCallback(() => {
    const googleOauth = window.google?.accounts?.oauth2;
    if (!googleClientId || !googleOauth) return;

    setCodeClient(
      googleOauth.initCodeClient({
        client_id: googleClientId,
        scope: "openid email profile",
        ux_mode: "popup",
        select_account: true,
        callback: handleGoogleCode,
        error_callback: (popupError) => {
          setLoading(false);
          if (popupError.type !== "popup_closed") {
            setError(
              "Google sign-in could not open. Check your browser’s popup settings and try again."
            );
          }
        },
      })
    );
  }, [handleGoogleCode]);

  useEffect(() => {
    initializeGoogle();
  }, [initializeGoogle]);

  const beginGoogleSignIn = () => {
    setError(null);
    setLinkToken(null);
    if (!googleClientId) {
      setError(
        "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and restart the web app."
      );
      return;
    }
    if (!codeClient) {
      setError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }
    setLoading(true);
    codeClient.requestCode();
  };

  const linkExistingAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!linkToken || !linkPassword) return;

    setLoading(true);
    setError(null);
    try {
      const authResponse = await api.googleLogin({
        link_token: linkToken,
        password: linkPassword,
      });
      await finishSignIn(authResponse);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "The accounts could not be linked. Please try again."
      );
      if (authError instanceof ApiRequestError && authError.code === "link_expired") {
        setLinkToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5">
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={initializeGoogle}
          onError={() =>
            setError("Google sign-in could not load. Check your internet connection and try again.")
          }
        />
      )}

      <div className="relative mb-5 flex items-center justify-center" aria-hidden="true">
        <span className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
        <span className="relative bg-white px-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
          OR
        </span>
      </div>

      <button
        type="button"
        onClick={beginGoogleSignIn}
        disabled={loading}
        aria-label="Continue with Google"
        className="group inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full border border-[#e4e6ed] bg-white px-4 py-3 text-sm font-semibold text-[#35364f] shadow-sm transition-all duration-200 hover:border-[#cdd1df] hover:bg-slate-50 hover:shadow-md active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4c6fff]/25 disabled:cursor-wait disabled:opacity-60"
      >
        <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A19.9 19.9 0 0 0 24 4 20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5Z"
          />
          <path
            fill="#34A853"
            d="M6.3 14.7 13 19.6A12 12 0 0 1 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A19.9 19.9 0 0 0 24 4 20 20 0 0 0 6.3 14.7Z"
          />
          <path
            fill="#FBBC05"
            d="M24 44c5.1 0 9.8-1.9 13.4-5.1l-6.2-5.2A11.9 11.9 0 0 1 13 28.4l-6.7 5.2A20 20 0 0 0 24 44Z"
          />
          <path
            fill="#EA4335"
            d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.7l6.2 5.2C41.1 35.3 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5Z"
          />
        </svg>
        <span>{loading ? "Connecting to Google…" : "Continue with Google"}</span>
      </button>

      {error && (
        <p
          className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium leading-relaxed text-rose-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {linkToken && (
        <form
          onSubmit={linkExistingAccount}
          className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div>
            <label
              htmlFor="google-link-password"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Existing FlowGrid password
            </label>
            <input
              id="google-link-password"
              type="password"
              autoComplete="current-password"
              required
              value={linkPassword}
              onChange={(event) => setLinkPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Linking account…" : "Link Google account"}
          </button>
        </form>
      )}
    </div>
  );
}
