# Brightloop Software — Subscription Management System

## Functional Requirements Specification & Source of Truth

**Document Version:** 2.0.0  
**Source Document:** `Subscription_Management_System_goal.pdf`  
**Target Organization:** Brightloop Software  
**Status:** Canonical Source of Truth

---

## 1. Executive Summary & Vision

Brightloop Software provides subscription-based software and service solutions ranging from monthly add-ons for small retail shops to complex annual enterprise contracts. The objective of this system is to replace error-prone spreadsheets, manual invoice drafting, disconnected payment reconciliations, and quarterly manual reports with a unified, high-performance digital backbone.

The system is architected to handle thousands of subscriptions with all dashboard and page responses strictly under two seconds.

---

## 2. Functional Requirements Matrix (The 12 Source Capabilities)

### 2.1 User Authentication and Registration

- **Customer Sign-Up**: Public self-registration via email, password, and company details.
- **Email Uniqueness**: Each email belongs to only one account.
- **Password Strength Rules**:
  - Minimum 8 characters.
  - At least one uppercase letter (`[A-Z]`).
  - At least one lowercase letter (`[a-z]`).
  - At least one special character (`[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]`).
- **Password Reset**: Cryptographically secure token delivered to the registered email address.
- **Secure Browser Authentication**: Access tokens short-lived; refresh tokens stored securely in httpOnly cookies (never stored long-lived in localStorage).

### 2.2 Role-Based Permissions & Access Control

- **Administrator**:
  - Full control of products, variants, subscription plans, tax rules, and discount rules.
  - Exclusively authorized to create, update, and deactivate internal staff accounts.
- **Internal Staff**:
  - Manage operational day-to-day workflows: draft/send quotations, manage subscription state transitions, confirm/cancel invoices, record payments.
  - Read-only access to catalog, plans, tax rules, and discount rules.
  - Denied access to manage other staff members or alter tax/discount configurations.
- **Customer (Portal)**:
  - Scoped strictly to their own account (`customer.user == request.user`).
  - Self-service visibility of their own subscriptions and invoices.
  - Permitted to trigger plan self-actions (pause or cancel) only when the assigned plan policy explicitly allows it.

### 2.3 Product Catalog & Variant Management

- **Products**: Name, Code/SKU, Product Type (`software`, `addon`, `service`, `physical`), Sales Price (Base), Cost Price, Notes, Is Active.
- **Modular Add-ons**: Distinct product types that customers can toggle on/off.
- **Product Variants**: Attribute-based variations with explicit price deltas (e.g., Attribute: `Brand`, Value: `Odoo Integration`, Price Delta: `+$560.00`).
- **Price Calculation**: $\text{Total Unit Price} = \text{Product Base Price} + \sum(\text{Variant Deltas})$.

### 2.4 Subscription Plans & Billing Intervals

- **Billing Intervals**: `daily`, `weekly`, `monthly`, `yearly`.
- **Plan Pricing**: Base plan recurring cost, minimum seat quantity.
- **Availability Window**: `start_date` and `end_date` governing plan purchase validity.
- **Configurable Lifecycle Policies**:
  - `auto_close_on_end`: Automatically closes subscription when contract expiry is reached.
  - `allow_early_close`: Governs whether staff or customer can terminate prior to expiry.
  - `allow_pause`: Governs whether subscription can be temporarily suspended.
  - `allow_renew`: Governs whether subscription can be renewed upon expiration.

### 2.5 Quotation Templates & Quotations

- **Quotation Templates**: Standardized reusable templates with pre-configured plans and line items.
- **Validity Window**: Configurable template validity in days (e.g., 15, 30, 60 days).
- **Quotations**: Formal offers linked to a customer, holding line items (products, variants, quantities, taxes, subtotals).

### 2.6 Subscription Lifecycle Management

- **Subscription Identifier**: Human-readable sequential reference (e.g., `SUB-2026-0001`).
- **Core Fields**: Customer reference, Plan reference, Start date, Expiry date, Next billing date, Payment terms (`due_on_receipt`, `net_15`, `net_30`, `net_60`).
- **Lifecycle State Machine**:
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longleftrightarrow \text{Paused} \longrightarrow \text{Closed}$$
- **State Validation Rules**: Transitions are strictly validated on the backend; arbitrary status changes via direct PATCH are rejected.

### 2.7 Automated Recurring Invoice Generation

- **Automated Billing Engine**: Executes on billing schedules to bill due subscriptions (`next_billing_date <= target_date`).
- **Pre-populated Invoices**: Automatically generates invoice headers, customer billing address, line items, taxes, and applied discounts.
- **Idempotency Guarantee**: Deterministic idempotency key (`sub_{subscription_id}_{billing_date}`) ensures nothing is billed twice or skipped.
- **Invoice Status Machine**:
  $$\text{Draft} \longrightarrow \text{Confirmed} \longrightarrow \text{Paid}$$
  $$\text{Draft / Confirmed} \longrightarrow \text{Cancelled}$$

### 2.8 Tax Calculation

- **Admin Configuration**: Configurable tax rules (e.g., Standard VAT 10%, Sales Tax 8%).
- **Calculation**: Automatically computed on line items and overall invoice subtotal during invoice generation.

### 2.9 Discount Rules & Application

- **Creation Authority**: Admin only.
- **Discount Types**: Percentage (`percentage`) or Fixed Amount (`fixed`).
- **Eligibility Conditions**: Minimum purchase threshold, minimum seat quantity, active date range (`start_date` to `end_date`), and usage limits (`max_uses`).
- **Scope**:
  - `product`: Applies to matching product lines.
  - `subscription`: Applies across whole subscription total.
- **Lifecycle**: Automatically applies on next generated invoice and deactivates when limits or expiry dates are met.

### 2.10 Payment Recording & Invoice Matching

- **Payment Attributes**: Invoice reference, Payment Method (`credit_card`, `bank_transfer`, `cash`, `check`, `online`), Amount, Date, Reference/Notes.
- **Atomic Balance Updates**:
  $$\text{Outstanding Balance} = \text{Invoice Total} - \sum(\text{Payments Received})$$
- **Automatic Settlement**: When $\text{Outstanding Balance} = \$0.00$, invoice status atomically transitions to `Paid`.
- **Overdue Detection**: An invoice is overdue when status is `Confirmed`, $\text{Outstanding Balance} > 0$, and $\text{Due Date} < \text{Current Date}$.

### 2.11 Customer Self-Service Portal

- Scoped self-service access for authenticated customers:
  - View assigned active subscriptions and line items.
  - Perform authorized lifecycle actions (e.g., pause or request cancellation if allowed by plan policy).
  - View invoice history, download invoice PDFs, and settle open balances online.

### 2.12 Revenue Analytics & Reporting

- Executive dashboard metrics:
  - Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR).
  - Active subscriptions count and status breakdown.
  - Total collected revenue and total outstanding receivables.
  - Overdue invoices count and total overdue amount.
  - Cash flow trends (last 6 months).
- Performance target: Sub-2-second query responses using single-roundtrip database SQL aggregations.
