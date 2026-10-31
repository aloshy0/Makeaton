export type GlobalRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type WorkspaceRole = "OWNER" | "ADMIN" | "STAFF" | "CUSTOMER";
export type SubscriptionStatus =
  "draft" | "quotation" | "confirmed" | "active" | "past_due" | "paused" | "closed" | "expired";

export interface FlowGridPlanSummary {
  name: string;
  slug: string;
  price: string;
  currency: string;
  billing_interval: string;
  max_workspaces: number;
  max_products_per_workspace: number;
  max_customers_per_workspace: number;
  max_team_members: number;
  features: string[];
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  role: GlobalRole;
  phone?: string;
  is_active: boolean;
  owned_workspaces_count: number;
  available_workspace_slots: number;
  max_workspaces?: number;
  flowgrid_plan?: FlowGridPlanSummary;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  business_type?: string;
  business_email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  is_active: boolean;
  user_role?: WorkspaceRole;
  permissions?: {
    can_manage_products?: boolean;
    can_manage_subscriptions?: boolean;
    can_manage_invoices?: boolean;
    can_record_payments?: boolean;
    can_manage_customers?: boolean;
    can_view_reports?: boolean;
    can_manage_team?: boolean;
    can_manage_settings?: boolean;
  };
  active_members_count?: number;
  description?: string;
  last_accessed?: string;
  created_at: string;
  updated_at?: string;
}

export interface StaffPermission {
  membership: string;
  profile: "READ_ONLY" | "OPERATIONS" | "CUSTOM";
  can_manage_products: boolean;
  can_manage_subscriptions: boolean;
  can_manage_invoices: boolean;
  can_record_payments: boolean;
  can_manage_customers: boolean;
  can_view_reports: boolean;
  can_execute_restricted_actions: boolean;
  updated_at?: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace: string;
  workspace_details?: Workspace;
  user: User;
  role: WorkspaceRole;
  status: "ACTIVE" | "SUSPENDED";
  joined_at: string;
  permissions?: StaffPermission;
}

export interface StaffInvitation {
  id: string;
  workspace?: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  token?: string;
  invited_by?: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expires_at: string;
  created_at: string;
}

export interface Customer {
  id: string;
  workspace?: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  billing_address: string;
  tax_id: string;
  is_active?: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  attribute_name: string;
  attribute_value: string;
  price_delta: string;
}

