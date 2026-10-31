# Brightloop Software — Subscription Management System
## Minimal REST API Specification

**API Base URL:** `/api/v1/`  
**OpenAPI Schema:** `/api/schema/`  
**Swagger UI:** `/api/docs/`

---

## 1. Design Philosophy

- **Resource-Oriented**: Clear standard CRUD endpoints with DRF ViewSets.
- **Minimal API Surface**: High efficiency, no redundant single-purpose endpoints.
- **Search, Filter & Pagination**: Standard `django-filter`, search parameters (`?search=`), and unified page-number pagination:
  ```json
  {
    "count": 120,
    "next": "http://api/v1/subscriptions/?page=2",
    "previous": null,
    "results": [...]
  }
  ```
- **Consolidated Dashboard Endpoint**: Single round-trip for financial KPIs and charts.

---

## 2. API Endpoints Map

### 2.1 System & Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/health/` | Service health status (DB, Redis, Celery) | Public |
| `POST` | `/api/v1/auth/register/` | Customer sign-up (strictly validated password) | Public |
| `POST` | `/api/v1/auth/token/` | JWT obtain pair (login) | Public |
| `POST` | `/api/v1/auth/token/refresh/` | JWT token refresh | Public |
| `GET` | `/api/v1/auth/me/` | Current user profile & role | Authenticated |

### 2.2 Product Catalog & Plans
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST` | `/api/v1/catalog/products/` | List/filter products; create product | Staff/Admin |
| `GET/PUT/PATCH/DELETE` | `/api/v1/catalog/products/{id}/` | Retrieve, update or archive product | Staff/Admin |
| `GET/POST` | `/api/v1/catalog/plans/` | List/filter subscription plans | Authenticated |
| `GET/PUT/PATCH/DELETE` | `/api/v1/catalog/plans/{id}/` | Plan detail & lifecycle policy configuration | Staff/Admin |

### 2.3 Customers
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST` | `/api/v1/customers/` | List/search customers; create customer | Staff/Admin |
| `GET/PUT/PATCH` | `/api/v1/customers/{id}/` | Retrieve or update customer profile | Staff/Admin / Own Customer |

### 2.4 Quotations & Templates
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST` | `/api/v1/quotations/templates/` | Manage reusable quotation templates | Staff/Admin |
| `GET/PUT/PATCH/DELETE` | `/api/v1/quotations/templates/{id}/` | Template detail and line items | Staff/Admin |

### 2.5 Subscriptions
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST` | `/api/v1/subscriptions/` | List/filter subscriptions; create draft | Authenticated (scoped) |
| `GET/PUT/PATCH` | `/api/v1/subscriptions/{id}/` | Subscription details & lines | Authenticated (scoped) |
| `POST` | `/api/v1/subscriptions/{id}/transition/` | Perform state change (`to_quotation`, `confirm`, `activate`, `pause`, `resume`, `close`) | Staff/Admin |

### 2.6 Billing, Invoices & Taxes
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST` | `/api/v1/billing/taxes/` | List/create tax rules | Admin |
| `GET/POST` | `/api/v1/billing/discounts/` | List/create discount rules | Admin |
| `GET` | `/api/v1/billing/invoices/` | List/filter invoices (`?status=`, `?customer=`, `?overdue=true`) | Authenticated (scoped) |
| `GET` | `/api/v1/billing/invoices/{id}/` | Invoice details & printable lines | Authenticated (scoped) |
| `POST` | `/api/v1/billing/invoices/{id}/confirm/` | Transition invoice from Draft to Confirmed | Staff/Admin |
| `POST` | `/api/v1/billing/invoices/{id}/cancel/` | Cancel an uncollected invoice | Staff/Admin |
| `POST` | `/api/v1/billing/run/` | Trigger automated recurring billing run | Admin/Staff |

### 2.7 Payments
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/POST` | `/api/v1/payments/` | List payments; record payment against invoice | Staff/Admin |
| `GET` | `/api/v1/payments/{id}/` | Retrieve payment record details | Staff/Admin / Own Customer |

### 2.8 Reporting & Dashboard Aggregation
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/reporting/dashboard/` | Consolidated KPIs: MRR, ARR, Active Subscriptions, Collected Revenue, Overdue Totals, Revenue Trends | Staff/Admin |

---

## 3. Standard Response Format

Success:
```json
{
  "status": "success",
  "data": { ... }
}
```

Standard Paginated List:
```json
{
  "count": 45,
  "next": null,
  "previous": null,
  "results": [ ... ]
}
```

Standard Error:
```json
{
  "status": "error",
  "code": "validation_error",
  "message": "Invalid subscription transition.",
  "errors": {
    "status": ["Cannot transition directly from Draft to Active. Must be Confirmed first."]
  }
}
```
