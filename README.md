# Brightloop Software — Multi-Tenant Subscription SaaS Platform

[![CI Quality Gate](https://github.com/aloshy0/Makeaton/actions/workflows/ci.yml/badge.svg)](https://github.com/aloshy0/Makeaton/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black.svg)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.x%2F6.x-green.svg)](https://www.djangoproject.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4%2B-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **"Run Your Subscription Business. All in One Place."**  
> An enterprise-grade, multi-tenant SaaS platform empowering anyone to create an account, launch up to five independent subscription businesses, manage products, invite team members, bill customers idempotently, and track recurring revenue with low-latency analytics.

---

## 1. Product Vision & Architecture

The system operates as a **Multi-Tenant SaaS Modular Monolith**. Rather than hardcoding a single fixed business, users can:

- **Create a Personal Account**: Global identity across all businesses.
- **Become a Business Creator**: Launch and own up to **five (5) independent business workspaces**, transactionally enforced at the database level.
- **Configure Each Business Separately**: Independent currency, tax rules, discount rules, products, plans, and customer profiles.
- **Invite Staff with Defined Permissions**: Role-based access control (`OWNER`, `ADMIN`, `STAFF`, `CUSTOMER`). Staff members operate with limited power; sensitive operations (cancellations, write-offs, custom discounts) require Admin/Owner approval.
- **Automated Recurring Billing**: Idempotent Celery engine generating invoices with deterministic keys (`ws_{id}_sub_{id}_{date}`).
- **Customer Self-Service Portal**: Customers log in, view their active subscriptions, download invoices, and perform permitted renewal actions.

---

## 2. Directory Structure

```text
├── apps/
│   ├── web/                        # Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
│   │   ├── src/app/                # Public landing, Auth, Workspace switcher, Dashboard, Portal
│   │   ├── src/components/         # AppShell, Sidebar, Header, UI primitives
│   │   ├── src/lib/                # Typed API client, currency formatters
│   │   └── tests/                  # Vitest unit tests & Playwright e2e tests
│   └── api/                        # Django 6 REST Framework modular monolith
│       ├── config/                 # Settings, URLs, Celery app, OpenAPI
│       └── apps/
│           ├── accounts/           # Global user authentication, password policies
│           ├── workspaces/         # Workspaces, memberships, 5-workspace limit enforcement
│           ├── invitations/        # Cryptographic expiring staff invitation tokens
│           ├── customers/          # Workspace customer profiles & portal links
│           ├── catalog/            # Products, attribute variants (+560 delta), plans
│           ├── quotations/         # Quotation templates, quotes, approval workflow
│           ├── subscriptions/      # Subscription contracts & lifecycle state machine
│           ├── billing/            # Invoices, tax rules, automated billing engine
│           ├── discounts/          # Percentage/fixed discounts, usage limits
│           ├── payments/           # Atomic payment recording & balance settlement
│           ├── reporting/          # Workspace SQL aggregations (MRR, ARR, cashflow)
│           └── audit/              # Immutable workspace audit logs
├── docs/                           # Authoritative specifications & architecture docs
├── infrastructure/docker/          # Dockerfile.api, Dockerfile.web
└── docker-compose.yml              # Local multi-service orchestrator
```

---

## 3. Quickstart & Local Execution

### Backend (Django API)

```powershell
cd apps/api
.venv\Scripts\Activate.ps1
$env:USE_SQLITE="True"              # Instant local SQLite fallback
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 127.0.0.1:8000
```

### Frontend (Next.js Web)

```powershell
# From root or inside apps/web
pnpm --filter brightloop-web dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Full Stack with Docker

```powershell
docker compose up --build
```

---

## 4. Default Seeded Credentials

- **Business Owner:** `admin@brightloop.com` / `BrightloopAdmin2026!`
- **Staff Member:** `staff@brightloop.com` / `BrightloopStaff2026!`
- **Customer Portal:** `customer@acme.com` / `AcmeCustomer2026!`

---

## 5. API & Documentation Index

- **Interactive Swagger UI:** [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **API Catalog:** [`docs/API_CATALOG.md`](docs/API_CATALOG.md)
- **Architecture Specification:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Database Schema:** [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md)
- **Role & Permission Matrix:** [`docs/API_PERMISSION_MATRIX.md`](docs/API_PERMISSION_MATRIX.md)
- **Security Guide:** [`docs/SECURITY.md`](docs/SECURITY.md)