export interface Product {
  id: string;
  workspace?: string;
  name: string;
  code: string;
  product_type: "software" | "addon" | "service" | "physical";
  sales_price: string;
  cost_price: string;
  notes: string;
  is_active: boolean;
  variants: ProductVariant[];
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  workspace?: string;
  name: string;
  code: string;
  billing_interval: "daily" | "weekly" | "monthly" | "yearly";
  billing_frequency?: string;
  base_price: string;
  cost?: string;
  min_seats: number;
  start_date?: string;
  end_date?: string;
  auto_close_on_end: boolean;
  allow_early_close: boolean;
  allow_pause: boolean;
  allow_renew: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionLine {
  id: string;
  subscription: string;
  product: string;
  product_details?: Product;
  variant?: string;
  variant_details?: ProductVariant;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface SubscriptionEvent {
  id: string;
  previous_status: string;
  new_status: string;
  changed_by_email?: string;
  reason?: string;
  timestamp: string;
}

export interface Subscription {
  id: string;
  workspace?: string;
  subscription_number: string;
  customer: string;
  customer_details?: Customer;
  plan: string;
  plan_details?: SubscriptionPlan;
  status: SubscriptionStatus;
  start_date: string;
  expiry_date?: string;
  next_billing_date?: string;
  payment_terms: "due_on_receipt" | "net_15" | "net_30" | "net_60";
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  notes?: string;
  lines: SubscriptionLine[];
  events?: SubscriptionEvent[];
  created_at: string;
}

export interface QuotationLine {
  id: string;
  quotation: string;
  product: string;
  product_details?: Product;
  variant?: string;
  variant_details?: ProductVariant;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Quotation {
  id: string;
  workspace?: string;
  quotation_number: string;
  customer: string;
  customer_details?: Customer;
  template?: string;
  plan?: string;
  plan_details?: SubscriptionPlan;
  status: "draft" | "sent" | "approved" | "rejected" | "converted";
  valid_until: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  lines: QuotationLine[];
  created_at: string;
}

export interface QuotationTemplate {
  id: string;
  workspace?: string;
  name: string;
  description: string;
  default_payment_terms: string;
  default_validity_days: number;
  is_active: boolean;
  created_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice: string;
  description: string;
  product?: string;
  product_details?: Product;
  variant?: string;
  variant_details?: ProductVariant;
  quantity: number;
  unit_price: string;
  tax_amount: string;
  discount_amount: string;
  line_total: string;
  subtotal: string;
}

export interface Invoice {
  id: string;
  workspace?: string;
  invoice_number: string;
  subscription?: string;
  customer: string;
  customer_details?: Customer;
  issue_date: string;
  due_date: string;
  status: "draft" | "confirmed" | "paid" | "cancelled";
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  outstanding_balance: string;
  notes?: string;
  idempotency_key?: string;
  is_overdue?: boolean;
  lines: InvoiceLine[];
  created_at: string;
}

export interface Payment {
  id: string;
  workspace?: string;
  payment_number: string;
  invoice: string;
  invoice_number?: string;
  customer_name?: string;
  amount: string;
  payment_method: "credit_card" | "bank_transfer" | "cash" | "check" | "online" | "other";
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  workspace: string;
  requested_by: string;
  requested_by_email?: string;
  reviewed_by?: string;
  reviewed_by_email?: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, any>;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  secret?: string; // only present upon creation/rotation
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  endpoint: string;
  event_type: string;
  payload: Record<string, any>;
  status_code?: number;
  response_body?: string;
  delivered: boolean;
  attempt_count: number;
  created_at: string;
  delivered_at?: string;
}

export interface AuditLog {
  id: string;
  workspace?: string;
  user?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface DashboardMetrics {
  mrr: string;
  arr: string;
  total_subscriptions: number;
  active_subscriptions: number;
  paused_subscriptions: number;
  quotations_count: number;
  closed_subscriptions: number;
  total_invoices: number;
  total_collected_revenue: string;
  total_outstanding_receivables: string;
  overdue_invoices_count: number;
  total_overdue_amount: string;
  cashflow_trends: Array<{
    month: string;
    amount: string;
  }>;
}

export interface FlowGridPlan {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  currency: string;
  billing_interval: string;
  max_workspaces: number;
  max_products_per_workspace: number;
  max_customers_per_workspace: number;
  max_team_members: number;
  features: string[];
  is_active: boolean;
}

export interface FlowGridSubscription {
  id: string | null;
  status: "active" | "past_due" | "canceled" | "trialing";
  renewal_date: string;
  next_billing_date: string;
  cancel_at_period_end: boolean;
}

export interface FlowGridPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}

export interface FlowGridInvoice {
  id: string;
  invoice_number: string;
  amount: string | number;
  currency: string;
  status: "paid" | "open" | "void";
  plan_name: string;
  paid_at: string;
  created_at: string;
}

export interface PersonalDashboardData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    created_at: string;
  };
  flowgrid_plan: FlowGridPlan;
  flowgrid_subscription: FlowGridSubscription;
  usage_limits: {
    workspaces: {
      current: number;
      max: number;
      available_slots: number;
      percentage: number;
    };
    products_per_workspace: {
      max: number;
      total_across_workspaces: number;
    };
    customers_per_workspace: {
      max: number;
      total_across_workspaces: number;
    };
  };
  owned_workspaces: Workspace[];
  payment_methods: FlowGridPaymentMethod[];
  invoices: FlowGridInvoice[];
}
