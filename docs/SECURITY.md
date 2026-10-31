# Brightloop Software — Subscription Management System

## Security Architecture & Compliance Guidelines

**Document Version:** 1.0.0  
**Scope:** Authentication, Authorization, Session Management, Financial Data Isolation, and Auditability.

---

## 1. Authentication Security & Password Policy

Per requirements extracted from `Subscription_Management_System_goal.pdf`:

1. **Account Isolation**: Each email address is strictly unique across the system.
2. **Password Policy Enforcement**:
   - Minimum 8 characters.
   - At least 1 uppercase letter (`[A-Z]`).
   - At least 1 lowercase letter (`[a-z]`).
   - At least 1 special character (`[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]`).
   - Implemented at the Django authentication layer via `apps.accounts.validators.ComplexPasswordValidator`.
3. **Password Hashing**: Passwords stored using PBKDF2 with SHA-256 and high work factor iteration counts.

---

## 2. JWT Token Management & Browser Storage

- **Short-Lived Access Tokens**:
  - Expiration: 30 minutes.
  - Carried in Authorization headers (`Bearer <token>`).
- **Secure Refresh Token Handling**:
  - Expiration: 7 days with automatic token rotation.
  - Transferred and stored strictly in **`httpOnly` cookies** with `SameSite=Lax` (and `Secure=True` in production).
  - **Zero Long-Lived Storage in `localStorage`**: Protects against Cross-Site Scripting (XSS) credential exfiltration.

---

## 3. Role-Based Access Control (RBAC) & Data Scoping

- **Backend Enforcement**: Authorization logic is enforced strictly in Django permission classes (`IsAdmin`, `IsStaffOrAdmin`, `IsOwnerOrStaff`), never trusted to frontend components.
- **Tenant & Customer Data Scoping**:
  - Customer queries automatically filter by `customer.user == request.user`.
  - Attempts by a customer to query or manipulate another customer's ID return `404 Not Found` (preventing ID enumeration).

---

## 4. Financial Integrity & Transactional Safety

- **Decimal Monetary Precision**: All financial amounts use `Decimal(12, 2)` arithmetic. Floating-point types are strictly forbidden.
- **Idempotent Billing Runs**: Deterministic key generation (`sub_{subscription_id}_{billing_date}`) guarantees subscriptions are never billed twice for the same billing window.
- **Atomic Payment Settlement**: Invoices and payments update inside `transaction.atomic()` blocks, ensuring that payment records and outstanding balance adjustments remain synchronized.

---

## 5. Audit Logging

Sensitive business operations trigger immutable audit entries in `accounts_auditlog`:

- Lifecycle transitions (`pause`, `close`, `renew`).
- Invoice confirmation and cancellation.
- Incoming payment registrations.
- Staff provisioning and deactivation.
