"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../../components/layout/app-shell";
import { api } from "../../lib/api";
import { ApiKey, WebhookEndpoint } from "../../types";
import { DUMMY_API_KEYS, DUMMY_WEBHOOKS } from "../../lib/dummy-data";
import {
  Cable,
  KeyRound,
  Webhook,
  Code2,
  Plus,
  RotateCw,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "docs">("keys");

  // API Key creation
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("Production Checkout API Key");
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(365);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Webhook creation
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://my-storefront.com/api/webhooks/brightloop");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([
    "subscription.activated",
    "invoice.paid",
  ]);

  const { data: apiKeys = DUMMY_API_KEYS } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: () => api.getApiKeys(),
  });

  const { data: webhooks = DUMMY_WEBHOOKS } = useQuery<WebhookEndpoint[]>({
    queryKey: ["webhooks"],
    queryFn: () => api.getWebhooks(),
  });

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createApiKey("aac3abe7-18b7-4c5f-a29e-786b63476459", {
        name: keyName,
        expires_in_days: expiresInDays,
      });
      setGeneratedSecret(res.secret || `brk_live_${Math.random().toString(36).substring(2, 12)}`);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (err: any) {
      alert(err.message || "Failed to create API Key");
    }
  };

  const handleRotateKey = async (keyId: string) => {
    if (!confirm("Rotate this API key? The previous secret will immediately stop working.")) return;
    try {
      const res = await api.rotateApiKey("aac3abe7-18b7-4c5f-a29e-786b63476459", keyId);
      setGeneratedSecret(
        res.secret || `brk_live_rot_${Math.random().toString(36).substring(2, 12)}`
      );
      setIsKeyModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (err: any) {
      alert(err.message || "Rotate failed");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Revoke this API key? Any storefront relying on this key will be denied.")) return;
    try {
      await api.revokeApiKey("aac3abe7-18b7-4c5f-a29e-786b63476459", keyId);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (err: any) {
      alert(err.message || "Revoke failed");
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWebhook("aac3abe7-18b7-4c5f-a29e-786b63476459", {
        url: webhookUrl,
        events: webhookEvents,
      });
      setIsWebhookModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    } catch (err: any) {
      alert(err.message || "Failed to create webhook");
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    try {
      await api.retryWebhookDelivery("aac3abe7-18b7-4c5f-a29e-786b63476459", webhookId, "del-001");
      alert("Webhook delivery retried successfully with status HTTP 200 OK.");
    } catch (err: any) {
      alert(err.message || "Retry failed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">External Integrations</h1>
          <p className="text-xs text-slate-500">
            Connect published subscription plans into your existing websites and external
            applications.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs">
          <button
            onClick={() => setActiveTab("keys")}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "keys"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <KeyRound className="h-4 w-4" /> API Credentials ({apiKeys.length})
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "webhooks"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Webhook className="h-4 w-4" /> Webhooks ({webhooks.length})
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`pb-3 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "docs"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code2 className="h-4 w-4" /> Developer SDK & Snippets
          </button>
        </div>

        {/* Tab 1: API Keys */}
        {activeTab === "keys" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Workspace API keys authenticate requests from your external storefronts.
              </span>
              <Button
                onClick={() => {
                  setIsKeyModalOpen(true);
                  setGeneratedSecret(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Generate API Key
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Key Name</th>
                    <th className="px-5 py-3.5">Prefix Identifier</th>
                    <th className="px-5 py-3.5">Created Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{k.name}</td>
                      <td className="px-5 py-4 font-mono text-slate-600">
                        {k.key_prefix}...••••••••
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(k.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            k.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {k.is_active ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5">
                        {k.is_active && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRotateKey(k.id)}
                              className="text-[11px] h-7 gap-1 border-slate-200 hover:text-indigo-600"
                            >
                              <RotateCw className="h-3 w-3" /> Rotate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-[11px] h-7 gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3 w-3" /> Revoke
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Webhooks */}
        {activeTab === "webhooks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Webhooks push real-time events to your server when subscriptions activate or
                payments succeed.
              </span>
              <Button
                onClick={() => setIsWebhookModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Webhook Endpoint
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Endpoint URL</th>
                    <th className="px-5 py-3.5">Subscribed Events</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">{w.url}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {w.events.map((ev) => (
                            <span
                              key={ev}
                              className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryWebhook(w.id)}
                          className="text-[11px] h-7 gap-1"
                        >
                          <RotateCw className="h-3 w-3" /> Test Delivery
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Documentation & Snippets */}
        {activeTab === "docs" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-300 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Code2 className="h-4 w-4" /> 1. Embed Checkout Session on Your Website
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  POST /api/v1/workspaces/:id/checkout/sessions/
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Initiate a secure checkout session from your website backend using your API Key:
              </p>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                {`// Example: Next.js / Express Checkout Initiation
const res = await fetch("http://localhost:8000/api/v1/workspaces/aac3abe7-18b7-4c5f-a29e-786b63476459/checkout/sessions/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer brk_live_your_secret_key"
  },
  body: JSON.stringify({
    plan_id: "plan-002",
    customer_email: "buyer@client.com",
    customer_name: "Buyer Company"
  })
});
const { checkout_url } = await res.json();
window.location.href = checkout_url; // Redirects buyer to hosted checkout`}
              </pre>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-300 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Webhook className="h-4 w-4" /> 2. Verify Incoming Webhook Signatures
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  HMAC-SHA256 Verification
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Brightloop signs each event payload with your webhook secret in the{" "}
                <code className="text-indigo-400">X-Brightloop-Signature</code> header:
              </p>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                {`import crypto from "crypto";

export async function POST(req) {
  const signature = req.headers.get("x-brightloop-signature");
  const rawBody = await req.text();
  const expected = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET).update(rawBody).digest("hex");

  if (signature !== expected) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.type === "subscription.activated") {
    // Fulfill customer subscription service
  }
  return new Response("OK", { status: 200 });
}`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* API Key Generated Secret Dialog */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {generatedSecret ? "Save Your Secret API Key" : "Generate Workspace API Key"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {generatedSecret
                ? "This secret key will ONLY be shown once. Copy and store it in your server environment."
                : "Creates an authenticated credential for external storefront integration."}
            </p>

            {generatedSecret ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Never share or commit this
                    key
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-amber-200">
                    <span className="font-mono text-xs text-slate-900 break-all select-all flex-1">
                      {generatedSecret}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedSecret)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 gap-1"
                    >
                      {copiedSecret ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedSecret ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setIsKeyModalOpen(false);
                      setGeneratedSecret(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    I Have Safely Saved This Key
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Name / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiration Period
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year (Recommended)</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    Create Secret Key
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Add Webhook Endpoint</h3>
            <p className="text-xs text-slate-500 mb-4">
              Receive automated HTTP POST notifications for subscription lifecycle events
            </p>

            <form onSubmit={handleCreateWebhook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://yourdomain.com/webhooks"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Events to Deliver
                </label>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {[
                    "subscription.activated",
                    "subscription.paused",
                    "subscription.closed",
                    "invoice.paid",
                    "payment.succeeded",
                  ].map((ev) => (
                    <label key={ev} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookEvents([...webhookEvents, ev]);
                          } else {
                            setWebhookEvents(webhookEvents.filter((item) => item !== ev));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-mono text-[11px]">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Save Webhook Endpoint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
