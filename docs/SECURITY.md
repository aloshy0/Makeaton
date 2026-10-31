# Brightloop Software — Multi-Tenant Subscription SaaS Platform

## Security Architecture & Multi-Tenant Protection

**Document Version:** 3.0.0 (Multi-Tenant SaaS Architecture)  
**Classification:** Security Architecture Specification

---

## 1. Multi-Tenant Isolation Controls

### 1.1 Strict Route Scoping & Queryset Confinement

Every resource request is bound to a validated `workspace_id`.
In Django REST Framework:

1. `WorkspaceMembership` is validated prior to view execution.
2. `get_queryset()` strictly restricts queries:
   ```python
   def get_queryset(self):
       workspace_id = self.kwargs["workspace_id"]
       return super().get_queryset().filter(workspace_id=workspace_id)
   ```
3. Object creation enforces workspace context in `perform_create`:
   ```python
   def perform_create(self, serializer):
       serializer.save(workspace_id=self.kwargs["workspace_id"])
   ```

### 1.2 Five-Workspace Ownership Enforcement

To prevent resource exhaustion and abuse, each user account can own at most **5 active workspaces**.
Enforcement is transactional at the database level:

```python
with transaction.atomic():
    owned_count = Workspace.objects.select_for_update().filter(owner=user, is_active=True).count()
    if owned_count >= 5:
        raise ValidationError("Workspace limit reached. Maximum 5 owned workspaces per user.")
```

---

## 2. Secure Staff Invitations & Passwords

### 2.1 Cryptographic Invitation Tokens

- Staff members are onboarded via cryptographically secure random tokens (`secrets.token_urlsafe(48)`).
- Invitations have a mandatory expiration window (72 hours).
- Inviting user must be an Owner or Admin of the workspace.
- Accepting an invitation requires the invitee to establish a secure password meeting password complexity criteria.

### 2.2 Password Complexity Policy

All user accounts (creators, staff, customers) must fulfill:

- Minimum length: 8 characters.
- At least one uppercase letter (`[A-Z]`).
- At least one lowercase letter (`[a-z]`).
- At least one special character (`[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]`).
  Enforced via `ComplexPasswordValidator` registered in `AUTH_PASSWORD_VALIDATORS`.

---

## 3. Token Security & Cookie Strategy

- Short-lived Access Tokens (30 minutes) passed via `Authorization: Bearer <token>`.
- Long-lived Refresh Tokens (7 days) stored exclusively in `httpOnly`, `Secure` (production), `SameSite=Lax` cookies.
- Refresh tokens are never exposed to browser `localStorage` or `sessionStorage`, protecting against XSS token exfiltration.
- Automatic token rotation upon refresh.

---

## 4. Financial Precision & Idempotency Safeguards

- Monetary values use `Decimal(12, 2)` across Python and PostgreSQL. Floating-point numbers are prohibited for financial figures.
- Automated billing engine generates deterministic idempotency keys:
  $$\text{ws\_}\{workspace\_id\}\_\text{sub\_}\{subscription\_id\}\_\text{date\_}\{YYYY-MM-DD\}$$
  Enforces a database `UNIQUE` constraint, making duplicate invoice generation structurally impossible.
