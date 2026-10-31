# Brightloop Software — Subscription Management System
## Requirements Specification & Source of Truth

**Document Version:** 1.0.0  
**Source Document:** `Subscription_Management_System_goal.pdf`  
**Target Organization:** Brightloop Software  
**Status:** Approved for Implementation

---

## 1. Executive Summary & Vision

Brightloop Software provides subscription-based software and service solutions ranging from monthly add-ons for small retail shops to complex annual enterprise contracts. The objective of this system is to replace error-prone spreadsheets, manual invoice drafting, disconnected payment reconciliations, and quarterly manual reports with a unified, high-performance digital backbone.

The system handles the entire lifecycle of recurring revenue:
1. Catalog management (Products, Variants, Plans).
2. Quotations and templates.
3. Subscription lifecycle state transitions.
4. Automated recurring invoice generation and tax calculation.
5. Discount rules and automatic application.
6. Multi-method payment recording and overdue tracking.
7. Executive financial dashboards, real-time metrics, and customer self-service portals.

---

## 2. User Roles & Permission Matrix

| Capability / Resource | Admin | Internal Staff | Customer (Portal) |
|---|:---:|:---:|:---:|
| User / Staff Management | Full (Create, Edit, Deactivate) | None | None |
| Product Catalog & Variants | Full (Create, Edit, Archive) | Read-only | Read-only (Public plans) |
| Subscription Plans & Policies | Full (Pricing, Intervals, Rules) | Read-only | View assigned/available |
| Quotations & Templates | Full | Full (Draft, Send to Customer) | View & Accept |
| Subscriptions Lifecycle | Full | Full (Draft, Quote, Confirm, Close) | View own, Request changes |
| Invoice Generation & Review | Full | Full (Confirm, Send, Print) | View & Download own |
| Tax & Discount Rules | Full (Define rates, limits) | View & Apply | View applied discounts |
| Payment Recording | Full | Full (Record against invoices) | View own payment history |
| Financial Reporting & KPIs | Full (MRR, ARR, Overdue, Revenue) | Operational summary | None |

### Password & Security Constraints (PDF Requirement)
- **Customer Sign-Up**: Unique email per account.
- **Password Strength**: Minimum 8 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 special character (`[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]`).
- **Password Reset**: Secure token delivered to registered email.
- **Token Security**: SimpleJWT with secure token strategy (access tokens short-lived; refresh tokens stored securely in httpOnly cookies, never stored long-lived in localStorage).

---

## 3. Product Catalog, Variants & Plans

### 3.1 Products
- **Fields**: Name, Code/SKU, Product Type (`software`, `addon`, `service`, `physical`), Sales Price (Base), Cost Price, Notes, Is Active.
- Supports recurring add-ons that customers can toggle on/off.

### 3.2 Variants
- Variants allow pricing adjustments based on configuration attributes (e.g., Attribute: `Brand`, Value: `Odoo`, Price Delta: `+560.00`).
- Total Base Unit Price = Product Base Price + Sum(Variant Deltas).

### 3.3 Subscription Plans
- **Billing Intervals**: `daily`, `weekly`, `monthly`, `yearly`.
- **Pricing & Quantities**: Plan Cost, Minimum Quantity.
- **Availability Window**: `start_date` and `end_date` for when the plan can be purchased.
- **Configurable Lifecycle Policies**:
  - `auto_close_on_end`: Automatically close subscription upon reaching expiry.
  - `allow_early_close`: Whether customer or staff can terminate before term completion.
  - `allow_pause`: Whether subscription can be suspended temporarily.
  - `allow_renew`: Whether subscription can be automatically or manually extended.

---

## 4. Quotations, Templates & Subscription Lifecycle

### 4.1 Quotation Templates
- Standardized templates with predefined plans and product line items.
- Validity window specified in days (e.g., valid for 15, 30, or 60 days).

### 4.2 Subscriptions
- **Fields**:
  - Subscription Reference Number (e.g., `SUB-2026-0001`).
  - Customer reference.
  - Subscription Plan reference.
  - Start Date, Expiry Date.
  - Payment Terms (`due_on_receipt`, `net_15`, `net_30`, `net_60`).
  - Status.
- **Line Items**:
  - Product reference + selected Variant reference.
  - Quantity, Unit Price (base + variant adjustment).
  - Applied Tax Rate, Applied Discount.
  - Total Line Amount.
- **Lifecycle State Machine**:
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longleftrightarrow \text{Paused} \longrightarrow \text{Closed}$$
  - **Draft**: Sales rep / customer drafts terms.
  - **Quotation**: Formal offer with fixed validity expiration.
  - **Confirmed**: Customer or sales agreement finalized.
  - **Active**: Plan is running; recurring invoices generate automatically.
  - **Paused**: Temporarily halted (if plan allows `allow_pause`).
  - **Closed**: Term completed, cancelled early (if `allow_early_close`), or expired.

---

## 5. Billing, Invoices & Taxes

### 5.1 Automated Billing Run
- Triggered on billing schedule (via Celery beat or manual on-demand execution).
- Collects all active subscriptions due for billing on or before target date.
- Generates invoice pre-populated with customer billing details, line items, taxes, and discounts.
- **Idempotency Guarantee**: Ensures subscriptions are never billed twice for the same billing cycle or skipped.

### 5.2 Taxes
- Admin-configured tax rules (e.g., Standard VAT 18%, Sales Tax 10%, Zero-rated).
- Applied per line item or overall invoice.

### 5.3 Invoice Status Workflow
$$\text{Draft} \longrightarrow \text{Confirmed} \longrightarrow \text{Paid}$$
$$\text{Draft / Confirmed} \longrightarrow \text{Cancelled}$$
- Staff actions: Confirm, Cancel, Send (Notification / Email), Print (PDF view).

---

## 6. Discounts & Promotions

- **Creation Authority**: Admin only.
- **Discount Types**: Fixed Amount (`fixed`) or Percentage (`percentage`).
- **Eligibility Conditions**:
  - Minimum purchase total or minimum quantity.
  - Date validity window: `start_date` to `end_date`.
  - Max usage count (`max_uses`) vs current usage (`times_used`).
- **Application Scope**:
  - `product`: Applies to matching product lines.
  - `subscription`: Applies across the total subscription invoice.
- **Lifecycle**: Automatically applies on invoice generation; automatically deactivates when limits or expiry dates are exceeded.

---

## 7. Payments & Overdue Tracking

- **Fields**: Invoice reference, Payment Method (`credit_card`, `bank_transfer`, `cash`, `check`, `online`), Amount, Date, Reference / Notes.
- **Reconciliation**:
  - Outstanding Balance = $\text{Invoice Total} - \sum(\text{Payments Received})$.
  - When Outstanding Balance $= 0.00$, invoice status transitions to `Paid`.
- **Overdue Detection**:
  - An invoice is classified as `Overdue` when status is `Confirmed`, balance $> 0.00$, and $\text{Due Date} < \text{Current Date}$.

---

## 8. Reporting & Performance Targets

### 8.1 Key Metrics
- Active Subscriptions Count.
- Monthly Recurring Revenue (MRR) & Annual Recurring Revenue (ARR).
- Total Collected Revenue.
- Total Outstanding Balance.
- Overdue Invoices Count & Aging Breakdown.

### 8.2 Performance SLA
- Response time **under 2.0 seconds** for all listing and dashboard views with thousands of records.
- Optimized query patterns: Database indexes on `(status, created_at)`, `customer_id`, `subscription_id`, `due_date`; consolidated aggregation queries (`/api/v1/reporting/dashboard/`).
