# Brightloop Software — Subscription Management System

## Minimal REST API Specification & Architecture Design

**API Base URL:** `/api/v1/`  
**OpenAPI Schema:** `/api/schema/`  
**Interactive Swagger UI:** `/api/docs/`  
**Status:** Canonical Design

---

## 1. Architectural Principles

1. **Minimal API Surface**:
   - Provide the minimum number of reusable, resource-oriented endpoints required to satisfy all business goals.
   - Avoid creating an endpoint for every frontend button; use standard RESTful methods (`GET`, `POST`, `PATCH`, `DELETE`) and explicit action transitions (`/actions/`).
2. **Backend Authority**:
   - All business logic, tax calculations, discount evaluations, and lifecycle rules reside exclusively on the backend.
   - The frontend never performs authoritative calculations.
3. **Idempotency & Financial Consistency**:
   - Automated billing runs use deterministic keys (`sub_{subscription_id}_{billing_date}`) to guarantee no double billing.
   - Payment settlements execute within atomic database transactions.
4. **Performance SLA**:
   - Every list, detail, and aggregation endpoint must respond in **under 2.0 seconds** with tens of thousands of subscription records.
   - Single-query SQL aggregations replace in-memory calculation loops.

---

## 2. Authentication & Secure Token Strategy

- **Authentication Scheme**: Django REST Framework SimpleJWT.
- **Short-Lived Access Tokens**: Lifetime of 30 minutes, delivered in authorization headers (`Bearer <token>`).
- **Secure Refresh Token Handling**:
  - Refresh tokens have a lifetime of 7 days with token rotation.
  - Refresh tokens are transmitted and stored strictly in secure, `httpOnly`, `SameSite=Lax` cookies.
  - Long-lived credentials are **never stored in browser `localStorage`**, mitigating XSS token extraction vectors.

---

## 3. Standard Request & Response Contracts

### 3.1 Standard Success Response

```json
{
  "status": "success",
  "data": { ... }
}
```

### 3.2 Standard Paginated List Response

All list endpoints implement unified pagination:

```json
{
  "count": 1420,
  "next": "http://api.brightloop.com/api/v1/subscriptions/?page=2",
  "previous": null,
  "results": [
    { ... }
  ]
}
```

### 3.3 Standard Error Response

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The subscription cannot be paused because the assigned plan policy prohibits pausing.",
    "field_errors": {
      "action": ["Invalid lifecycle transition for plan policy."]
    }
  }
}
```

---

## 4. Query Parameters: Filtering, Searching & Ordering

Endpoints support unified query filtering via `django-filter`:

| Parameter   | Type    | Example                 | Description                                  |
| ----------- | ------- | ----------------------- | -------------------------------------------- |
| `page`      | Integer | `?page=2`               | Page number (default size: 20).              |
| `page_size` | Integer | `?page_size=50`         | Custom page size (max: 100).                 |
| `search`    | String  | `?search=Acme`          | Full-text search across primary text fields. |
| `ordering`  | String  | `?ordering=-created_at` | Sort field (prefix `-` for descending).      |
| `status`    | String  | `?status=active`        | Filter by entity state.                      |
| `overdue`   | Boolean | `?overdue=true`         | Invoices past due date with balance $> 0$.   |

---

## 5. Operational Health Probes

Per cloud-native standards:

1. **Liveness Probe**:
   - **Endpoint:** `GET /api/v1/health/live/`
   - **Purpose:** Process liveness probe returning HTTP 200 if the WSGI/ASGI application worker is running.
2. **Readiness Probe**:
   - **Endpoint:** `GET /api/v1/health/ready/`
   - **Purpose:** Verifies that required dependencies (PostgreSQL connection pool and Redis cache/broker) are healthy before routing traffic.
   - **Response:**
     ```json
     {
       "status": "ready",
       "database": "connected",
       "redis": "connected"
     }
     ```

---

## 6. Asynchronous Background Tasks (Celery)

Background operations are executed via Celery Beat schedules and are **not exposed as public APIs**:

1. `billing.tasks.run_recurring_billing_cycle` (Daily at 00:05 UTC)
2. `subscriptions.tasks.check_subscription_renewals` (Daily at 01:00 UTC)
3. `subscriptions.tasks.enforce_subscription_expiry` (Daily at 01:15 UTC)
4. `billing.tasks.check_overdue_invoices` (Hourly)
5. `billing.tasks.enforce_discount_limits` (Daily at 02:00 UTC)
6. `notifications.tasks.dispatch_invoice_emails` (Event triggered)
