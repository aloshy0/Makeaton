import {
  Customer,
  DashboardMetrics,
  Invoice,
  Payment,
  Product,
  StaffInvitation,
  Subscription,
  SubscriptionPlan,
  User,
  Workspace,
  WorkspaceMembership,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const DEFAULT_WORKSPACE_ID = "aac3abe7-18b7-4c5f-a29e-786b63476459";

function isUuid(val: any): boolean {
  return typeof val === "string" && val.length === 36 && val.includes("-");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

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
  // Global Auth
  register: (data: {
    email: string;
    password: string;
    company_name?: string;
    first_name?: string;
    last_name?: string;
  }) =>
    request<{ access: string; user: User }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ status: string; access: string; user: User; workspaces: Workspace[] }>(
      "/auth/login/",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  getMe: () => request<User & { workspaces: Workspace[] }>("/auth/me/"),

  // Workspaces
  getWorkspaces: () =>
    request<Workspace[]>("/workspaces/").then((res) =>
      Array.isArray(res) ? res : (res as any).results || []
    ),
  createWorkspace: (data: { name: string; currency?: string; timezone?: string }) =>
    request<Workspace>("/workspaces/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getWorkspace: (workspaceId: string = DEFAULT_WORKSPACE_ID) =>
    request<Workspace>(`/workspaces/${workspaceId}/`),
  getWorkspaceMemberships: (workspaceId: string = DEFAULT_WORKSPACE_ID) =>
    request<WorkspaceMembership[]>(`/workspaces/${workspaceId}/memberships/`).then((r) =>
      Array.isArray(r) ? r : (r as any).results || []
    ),
  inviteStaff: (workspaceId: string, data: { email: string; role: "ADMIN" | "STAFF" }) =>
    request<StaffInvitation>(`/workspaces/${workspaceId}/invitations/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getWorkspaceInvitations: (workspaceId: string = DEFAULT_WORKSPACE_ID) =>
    request<StaffInvitation[]>(`/workspaces/${workspaceId}/invitations/`).then((r) =>
      Array.isArray(r) ? r : (r as any).results || []
    ),
  acceptInvitation: (data: {
    token: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) =>
    request<{ status: string; access: string; user: User; workspace: Workspace }>(
      "/invitations/accept/",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Workspace-Scoped Reporting Dashboard
  getDashboard: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ status: string; data: DashboardMetrics }>(
      `/workspaces/${ws}/dashboard/summary/`
    ).then((r) => r.data);
  },

  // Subscriptions
  getSubscriptions: (arg1?: any, arg2?: string) => {
    let ws = DEFAULT_WORKSPACE_ID;
    let statusFilter: string | undefined;

    if (isUuid(arg1)) {
      ws = arg1;
      statusFilter = arg2;
    } else if (typeof arg1 === "string" && arg1 !== "all") {
      statusFilter = arg1;
    }

    const query = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
    return request<{ results: Subscription[]; count: number }>(
      `/workspaces/${ws}/subscriptions/${query}`
    ).then((r) => r.results || (r as unknown as Subscription[]));
  },
  getSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/`);
  },
  confirmSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/confirm/`, {
      method: "POST",
    });
  },
  pauseSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/pause/`, {
      method: "POST",
    });
  },
  resumeSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/resume/`, {
      method: "POST",
    });
  },
  closeSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/close/`, {
      method: "POST",
    });
  },
  transitionSubscription: (id: string, target_status: string) => {
    if (target_status === "active") return api.confirmSubscription(id);
    if (target_status === "paused") return api.pauseSubscription(id);
    if (target_status === "closed") return api.closeSubscription(id);
    return api.confirmSubscription(id);
  },

  // Invoices & Billing
  getInvoices: (arg1?: any, arg2?: boolean) => {
    let ws = DEFAULT_WORKSPACE_ID;
    let overdueOnly = false;

    if (isUuid(arg1)) {
      ws = arg1;
      overdueOnly = !!arg2;
    } else if (typeof arg1 === "boolean") {
      overdueOnly = arg1;
    }

    const query = overdueOnly ? "?status=confirmed" : "";
    return request<{ results: Invoice[]; count: number }>(
      `/workspaces/${ws}/invoices/${query}`
    ).then((r) => r.results || (r as unknown as Invoice[]));
  },
  confirmInvoice: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Invoice>(`/workspaces/${ws}/invoices/${id}/actions/confirm/`, {
      method: "POST",
    });
  },
  cancelInvoice: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Invoice>(`/workspaces/${ws}/invoices/${id}/actions/cancel/`, {
      method: "POST",
    });
  },
  triggerBillingRun: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ status: string; generated_count: number; message: string }>(
      `/workspaces/${ws}/invoices/trigger-run/`,
      { method: "POST" }
    );
  },

  // Products & Plans
  getProducts: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: Product[]; count: number }>(`/workspaces/${ws}/products/`).then(
      (r) => r.results || (r as unknown as Product[])
    );
  },
  getPlans: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: SubscriptionPlan[]; count: number }>(`/workspaces/${ws}/plans/`).then(
      (r) => r.results || (r as unknown as SubscriptionPlan[])
    );
  },

  // Customers
  getCustomers: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: Customer[]; count: number }>(`/workspaces/${ws}/customers/`).then(
      (r) => r.results || (r as unknown as Customer[])
    );
  },

  // Payments
  recordPayment: (
    arg1: any,
    arg2?: { invoice: string; amount: string; payment_method: string; reference?: string }
  ) => {
    let ws = DEFAULT_WORKSPACE_ID;
    let data: { invoice: string; amount: string; payment_method: string; reference?: string };

    if (isUuid(arg1) && arg2) {
      ws = arg1;
      data = arg2;
    } else {
      data = arg1;
    }

    return request<Payment>(`/workspaces/${ws}/payments/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Customer Portal
  getPortalMe: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Customer>(`/workspaces/${ws}/portal/me/`);
  },
  getPortalSubscriptions: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Subscription[]>(`/workspaces/${ws}/portal/subscriptions/`);
  },
  getPortalInvoices: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Invoice[]>(`/workspaces/${ws}/portal/invoices/`);
  },
  getPortalPayments: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Payment[]>(`/workspaces/${ws}/portal/payments/`);
  },
};
