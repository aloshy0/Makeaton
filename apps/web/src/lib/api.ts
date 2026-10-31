import {
  ApiKey,
  ApprovalRequest,
  AuditLog,
  Customer,
  DashboardMetrics,
  Invoice,
  Payment,
  Product,
  Quotation,
  StaffInvitation,
  StaffPermission,
  Subscription,
  SubscriptionPlan,
  User,
  WebhookDelivery,
  WebhookEndpoint,
  Workspace,
  WorkspaceMembership,
  FlowGridPlan,
  FlowGridSubscription,
  FlowGridPaymentMethod,
  FlowGridInvoice,
  PersonalDashboardData,
} from "../types";
import {
  DUMMY_API_KEYS,
  DUMMY_APPROVAL_REQUESTS,
  DUMMY_AUDIT_LOGS,
  DUMMY_CUSTOMERS,
  DUMMY_INVOICES,
  DUMMY_MEMBERSHIPS,
  DUMMY_METRICS,
  DUMMY_PAYMENTS,
  DUMMY_PLANS,
  DUMMY_PRODUCTS,
  DUMMY_SUBSCRIPTIONS,
  DUMMY_WEBHOOKS,
  DUMMY_WORKSPACES,
} from "./dummy-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const DEFAULT_WORKSPACE_ID = "aac3abe7-18b7-4c5f-a29e-786b63476459";
let pendingRefresh: Promise<string | null> | null = null;

export class ApiRequestError extends Error {
  code?: string;
  details: Record<string, unknown>;
  status: number;

  constructor(message: string, status: number, details: Record<string, unknown>) {
    super(message);
    this.name = "ApiRequestError";
    this.code = typeof details.code === "string" ? details.code : undefined;
    this.details = details;
    this.status = status;
  }
}

export interface AuthenticationResponse {
  status: string;
  access: string;
  user: User;
  workspaces: Workspace[];
  is_new_user?: boolean;
}

export interface PortalOffer {
  id: string;
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  value: string;
  min_purchase_amount: string;
  start_date: string | null;
  end_date: string | null;
  scope: "product" | "subscription";
  subscription_id: string;
  subscription_number: string;
  subscription_name: string;
  workspace_id: string;
  workspace_name: string;
}

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

  const isAuthPublicEndpoint = [
    "/auth/login/",
    "/auth/register/",
    "/auth/google/",
    "/auth/token/refresh/",
  ].some((authPath) => path.endsWith(authPath));

  if (token && !isAuthPublicEndpoint) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, { credentials: "include", ...options, headers });
  const skipsRefresh = [
    "/auth/login/",
    "/auth/register/",
    "/auth/google/",
    "/auth/logout/",
    "/auth/token/refresh/",
  ].some((authPath) => path.endsWith(authPath));
  if (res.status === 401 && !skipsRefresh && typeof window !== "undefined") {
    pendingRefresh ??= fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (refreshResponse) => {
        if (!refreshResponse.ok) return null;
        const refreshed = (await refreshResponse.json()) as { access?: string };
        if (!refreshed.access) return null;
        window.localStorage.setItem("access_token", refreshed.access);
        return refreshed.access;
      })
      .catch(() => null)
      .finally(() => {
        pendingRefresh = null;
      });
    const refreshedAccess = await pendingRefresh;
    if (refreshedAccess) {
      headers["Authorization"] = `Bearer ${refreshedAccess}`;
      res = await fetch(url, { credentials: "include", ...options, headers });
    }
  }
  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const message =
      (typeof errorBody.error === "string" && errorBody.error) ||
      (typeof errorBody.detail === "string" && errorBody.detail) ||
      `Request failed with status ${res.status}`;
    throw new ApiRequestError(message, res.status, errorBody);
  }
  return res.json();
}

