# Brightloop Software — Multi-Tenant Subscription SaaS Platform

## Minimal REST API Specification & Multi-Tenant Design

**API Base URL:** `/api/v1/`  
**OpenAPI Schema:** `/api/schema/`  
**Interactive Swagger UI:** `/api/docs/`  
**Status:** Canonical Multi-Tenant Specification

---

## 1. Multi-Tenant Architectural Principles

1. **Strict URL Tenancy**:
   - Global resources (Authentication, User profile, Workspace list/creation, Invitation acceptance) exist at `/api/v1/auth/`, `/api/v1/workspaces/`, and `/api/v1/invitations/`.
   - All tenant business resources (Catalog, Plans, Quotes, Subscriptions, Billing, Invoices, Payments, Reporting) exist under `/api/v1/workspaces/{workspace_id}/...`.
2. **Minimal & Resource-Oriented Surface**:
   - Reusable CRUD endpoints with filtering, searching, and pagination (`page`, `page_size`).
   - Business transitions use explicit transition routes (e.g. `/actions/pause/`, `/actions/confirm/`).
3. **Workspace Authorization & Membership Guard**:
   - The user's active membership is validated against the route's `{workspace_id}`.
   - If user does not belong to the workspace, an immediate HTTP 403 Forbidden is returned.
   - Request bodies cannot override `workspace_id`.
4. **Sub-2-Second Performance SLA**:
   - Endpoints respond in under 2 seconds.
   - Aggregations and metrics are computed in PostgreSQL with single round-trips.

---

## 2. Authentication & Token Strategy

- **Scheme**: DRF SimpleJWT with custom user model (`email` as identifier).
- **Access Tokens**: Short-lived (30 minutes) returned in response bodies for client-side API calls.
- **Refresh Tokens**: Long-lived (7 days) stored exclusively in secure `httpOnly`, `SameSite=Lax` cookies; never exposed to JavaScript `localStorage`.
- **Expiring Invitation Tokens**: Cryptographically random 64-character tokens with configurable expiration (72 hours default) for onboarding staff.

---

## 3. Standard Request & Response Envelopes

### 3.1 Paginated List Envelope

```json
{
  "count": 120,
  "next": "http://localhost:8000/api/v1/workspaces/11111111-1111-1111-1111-111111111111/subscriptions/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

### 3.2 Error Envelope

```json
{
  "error": "You do not have permission to perform this action in this workspace.",
  "code": "permission_denied",
  "details": { ... }
}
```

---

## 4. Health & Operational Endpoints

- `GET /api/v1/health/` — Consolidated health summary (DB, Redis, cache).
- `GET /api/v1/health/live/` — Process liveness probe (HTTP 200).
- `GET /api/v1/health/ready/` — Dependency readiness probe (verifies PostgreSQL & Redis connections).
