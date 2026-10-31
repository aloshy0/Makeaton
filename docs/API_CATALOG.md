# Brightloop Software — Multi-Tenant Subscription SaaS Platform

## Minimal REST API Catalog & Route Specifications

**Base URL:** `/api/v1/`  
**Schema:** OpenAPI 3.0 via `drf-spectacular` at `/api/docs/`

---

## 1. Global Endpoints

### 1.1 Authentication & Profile (`/auth/`)

- `POST /api/v1/auth/register/` — Public registration (email, password, first_name, last_name).
- `POST /api/v1/auth/login/` — Authenticate and receive short-lived JWT access token; refresh token set in secure httpOnly cookie.
- `POST /api/v1/auth/token/refresh/` — Rotate refresh token and issue fresh access token.
- `POST /api/v1/auth/logout/` — Invalidate refresh token and clear cookie.
- `GET /api/v1/auth/me/` — Retrieve authenticated user profile and owned workspaces count.

### 1.2 Workspaces Management (`/workspaces/`)

- `GET /api/v1/workspaces/` — List all workspaces the user belongs to (with role and ownership status).
- `POST /api/v1/workspaces/` — Create new workspace. Transactionally enforces **maximum 5 owned workspaces** per user.
- `GET /api/v1/workspaces/{id}/` — Retrieve workspace details.
- `PATCH /api/v1/workspaces/{id}/` — Update workspace settings (Owner/Admin only).
- `GET /api/v1/workspaces/{id}/memberships/` — List workspace members and their roles.
- `POST /api/v1/workspaces/{id}/invitations/` — Invite staff or admin (Owner/Admin only). Generates secure token.
- `GET /api/v1/workspaces/{id}/invitations/` — List pending/accepted staff invitations for the workspace.

### 1.3 Invitations Acceptance (`/invitations/`)

- `POST /api/v1/invitations/accept/` — Public endpoint to accept staff invitation using token and establish password/account.

---

## 2. Workspace-Scoped Business Endpoints (`/workspaces/{id}/...`)

### 2.1 Customers (`/customers/`)

- `GET /api/v1/workspaces/{id}/customers/` — List customers in workspace.
- `POST /api/v1/workspaces/{id}/customers/` — Create customer profile.
- `GET /api/v1/workspaces/{id}/customers/{customer_id}/` — Retrieve customer details.
- `PATCH /api/v1/workspaces/{id}/customers/{customer_id}/` — Update customer details.

### 2.2 Catalog & Variants (`/products/`, `/plans/`)

- `GET /api/v1/workspaces/{id}/products/` — List workspace products.
- `POST /api/v1/workspaces/{id}/products/` — Create product (Owner/Admin).
- `GET /api/v1/workspaces/{id}/products/{product_id}/` — Retrieve product details.
- `PATCH /api/v1/workspaces/{id}/products/{product_id}/` — Update product (Owner/Admin).
- `GET /api/v1/workspaces/{id}/products/{product_id}/variants/` — List product variants.
- `POST /api/v1/workspaces/{id}/products/{product_id}/variants/` — Add variant with price delta (Owner/Admin).
- `GET /api/v1/workspaces/{id}/plans/` — List subscription plans.
- `POST /api/v1/workspaces/{id}/plans/` — Create subscription plan with billing interval & policies (Owner/Admin).
- `GET /api/v1/workspaces/{id}/plans/{plan_id}/` — Retrieve plan details.
- `PATCH /api/v1/workspaces/{id}/plans/{plan_id}/` — Update plan policies (Owner/Admin).

### 2.3 Quotation Templates & Quotes (`/quotations/`, `/quotation-templates/`)

- `GET /api/v1/workspaces/{id}/quotation-templates/` — List quotation templates.
- `POST /api/v1/workspaces/{id}/quotation-templates/` — Create quotation template.
- `GET /api/v1/workspaces/{id}/quotations/` — List quotations.
- `POST /api/v1/workspaces/{id}/quotations/` — Create quotation for a customer.
- `GET /api/v1/workspaces/{id}/quotations/{quotation_id}/` — Retrieve quote with calculated lines and taxes.
- `POST /api/v1/workspaces/{id}/quotations/{quotation_id}/actions/send/` — Mark quotation as sent.
- `POST /api/v1/workspaces/{id}/quotations/{quotation_id}/actions/approve/` — Approve quotation and convert to Subscription.