export const api = {
  // Global Auth
  getUserContexts: () =>
    request<{
      personal_customer_context?: {
        linked_businesses?: Array<{ workspace_id: string; workspace_name: string }>;
      };
    }>("/auth/me/contexts/"),

  register: (data: {
    email: string;
    password: string;
    company_name?: string;
    first_name?: string;
    last_name?: string;
  }) =>
    request<AuthenticationResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthenticationResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleLogin: (data: { code?: string; link_token?: string; password?: string }) =>
    request<AuthenticationResponse>("/auth/google/", {
      method: "POST",
      headers: { "X-Requested-With": "XmlHttpRequest" },
      body: JSON.stringify(data),
    }),

  logout: () => request<{ status: string; message: string }>("/auth/logout/", { method: "POST" }),

  getMe: () =>
    request<User & { workspaces: Workspace[] }>("/auth/me/").catch(() => ({
      id: "usr_mock_1",
      email: "owner@flowgrid.com",
      first_name: "Alexander",
      last_name: "Wright",
      role: "ADMIN" as const,
      is_active: true,
      owned_workspaces_count: 2,
      available_workspace_slots: 3,
      created_at: new Date().toISOString(),
      workspaces: DUMMY_WORKSPACES,
    })),

  setActiveContext: (data: { context_type: string; workspace_id?: string }) =>
    request<{ status: string; context_type: string; workspace_id?: string }>("/auth/context/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      status: "success",
      context_type: data.context_type,
      workspace_id: data.workspace_id,
    })),

  // FlowGrid Platform Account & Subscription
  getPlatformPlans: () =>
    request<FlowGridPlan[]>("/auth/platform-plans/").catch(() => [
      {
        id: "plan-basic",
        name: "Basic",
        slug: "basic",
        price: 0,
        currency: "USD",
        billing_interval: "monthly",
        max_workspaces: 1,
        max_products_per_workspace: 5,
        max_customers_per_workspace: 50,
        max_team_members: 1,
        features: ["1 Business Workspace", "5 Products", "50 Customers", "1 Team Member"],
        is_active: true,
      },
      {
        id: "plan-pro",
        name: "Pro",
        slug: "pro",
        price: 49,
        currency: "USD",
        billing_interval: "monthly",
        max_workspaces: 3,
        max_products_per_workspace: 25,
        max_customers_per_workspace: 500,
        max_team_members: 5,
        features: ["3 Business Workspaces", "25 Products", "500 Customers", "5 Team Members", "Automated Billing"],
        is_active: true,
      },
      {
        id: "plan-business",
        name: "Business",
        slug: "business",
        price: 149,
        currency: "USD",
        billing_interval: "monthly",
        max_workspaces: 9999,
        max_products_per_workspace: 9999,
        max_customers_per_workspace: 99999,
        max_team_members: 9999,
        features: ["Unlimited Workspaces", "Unlimited Products", "Unlimited Customers", "Unlimited Team Members", "Priority Support"],
        is_active: true,
      },
    ]),

  getPersonalDashboard: () =>
    request<PersonalDashboardData>("/auth/me/personal-dashboard/"),

  upgradePlatformPlan: (planSlug: string) =>
    request<{ status: string; message: string; flowgrid_plan: FlowGridPlan }>("/auth/me/upgrade-plan/", {
      method: "POST",
      body: JSON.stringify({ plan_slug: planSlug }),
    }),

  addPlatformPaymentMethod: (data: { brand: string; last4: string; exp_month: number; exp_year: number; is_default?: boolean }) =>
    request<FlowGridPaymentMethod>("/auth/me/payment-methods/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancelPlatformSubscription: () =>
    request<{ status: string; message: string }>("/auth/me/cancel-subscription/", {
      method: "POST",
    }),

  // Workspaces
  getWorkspaces: () =>
    request<Workspace[]>("/workspaces/")
      .then((res) => (Array.isArray(res) ? res : (res as any).results || DUMMY_WORKSPACES))
      .catch(() => DUMMY_WORKSPACES),

  createWorkspace: (data: {
    name: string;
    currency?: string;
    timezone?: string;
    business_type?: string;
    business_email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
  }) =>
    request<Workspace>("/workspaces/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      id: `ws-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      currency: data.currency || "USD",
      timezone: data.timezone || "America/New_York",
      business_type: data.business_type || "SaaS & Cloud",
      business_email: data.business_email,
      phone: data.phone,
      address: data.address,
      logo_url: data.logo_url,
      is_active: true,
      user_role: "OWNER" as const,
      active_members_count: 1,
      created_at: new Date().toISOString(),
    })),


  getWorkspace: (workspaceId: string = DEFAULT_WORKSPACE_ID) =>
    request<Workspace>(`/workspaces/${workspaceId}/`).catch(
      () => DUMMY_WORKSPACES.find((w) => w.id === workspaceId) || DUMMY_WORKSPACES[0]
    ),

  getWorkspaceMemberships: (workspaceId: string = DEFAULT_WORKSPACE_ID) =>
    request<WorkspaceMembership[]>(`/workspaces/${workspaceId}/memberships/`)
      .then((r) => (Array.isArray(r) ? r : (r as any).results || DUMMY_MEMBERSHIPS))
      .catch(() => DUMMY_MEMBERSHIPS),

  inviteStaff: (workspaceId: string, data: { email: string; role: "ADMIN" | "STAFF" }) =>
    request<StaffInvitation>(`/workspaces/${workspaceId}/invitations/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      id: `inv-${Date.now()}`,
      email: data.email,
      role: data.role,
      token: `token_demo_${Math.random().toString(36).substring(2, 10)}`,
      status: "PENDING" as const,
      expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    })),

  getWorkspaceInvitations: (workspaceId: string = DEFAULT_WORKSPACE_ID) =>
    request<StaffInvitation[]>(`/workspaces/${workspaceId}/invitations/`)
      .then((r) => (Array.isArray(r) ? r : (r as any).results || []))
      .catch(() => []),

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
    ).catch(() => ({
      status: "success",
      access: "mock_jwt_access_token_prototype",
      user: {
        id: `u-${Date.now()}`,
        email: "invited.staff@flowgrid.com",
        first_name: data.first_name || "Staff",
        last_name: data.last_name || "Member",
        role: "STAFF" as const,
        is_active: true,
        owned_workspaces_count: 0,
        available_workspace_slots: 5,
        created_at: new Date().toISOString(),
      },
      workspace: DUMMY_WORKSPACES[0],
    })),

  promoteAdmin: (workspaceId: string, memberId: string) =>
    request<{ status: string; message: string }>(
      `/workspaces/${workspaceId}/memberships/${memberId}/promote-admin/`,
      { method: "POST" }
    ).catch(() => ({ status: "success", message: "Promoted to ADMIN." })),

  demoteStaff: (workspaceId: string, memberId: string) =>
    request<{ status: string; message: string }>(
      `/workspaces/${workspaceId}/memberships/${memberId}/demote-staff/`,
      { method: "POST" }
    ).catch(() => ({ status: "success", message: "Demoted to STAFF." })),

  removeMember: (workspaceId: string, memberId: string) =>
    request<void>(`/workspaces/${workspaceId}/memberships/${memberId}/`, {
      method: "DELETE",
    }).catch(() => {}),

  getStaffPermissions: (workspaceId: string, memberId: string) =>
    request<StaffPermission>(
      `/workspaces/${workspaceId}/memberships/${memberId}/permissions/`
    ).catch(() => ({
      membership: memberId,
      profile: "OPERATIONS" as const,
      can_manage_products: true,
      can_manage_subscriptions: true,
      can_manage_invoices: true,
      can_record_payments: true,
      can_manage_customers: true,
      can_view_reports: false,
      can_execute_restricted_actions: false,
    })),

  updateStaffPermissions: (workspaceId: string, memberId: string, data: Partial<StaffPermission>) =>
    request<StaffPermission>(`/workspaces/${workspaceId}/memberships/${memberId}/permissions/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(() => data as StaffPermission),

  transferOwnership: (workspaceId: string, newOwnerEmail: string) =>
    request<{ status: string; message: string }>(`/workspaces/${workspaceId}/transfer-ownership/`, {
      method: "POST",
      body: JSON.stringify({ new_owner_email: newOwnerEmail }),
    }).catch(() => ({
      status: "success",
      message: `Ownership transferred to ${newOwnerEmail}.`,
    })),

  deactivateWorkspace: (workspaceId: string) =>
    request<{ status: string; message: string }>(`/workspaces/${workspaceId}/deactivate/`, {
      method: "POST",
    }).catch(() => ({ status: "success", message: "Workspace deactivated." })),

  // Reporting Dashboard
  getDashboard: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ status: string; data: DashboardMetrics }>(
      `/workspaces/${ws}/dashboard/summary/`
    )
      .then((r) => r.data || DUMMY_METRICS)
      .catch(() => DUMMY_METRICS);
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
    )
      .then((r) => r.results || (r as unknown as Subscription[]))
      .catch(() => {
        if (statusFilter && statusFilter !== "all") {
          return DUMMY_SUBSCRIPTIONS.filter((s) => s.status === statusFilter);
        }
        return DUMMY_SUBSCRIPTIONS;
      });
  },

  getSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/`).catch(
      () => DUMMY_SUBSCRIPTIONS.find((s) => s.id === id) || DUMMY_SUBSCRIPTIONS[0]
    );
  },

  createSubscription: (wsId: string, data: any) =>
    request<Subscription>(`/workspaces/${wsId}/subscriptions/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      ...DUMMY_SUBSCRIPTIONS[0],
      id: `sub-${Date.now()}`,
      subscription_number: `SUB-2026-000${DUMMY_SUBSCRIPTIONS.length + 1}`,
      customer: data.customer,
      plan: data.plan,
      status: "confirmed" as const,
      created_at: new Date().toISOString(),
    })),

  confirmSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/confirm/`, {
      method: "POST",
    }).catch(() => ({ ...DUMMY_SUBSCRIPTIONS[0], status: "active" as const }));
  },

  pauseSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/pause/`, {
      method: "POST",
    }).catch(() => ({ ...DUMMY_SUBSCRIPTIONS[0], status: "paused" as const }));
  },

  resumeSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/resume/`, {
      method: "POST",
    }).catch(() => ({ ...DUMMY_SUBSCRIPTIONS[0], status: "active" as const }));
  },

  closeSubscription: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Subscription>(`/workspaces/${ws}/subscriptions/${id}/actions/close/`, {
      method: "POST",
    }).catch(() => ({ ...DUMMY_SUBSCRIPTIONS[0], status: "closed" as const }));
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
    return request<{ results: Invoice[]; count: number }>(`/workspaces/${ws}/invoices/${query}`)
      .then((r) => r.results || (r as unknown as Invoice[]))
      .catch(() => {
        if (overdueOnly) {
          return DUMMY_INVOICES.filter((i) => i.is_overdue);
        }
        return DUMMY_INVOICES;
      });
  },

  createInvoice: (wsId: string, data: any) =>
    request<Invoice>(`/workspaces/${wsId}/invoices/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      ...DUMMY_INVOICES[0],
      id: `inv-${Date.now()}`,
      invoice_number: `INV-2026-000${DUMMY_INVOICES.length + 1}`,
      customer: data.customer,
      issue_date: data.issue_date,
      due_date: data.due_date,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount || "0.00",
      discount_amount: data.discount_amount || "0.00",
      total_amount: data.subtotal,
      outstanding_balance: data.subtotal,
      paid_amount: "0.00",
      status: "confirmed" as const,
      created_at: new Date().toISOString(),
    })),

  confirmInvoice: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Invoice>(`/workspaces/${ws}/invoices/${id}/actions/confirm/`, {
      method: "POST",
    }).catch(() => ({ ...DUMMY_INVOICES[1], status: "confirmed" as const }));
  },

  cancelInvoice: (idOrWs: string, maybeId?: string) => {
    const ws = maybeId ? idOrWs : DEFAULT_WORKSPACE_ID;
    const id = maybeId || idOrWs;
    return request<Invoice>(`/workspaces/${ws}/invoices/${id}/actions/cancel/`, {
      method: "POST",
    }).catch(() => ({ ...DUMMY_INVOICES[0], status: "cancelled" as const }));
  },

  triggerBillingRun: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ status: string; generated_count: number; message: string }>(
      `/workspaces/${ws}/invoices/trigger-run/`,
      { method: "POST" }
    ).catch(() => ({
      status: "success",
      generated_count: 2,
      message: "Automated billing run completed. 2 recurring invoices generated.",
    }));
  },

  // Products & Plans
  getProducts: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: Product[]; count: number }>(`/workspaces/${ws}/products/`)
      .then((r) => r.results || (r as unknown as Product[]))
      .catch(() => DUMMY_PRODUCTS);
  },

  createProduct: (wsId: string, data: any) =>
    request<Product>(`/workspaces/${wsId}/products/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      ...DUMMY_PRODUCTS[0],
      id: `prod-${Date.now()}`,
      name: data.name,
      code: data.code,
      sales_price: data.sales_price,
      cost_price: data.cost_price || "0.00",
      notes: data.notes || "",
      created_at: new Date().toISOString(),
    })),

  getPlans: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: SubscriptionPlan[]; count: number }>(`/workspaces/${ws}/plans/`)
      .then((r) => r.results || (r as unknown as SubscriptionPlan[]))
      .catch(() => DUMMY_PLANS);
  },

  getPublishedPlans: (wsId: string = DEFAULT_WORKSPACE_ID) =>
    request<SubscriptionPlan[]>(`/workspaces/${wsId}/plans/published/`).catch(() =>
      DUMMY_PLANS.filter((p) => p.is_active)
    ),

  createPlan: (wsId: string, data: any) =>
    request<SubscriptionPlan>(`/workspaces/${wsId}/plans/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      ...DUMMY_PLANS[0],
      id: `plan-${Date.now()}`,
      name: data.name,
      code: data.code,
      base_price: data.base_price,
      billing_interval: data.billing_interval,
      min_seats: data.min_seats || 1,
      created_at: new Date().toISOString(),
    })),

  // Customers
  getCustomers: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: Customer[]; count: number }>(`/workspaces/${ws}/customers/`)
      .then((r) => r.results || (r as unknown as Customer[]))
      .catch(() => DUMMY_CUSTOMERS);
  },

  createCustomer: (wsId: string, data: any) =>
    request<Customer>(`/workspaces/${wsId}/customers/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      ...DUMMY_CUSTOMERS[0],
      id: `cust-${Date.now()}`,
      company_name: data.company_name,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone || "",
      billing_address: data.billing_address || "",
      tax_id: data.tax_id || "",
      created_at: new Date().toISOString(),
    })),

  // Quotations
  getQuotations: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: Quotation[]; count: number }>(`/workspaces/${ws}/quotations/`)
      .then((r) => r.results || (r as unknown as Quotation[]))
      .catch(() => [
        {
          id: "quote-001",
          quotation_number: "QT-2026-0001",
          customer: "cust-001",
          customer_details: DUMMY_CUSTOMERS[0],
          plan: "plan-002",
          plan_details: DUMMY_PLANS[1],
          status: "sent" as const,
          valid_until: "2026-11-30",
          subtotal: "150.00",
          tax_amount: "15.00",
          total_amount: "165.00",
          lines: [],
          created_at: "2026-10-28T10:00:00Z",
        },
      ]);
  },

  approveQuotation: (wsId: string, quoteId: string) =>
    request<{ status: string; subscription_id: string }>(
      `/workspaces/${wsId}/quotations/${quoteId}/actions/approve/`,
      { method: "POST" }
    ).catch(() => ({ status: "success", subscription_id: "sub-001" })),

  // Payments
  getPayments: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<{ results: Payment[]; count: number }>(`/workspaces/${ws}/payments/`)
      .then((r) => r.results || (r as unknown as Payment[]))
      .catch(() => DUMMY_PAYMENTS);
  },

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
    }).catch(() => ({
      ...DUMMY_PAYMENTS[0],
      id: `pay-${Date.now()}`,
      payment_number: `PAY-2026-000${DUMMY_PAYMENTS.length + 1}`,
      amount: data.amount,
      payment_method: data.payment_method as any,
      reference: data.reference || "SIMULATED_PROTOTYPE_REF",
      created_at: new Date().toISOString(),
    }));
  },

  refundPayment: (wsId: string, paymentId: string, reason?: string) =>
    request<{ status: string; message: string }>(
      `/workspaces/${wsId}/payments/${paymentId}/actions/refund/`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    ).catch(() => ({ status: "success", message: "Payment refund processed." })),

  // Approval Requests
  getApprovalRequests: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<ApprovalRequest[]>(`/workspaces/${ws}/approval-requests/`)
      .then((r) => (Array.isArray(r) ? r : (r as any).results || DUMMY_APPROVAL_REQUESTS))
      .catch(() => DUMMY_APPROVAL_REQUESTS);
  },

  createApprovalRequest: (wsId: string, data: any) =>
    request<ApprovalRequest>(`/workspaces/${wsId}/approval-requests/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      ...DUMMY_APPROVAL_REQUESTS[0],
      id: `appr-${Date.now()}`,
      action_type: data.action_type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      payload: data.payload,
      status: "PENDING" as const,
      created_at: new Date().toISOString(),
    })),

  reviewApprovalRequest: (
    wsId: string,
    approvalId: string,
    action: "APPROVE" | "REJECT",
    rejectionReason?: string
  ) =>
    request<ApprovalRequest>(`/workspaces/${wsId}/approval-requests/${approvalId}/review/`, {
      method: "POST",
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    }).catch(() => ({
      ...DUMMY_APPROVAL_REQUESTS[0],
      id: approvalId,
      status: action === "APPROVE" ? ("APPROVED" as const) : ("REJECTED" as const),
      rejection_reason: rejectionReason,
      reviewed_at: new Date().toISOString(),
    })),

  // API Keys & Webhooks
  getApiKeys: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<ApiKey[]>(`/workspaces/${ws}/integrations/api-keys/`)
      .then((r) => (Array.isArray(r) ? r : (r as any).results || DUMMY_API_KEYS))
      .catch(() => DUMMY_API_KEYS);
  },

  createApiKey: (wsId: string, data: { name: string; expires_in_days?: number }) =>
    request<ApiKey & { secret: string }>(`/workspaces/${wsId}/integrations/api-keys/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      id: `key-${Date.now()}`,
      name: data.name,
      key_prefix: "brk_live_demo",
      secret: `brk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      is_active: true,
      created_at: new Date().toISOString(),
    })),

  revokeApiKey: (wsId: string, keyId: string) =>
    request<{ status: string; message: string }>(
      `/workspaces/${wsId}/integrations/api-keys/${keyId}/revoke/`,
      { method: "POST" }
    ).catch(() => ({ status: "success", message: "API Key revoked." })),

  rotateApiKey: (wsId: string, keyId: string) =>
    request<ApiKey & { secret: string }>(
      `/workspaces/${wsId}/integrations/api-keys/${keyId}/rotate/`,
      { method: "POST" }
    ).catch(() => ({
      id: keyId,
      name: "Rotated Key",
      key_prefix: "brk_live_rot",
      secret: `brk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      is_active: true,
      created_at: new Date().toISOString(),
    })),

  getWebhooks: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<WebhookEndpoint[]>(`/workspaces/${ws}/integrations/webhooks/`)
      .then((r) => (Array.isArray(r) ? r : (r as any).results || DUMMY_WEBHOOKS))
      .catch(() => DUMMY_WEBHOOKS);
  },

  createWebhook: (wsId: string, data: { url: string; events: string[] }) =>
    request<WebhookEndpoint>(`/workspaces/${wsId}/integrations/webhooks/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      id: `wh-${Date.now()}`,
      url: data.url,
      secret: `whsec_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      events: data.events,
      is_active: true,
      created_at: new Date().toISOString(),
    })),

  deleteWebhook: (wsId: string, webhookId: string) =>
    request<void>(`/workspaces/${wsId}/integrations/webhooks/${webhookId}/`, {
      method: "DELETE",
    }).catch(() => {}),

  getWebhookDeliveries: (wsId: string, webhookId: string) =>
    request<WebhookDelivery[]>(
      `/workspaces/${wsId}/integrations/webhooks/${webhookId}/deliveries/`
    ).catch(() => [
      {
        id: "del-001",
        endpoint: webhookId,
        event_type: "subscription.activated",
        payload: { subscription_id: "sub-001", customer: "Acme Global" },
        status_code: 200,
        response_body: '{"received": true}',
        delivered: true,
        attempt_count: 1,
        created_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
      },
    ]),

  retryWebhookDelivery: (wsId: string, webhookId: string, deliveryId: string) =>
    request<{ status: string; message: string; delivery: WebhookDelivery }>(
      `/workspaces/${wsId}/integrations/webhooks/${webhookId}/deliveries/${deliveryId}/retry/`,
      { method: "POST" }
    ).catch(() => ({
      status: "success",
      message: "Delivery retried.",
      delivery: {
        id: deliveryId,
        endpoint: webhookId,
        event_type: "subscription.activated",
        payload: {},
        status_code: 200,
        delivered: true,
        attempt_count: 2,
        created_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
      },
    })),

  // External Checkout Session
  createCheckoutSession: (
    wsId: string,
    data: { plan_id: string; customer_email: string; customer_name?: string }
  ) =>
    request<{
      status: string;
      session_id: string;
      workspace_id: string;
      plan_id: string;
      customer_email: string;
      checkout_url: string;
    }>(`/workspaces/${wsId}/checkout/sessions/`, {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => ({
      status: "success",
      session_id: `cs_demo_${Math.random().toString(36).substring(2, 12)}`,
      workspace_id: wsId,
      plan_id: data.plan_id,
      customer_email: data.customer_email,
      checkout_url: `/checkout/cs_demo_${Math.random().toString(36).substring(2, 12)}`,
    })),

  // Audit Logs
  getAuditLogs: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<AuditLog[]>(`/workspaces/${ws}/audit-logs/`)
      .then((r) => (Array.isArray(r) ? r : (r as any).results || DUMMY_AUDIT_LOGS))
      .catch(() => DUMMY_AUDIT_LOGS);
  },

  // Customer Portal
  getPortalMe: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Customer>(`/workspaces/${ws}/portal/me/`).catch(() => DUMMY_CUSTOMERS[0]);
  },
  getPortalSubscriptions: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Subscription[]>(`/workspaces/${ws}/portal/subscriptions/`).catch(() =>
      DUMMY_SUBSCRIPTIONS.filter((s) => s.customer === "cust-001")
    );
  },
  getPortalOffers: (workspaceId: string) =>
    request<PortalOffer[]>(`/workspaces/${workspaceId}/portal/offers/`),
  getPortalInvoices: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Invoice[]>(`/workspaces/${ws}/portal/invoices/`).catch(() =>
      DUMMY_INVOICES.filter((i) => i.customer === "cust-001")
    );
  },
  getPortalPayments: (wsIdOrContext?: any) => {
    const ws = isUuid(wsIdOrContext) ? wsIdOrContext : DEFAULT_WORKSPACE_ID;
    return request<Payment[]>(`/workspaces/${ws}/portal/payments/`).catch(() => DUMMY_PAYMENTS);
  },
};
