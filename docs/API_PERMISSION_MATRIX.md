# Brightloop Software — Subscription Management System

## API Role-Based Permission Matrix (RBAC)

**Document Version:** 1.0.0  
**Scope:** Authorization enforcement across `/api/v1/` endpoints.

---

## 1. Permission Matrix Summary

| Resource / Endpoint                                             | Administrator |  Internal Staff  |            Customer (Portal)             | Public (Unauthenticated) |
| --------------------------------------------------------------- | :-----------: | :--------------: | :--------------------------------------: | :----------------------: |
| **Auth Register** (`/auth/register/`)                           |    Allowed    |     Allowed      |                 Allowed                  |       **Allowed**        |
| **Auth Login / Token** (`/auth/login/`, `/auth/token/refresh/`) |    Allowed    |     Allowed      |                 Allowed                  |       **Allowed**        |
| **Auth Password Reset** (`/auth/password-reset/`)               |    Allowed    |     Allowed      |                 Allowed                  |       **Allowed**        |
| **Auth Current User** (`/auth/me/`)                             |   **Full**    |     **Full**     |                 **Full**                 |       Denied (401)       |
| **Staff Management** (`/staff/`, `/staff/{id}/deactivate/`)     |   **Full**    | **DENIED (403)** |             **DENIED (403)**             |       Denied (401)       |
| **Customers Collection** (`/customers/`)                        |   **Full**    |     **Full**     |             **DENIED (403)**             |       Denied (401)       |
| **Customer Detail** (`/customers/{id}/`, `/customers/me/`)      |   **Full**    |     **Full**     |           **Own Account Only**           |       Denied (401)       |
| **Products & Variants** (`/products/`, `/variants/`)            |   **Full**    |    Read-Only     |            Read-Only (Active)            |    Read-Only (Active)    |
| **Subscription Plans** (`/plans/`)                              |   **Full**    |    Read-Only     |            Read-Only (Active)            |    Read-Only (Active)    |
| **Quotation Templates** (`/quotation-templates/`)               |   **Full**    |     **Full**     |             **DENIED (403)**             |       Denied (401)       |
| **Quotations** (`/quotations/`)                                 |   **Full**    |     **Full**     |          **View Assigned Only**          |       Denied (401)       |
| **Subscriptions** (`/subscriptions/`)                           |   **Full**    |     **Full**     |          **View Assigned Only**          |       Denied (401)       |
| **Subscription Actions** (`/subscriptions/{id}/actions/`)       |   **Full**    |     **Full**     | **Self Actions Only (if policy allows)** |       Denied (401)       |
| **Invoices** (`/invoices/`)                                     |   **Full**    |     **Full**     |          **View Assigned Only**          |       Denied (401)       |
| **Invoice Actions** (`/invoices/{id}/actions/`)                 |   **Full**    |     **Full**     |             **DENIED (403)**             |       Denied (401)       |
| **Invoice PDF** (`/invoices/{id}/pdf/`)                         |   **Full**    |     **Full**     |           **Download Own PDF**           |       Denied (401)       |
| **Tax Rules** (`/tax-rules/`)                                   |   **Full**    |    Read-Only     |             **DENIED (403)**             |       Denied (401)       |
| **Discount Rules** (`/discount-rules/`)                         |   **Full**    |    Read-Only     |             **DENIED (403)**             |       Denied (401)       |
| **Payment Recording** (`/payments/` POST)                       |   **Full**    |     **Full**     |     **Online Payment Gateway Only**      |       Denied (401)       |
| **Payment History** (`/payments/` GET)                          |   **Full**    |     **Full**     |        **View Assigned Payments**        |       Denied (401)       |
| **Dashboard Summary** (`/dashboard/summary/`)                   |   **Full**    |     **Full**     |             **DENIED (403)**             |       Denied (401)       |
| **Financial Reports** (`/reports/`)                             |   **Full**    |     **Full**     |             **DENIED (403)**             |       Denied (401)       |
| **Health Liveness & Readiness** (`/health/live/`, `/ready/`)    |    Allowed    |     Allowed      |                 Allowed                  |       **Allowed**        |

---

## 2. Explicitly Denied & Forbidden Operations

1. **Staff Account Creation by Non-Admins:**
   - Staff and Customers attempting to access `/api/v1/staff/` are immediately rejected with `403 Forbidden`.
2. **Direct Status Modification via PATCH:**
   - Modifying `status` directly on `/api/v1/subscriptions/{id}/` or `/api/v1/invoices/{id}/` via `PATCH` is rejected. Status changes must flow through `/actions/` to enforce business invariants.
3. **Cross-Customer Data Exposure:**
   - Customers cannot access subscriptions, invoices, payments, or customer records where `customer.user != request.user`. Attempting to retrieve another customer's ID returns `404 Not Found` (to avoid ID enumeration) or `403 Forbidden`.
4. **Altering Settled Financial Records:**
   - Invoices in `PAID` status cannot be cancelled or deleted.
   - Payment records cannot be modified or deleted once recorded.
5. **Unauthorized Plan Actions:**
   - Customers attempting to `pause` a subscription whose plan has `allow_pause == false` are rejected with `400 Bad Request`.
   - Customers attempting to `close` a subscription early whose plan has `allow_early_close == false` are rejected with `400 Bad Request`.
