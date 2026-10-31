export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone?: string;
  is_active: boolean;
  created_at: string;
  customer_id?: string;
  company_name?: string;
}

export interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  billing_address: string;
  tax_id: string;
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
  name: string;
  code: string;
  product_type: 'software' | 'addon' | 'service' | 'physical';
  sales_price: string;
  cost_price: string;
  notes: string;
  is_active: boolean;
  variants: ProductVariant[];
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  billing_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  cost: string;
  minimum_quantity: number;
  start_date: string | null;
  end_date: string | null;
  auto_close_on_end: boolean;
  allow_early_close: boolean;
  allow_pause: boolean;
  allow_renew: boolean;
  is_active: boolean;
}

export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'paused' | 'closed';

export interface SubscriptionLine {
  id: string;
  product: string;
  product_details?: Product;
  variant?: string | null;
  variant_details?: ProductVariant | null;
  quantity: number;
  unit_price: string;
  tax_rate: string;
  subtotal: string;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer: string;
  customer_details?: Customer;
  plan: string;
  plan_details?: SubscriptionPlan;
  status: SubscriptionStatus;
  start_date: string;
  expiry_date: string | null;
  next_billing_date: string | null;
  payment_terms: 'due_on_receipt' | 'net_15' | 'net_30' | 'net_60';
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  notes: string;
  lines: SubscriptionLine[];
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export interface InvoiceLine {
  id: string;
  description: string;
  product: string | null;
  product_details?: Product | null;
  variant: string | null;
  variant_details?: ProductVariant | null;
  quantity: number;
  unit_price: string;
  tax_amount: string;
  discount_amount: string;
  line_total: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  subscription: string | null;
  customer: string;
  customer_details?: Customer;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  outstanding_balance: string;
  is_overdue: boolean;
  idempotency_key: string | null;
  lines: InvoiceLine[];
  created_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  invoice: string;
  invoice_number: string;
  customer_name: string;
  amount: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'online' | 'other';
  payment_date: string;
  reference: string;
  notes: string;
}

export interface DashboardMetrics {
  kpis: {
    active_subscriptions: number;
    total_subscriptions: number;
    mrr: number;
    arr: number;
    total_revenue_collected: number;
    total_outstanding: number;
    overdue_invoices_count: number;
    overdue_amount: number;
  };
  status_distribution: {
    active: number;
    paused: number;
    quotation: number;
    closed: number;
  };
  revenue_trend: {
    month: string;
    revenue: number;
  }[];
}
