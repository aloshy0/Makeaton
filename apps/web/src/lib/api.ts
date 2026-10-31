import {
  DashboardMetrics,
  Subscription,
  Invoice,
  Product,
  SubscriptionPlan,
  Customer,
  Payment,
  User,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || errorBody.detail || `Request failed with status ${res.status}`
    );
  }
  return res.json();
}

export const api = {
  // Reporting Dashboard
  getDashboard: () => request<DashboardMetrics>("/reporting/dashboard/"),

  // Subscriptions
  getSubscriptions: (status?: string) => {
    const query = status && status !== "all" ? `?status=${status}` : "";
    return request<{ results: Subscription[]; count: number }>(`/subscriptions/${query}`).then(
      (r) => r.results || (r as unknown as Subscription[])
    );
  },
  getSubscription: (id: string) => request<Subscription>(`/subscriptions/${id}/`),
  transitionSubscription: (id: string, target_status: string) =>
    request<Subscription>(`/subscriptions/${id}/transition/`, {
      method: "POST",
      body: JSON.stringify({ target_status }),
    }),

  // Billing & Invoices
  getInvoices: (overdueOnly?: boolean) => {
    const query = overdueOnly ? "?overdue=true" : "";
    return request<{ results: Invoice[]; count: number }>(`/billing/invoices/${query}`).then(
      (r) => r.results || (r as unknown as Invoice[])
    );
  },
  getInvoice: (id: string) => request<Invoice>(`/billing/invoices/${id}/`),
  confirmInvoice: (id: string) =>
    request<Invoice>(`/billing/invoices/${id}/confirm/`, { method: "POST" }),
  cancelInvoice: (id: string) =>
    request<Invoice>(`/billing/invoices/${id}/cancel/`, { method: "POST" }),
  triggerBillingRun: (target_date?: string) =>
    request<{
      status: string;
      message: string;
      data: { generated_count: number; skipped_count: number };
    }>("/billing/run/", {
      method: "POST",
      body: JSON.stringify({ target_date }),
    }),

  // Catalog & Customers
  getProducts: () =>
    request<{ results: Product[] }>("/catalog/products/").then(
      (r) => r.results || (r as unknown as Product[])
    ),
  getPlans: () =>
    request<{ results: SubscriptionPlan[] }>("/catalog/plans/").then(
      (r) => r.results || (r as unknown as SubscriptionPlan[])
    ),
  getCustomers: () =>
    request<{ results: Customer[] }>("/customers/").then(
      (r) => r.results || (r as unknown as Customer[])
    ),

  // Payments
  recordPayment: (data: {
    invoice: string;
    amount: string;
    payment_method: string;
    reference?: string;
    notes?: string;
  }) =>
    request<Payment>("/payments/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Auth / Me
  getMe: () => request<User>("/auth/me/"),
};