### 2.4 Subscriptions & Lifecycle (`/subscriptions/`)

- `GET /api/v1/workspaces/{id}/subscriptions/` — List workspace subscriptions (filterable by status, customer, plan).
- `POST /api/v1/workspaces/{id}/subscriptions/` — Create subscription directly.
- `GET /api/v1/workspaces/{id}/subscriptions/{subscription_id}/` — Retrieve subscription with lines & event history.
- `POST /api/v1/workspaces/{id}/subscriptions/{subscription_id}/actions/confirm/` — Transition DRAFT -> CONFIRMED -> ACTIVE.
- `POST /api/v1/workspaces/{id}/subscriptions/{subscription_id}/actions/pause/` — Pause subscription (if policy allows).
- `POST /api/v1/workspaces/{id}/subscriptions/{subscription_id}/actions/resume/` — Resume paused subscription.
- `POST /api/v1/workspaces/{id}/subscriptions/{subscription_id}/actions/close/` — Close subscription early.

### 2.5 Invoices & Idempotent Billing (`/invoices/`)

- `GET /api/v1/workspaces/{id}/invoices/` — List invoices (filterable by status, customer, overdue).
- `POST /api/v1/workspaces/{id}/invoices/` — Create manual invoice.
- `GET /api/v1/workspaces/{id}/invoices/{invoice_id}/` — Retrieve invoice details.
- `POST /api/v1/workspaces/{id}/invoices/{invoice_id}/actions/confirm/` — Confirm draft invoice.
- `POST /api/v1/workspaces/{id}/invoices/{invoice_id}/actions/cancel/` — Cancel invoice.

### 2.6 Payments & Settlements (`/payments/`)

- `GET /api/v1/workspaces/{id}/payments/` — List payments.
- `POST /api/v1/workspaces/{id}/payments/` — Record payment against invoice. Atomically settles balance.

### 2.7 Taxes & Discounts (`/tax-rules/`, `/discount-rules/`)

- `GET /api/v1/workspaces/{id}/tax-rules/` — List workspace tax rules.
- `POST /api/v1/workspaces/{id}/tax-rules/` — Create tax rule (Owner/Admin).
- `GET /api/v1/workspaces/{id}/discount-rules/` — List workspace discount rules.
- `POST /api/v1/workspaces/{id}/discount-rules/` — Create discount rule with thresholds & limits (Owner/Admin).

### 2.8 Executive Dashboard & Financial Reports (`/dashboard/summary/`, `/reports/`)

- `GET /api/v1/workspaces/{id}/dashboard/summary/` — Single-roundtrip metrics: MRR, ARR, Total Revenue, Overdue Amount, Active Subscriptions.
- `GET /api/v1/workspaces/{id}/reports/` — Detailed cashflow, aging receivables, and churn analytics.

### 2.9 Workspace Audit Logs (`/audit-logs/`)

- `GET /api/v1/workspaces/{id}/audit-logs/` — List immutable audit records for the workspace (Owner/Admin).

### 2.10 Customer Self-Service Portal (`/portal/`)

- `GET /api/v1/workspaces/{id}/portal/me/` — Customer profile and active customer organization details.
- `GET /api/v1/workspaces/{id}/portal/subscriptions/` — Active and historical subscriptions assigned to customer.
- `GET /api/v1/workspaces/{id}/portal/offers/` — Active discount offers that match the authenticated customer's active subscriptions. Returns offer details and the matching subscription; customer and workspace scoped.
- `GET /api/v1/workspaces/{id}/portal/invoices/` — Invoices issued to customer.
- `GET /api/v1/workspaces/{id}/portal/payments/` — Payment history for customer.
- `POST /api/v1/workspaces/{id}/portal/subscriptions/{subscription_id}/actions/pause/` — Allowed customer self-pause.
- `POST /api/v1/workspaces/{id}/portal/subscriptions/{subscription_id}/actions/renew/` — Customer renewal request.
