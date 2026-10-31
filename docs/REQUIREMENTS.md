# Brightloop Software — Multi-Tenant Subscription SaaS Platform

## Functional Requirements Specification & Source of Truth

**Document Version:** 3.0.0 (Multi-Tenant SaaS Architecture)  
**System Model:** Multi-Tenant Modular Monolith  
**Status:** Authoritative Canonical Source of Truth

---

## 1. Executive Summary & Product Goal

The platform enables any user to register an account and instantly launch and operate their own subscription business.

Rather than serving a single fixed organization, the system operates as a **secure multi-tenant SaaS platform**. Each business operates within an independent **Workspace**.

### Core Creator Capabilities:

1. **Personal Account Creation**: Universal user account with email authentication.
2. **Business Workspaces**: Any user can become a business creator and own up to **five (5) independent business workspaces**, enforced transactionally at the database level.
3. **Workspace Configuration**: Independent configuration per business (currency, tax rules, discount rules, products, plans).
4. **Staff Management & Invitations**: Invite team members with workspace-scoped roles (`ADMIN`, `STAFF`) via secure expiring tokens. Staff have defined privileges and require Admin approval for sensitive actions.
5. **Customer Management**: Add customers and link user accounts to workspace-specific customer profiles.
6. **Quotations & Subscriptions**: Generate custom quotes, templates, and transition subscriptions through explicit lifecycles.
7. **Automated Recurring Invoicing**: Scheduled billing engine generating deterministic invoices per workspace.
8. **Payment Settlement & Overdue Tracking**: Record payments, track outstanding receivables, and detect overdue accounts.
9. **Executive Reporting**: Workspace-scoped financial metrics (MRR, ARR, Cashflow, Aging Receivables) with sub-2-second response times.
10. **Customer Self-Service Portal**: Customers log in, view their assigned workspace subscriptions, download invoices, and execute permitted renewal actions.

---

## 2. Multi-Tenant Identity, Workspaces & Permissions

### 2.1 Identity Hierarchy

- **Global User (`User`)**:
  - Global identity defined by email, password hash, first/last name, and status.
  - Participates across multiple workspaces with distinct roles.
- **Workspace (`Workspace`)**:
  - Isolated tenant boundary. Has slug, name, currency, timezone, settings, and owner (`created_by`).
  - Owner limit: Maximum 5 owned workspaces per user.
- **Workspace Membership (`WorkspaceMembership`)**:
  - Maps `(user, workspace)` with a workspace-scoped role (`OWNER`, `ADMIN`, `STAFF`, `CUSTOMER`).
  - Stores membership status (`ACTIVE`, `SUSPENDED`).
- **Staff Invitation (`StaffInvitation`)**:
  - Secure, expiring token-based invitation sent by Owner/Admin.
  - Recipient establishes their own password securely upon accepting the invitation.
- **Customer Profile (`CustomerProfile`) & Link (`CustomerUserLink`)**:
  - Workspace-specific customer entity.
  - Linked to a global user account so customers can log in to view their workspace-specific subscriptions and invoices.

### 2.2 Workspace Roles & Access Control Matrix

| Role         | Scope            | Permissions & Operational Powers                                                                                                                          | Sensitive Action Approval                                                                                          |
| :----------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **OWNER**    | Workspace        | Full control over workspace settings, billing plans, membership, invitations, catalog, and finances. Can transfer or delete workspace.                    | Self-approving authority.                                                                                          |
| **ADMIN**    | Workspace        | Manage catalog, plans, tax/discount rules, staff invitations, customer accounts, quotations, subscriptions, and financial records.                        | Approves staff requests; cannot delete workspace.                                                                  |
| **STAFF**    | Workspace        | Operational tasks: create quotations, manage day-to-day subscription states, record payments, view invoices. Read-only on catalog and tax/discount rules. | **Limited Power**: Discounts exceeding standard rules, cancellations, and write-offs require Admin/Owner approval. |
| **CUSTOMER** | Workspace Portal | View own profile, assigned subscriptions, invoice history, payment records, and execute allowed renewal actions (pause, cancel, renew) per plan policy.   | Strictly isolated to their own customer record.                                                                    |

