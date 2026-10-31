export type GlobalRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type WorkspaceRole = "OWNER" | "ADMIN" | "STAFF" | "CUSTOMER";
export type SubscriptionStatus =
  "draft" | "quotation" | "confirmed" | "active" | "past_due" | "paused" | "closed" | "expired";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: GlobalRole;
  phone?: string;
  is_active: boolean;
  owned_workspaces_count: number;
  available_workspace_slots: number;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  user_role?: WorkspaceRole;
  active_members_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace: string;
  user: User;
  role: WorkspaceRole;
  status: "ACTIVE" | "SUSPENDED";
  joined_at: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: "ADMIN" | "STAFF";
  token?: string;
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
  status:
    "draft" | "quotation" | "confirmed" | "active" | "past_due" | "paused" | "closed" | "expired";
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

export interface DashboardMetrics {
  mrr: number;
  arr: number;
  total_subscriptions: number;
  active_subscriptions: number;
  paused_subscriptions: number;
  quotations_count: number;
  closed_subscriptions: number;
  total_invoices: number;
  total_collected_revenue: number;
  total_outstanding_receivables: number;
  overdue_invoices_count: number;
  total_overdue_amount: number;
  cashflow_trends: Array<{
    month: string;
    amount: number;
  }>;
}