---

## 3. Workspace-Scoped Business Modules

### 3.1 Product Catalog & Variant Pricing

- **Products**: Scoped to workspace. SKU, product type (`software`, `addon`, `service`, `physical`), base price, cost, active status.
- **Product Variants**: Attribute-based variations with price deltas (e.g. `Brand: Odoo Integration`, `+$560.00`).
- **Unit Price Calculation**: $\text{Total Unit Price} = \text{Product Base Price} + \sum(\text{Variant Deltas})$.

### 3.2 Subscription Plans & Policies

- **Billing Intervals**: `daily`, `weekly`, `monthly`, `yearly`.
- **Pricing**: Base recurring fee, min seat quantity, availability window.
- **Lifecycle Policies**:
  - `auto_close_on_end`: Auto-closes subscription at expiration date.
  - `allow_early_close`: Governs whether staff or customer can terminate early.
  - `allow_pause`: Governs whether subscription can be temporarily paused.
  - `allow_renew`: Governs whether renewal is permitted upon expiration.

### 3.3 Quotations & Templates

- Reusable quotation templates with predefined plans and lines.
- Quotations linked to a workspace customer, calculating taxes and discounts.

### 3.4 Subscription Lifecycle & State Machine

- Workspace-unique sequential reference (e.g. `WS1-SUB-2026-0001`).
- Strictly validated lifecycle transitions:
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longleftrightarrow \text{Paused} \longrightarrow \text{Closed}$$
- Background Celery tasks monitor renewal dates and trigger expiration/renewals with workspace context.

### 3.5 Automated Recurring Billing & Invoicing

- Background billing engine evaluates subscriptions where `next_billing_date <= today` per workspace.
- Deterministic idempotency key: `ws_{workspace_id}_sub_{subscription_id}_{billing_date}`.
- Status flow:
  $$\text{Draft} \longrightarrow \text{Confirmed} \longrightarrow \text{Paid}$$
  $$\text{Draft / Confirmed} \longrightarrow \text{Cancelled}$$

### 3.6 Taxes & Discount Rules

- Workspace-configured tax rules (e.g. VAT, GST, Sales Tax).
- Workspace discount rules with eligibility thresholds, validity dates, and max use limits.

### 3.7 Payment Settlement & Reconciliation

- Record payments with invoice reference, method, amount, date, transaction ID.
- Atomic balance updates: $\text{Outstanding Balance} = \text{Invoice Total} - \sum(\text{Payments Received})$.
- Automatically marks invoice `Paid` when balance reaches $\$0.00$.

### 3.8 Customer Portal

- Self-service portal scoped to authenticated customer's linked profile.
- View active subscriptions, download invoices, trigger allowed renewal actions.

### 3.9 Executive Reporting & Analytics

- Workspace-scoped aggregations: MRR, ARR, Cashflow, Active Subscriptions, Overdue balances.
- Target response time: $< 2$ seconds.

### 3.10 Audit Logging

- Immutable audit log records for all critical workspace events: creation, membership changes, subscription transitions, invoice generation, payment recordings, and configuration edits.

---

## 4. Tenant Isolation & Security Rules

1. **Zero Cross-Tenant Leakage**: Every query is filtered by active `workspace_id` derived from the validated route or authenticated context.
2. **URL Scoping**: Workspace endpoints strictly follow `/api/v1/workspaces/{workspace_id}/...`.
3. **No Blind Trust**: Workspace ID in request payloads is ignored or validated against the URL parameter and user membership.
4. **Relational Integrity**: Foreign keys across models must enforce the same `workspace_id`. Cross-tenant foreign-key references are forbidden.
5. **Password Complexity**: Enforce min 8 characters, uppercase, lowercase, special character.
6. **Tokens**: Refresh tokens in secure httpOnly cookies. Expiring invitation tokens for staff.
