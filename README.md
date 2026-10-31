# Brightloop Software — Subscription Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black.svg)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.x-green.svg)](https://www.djangoproject.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4%2B-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)

> **Enterprise Digital Backbone for Recurring Billing, Quotations, Plans & Financial Analytics**

Brightloop Software provides subscription-based software and service solutions ranging from monthly add-ons for small retail shops to complex annual enterprise contracts. This system replaces error-prone spreadsheets, manual invoice drafting, disconnected payment reconciliations, and quarterly manual reports with a unified, high-performance digital backbone.

---

## 1. Feature Summary

- **Multi-Role Access Control**: Granular permissions for `Admin`, `Internal Staff`, and `Customer` portal users.
- **Product & Variant Catalog**: Base sales/cost pricing with configurable attribute-based price adjustments (e.g., Odoo brand delta).
- **Flexible Subscription Plans**: Daily, weekly, monthly, and yearly billing intervals with lifecycle policies (`auto_close_on_end`, `allow_early_close`, `allow_pause`, `allow_renew`).
- **Quotation Templates & Offers**: Quick quotation generation with fixed-day validity windows and line items.
- **Full Subscription Lifecycle**: Strict state machine: $\text{Draft} \to \text{Quotation} \to \text{Confirmed} \to \text{Active} \leftrightarrow \text{Paused} \to \text{Closed}$.
- **Automated Idempotent Billing Engine**: Generates invoices automatically with taxes and applicable discounts; guaranteed zero double-billing or skipped cycles.
- **Admin Tax & Discount Engine**: Percentage and fixed discount rules with minimum purchase, date range, max usage limits, and automatic expiration.
- **Payment Reconciliation & Overdue Tracking**: Multi-method recording, real-time outstanding balance calculation, and aging overdue tracking.
- **Real-Time Financial Dashboard**: Consolidated KPIs (MRR, ARR, Active Subscriptions, Collected Revenue, Overdue Totals) with sub-2-second response SLA for thousands of records.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript (strict), Tailwind CSS, Radix UI / shadcn/ui, Lucide React, TanStack Query, React Hook Form + Zod, Recharts |
| **Backend** | Python 3.12+, Django 5+, Django REST Framework (DRF), SimpleJWT (httpOnly refresh tokens), django-filter, drf-spectacular (OpenAPI 3.0), Celery |
| **Database & Cache** | PostgreSQL 16+, Redis 7 (Celery broker and query cache) |
| **Tooling & Quality** | `uv` (fast Python package manager), `pnpm` (fast frontend package manager), Ruff (linter/formatter), Pytest + pytest-django |
| **Containerization** | Docker, Docker Compose |

---

## 3. Architecture Overview

Built as a **Modular Monolith** to maximize transactional consistency, speed of delivery, and maintainability:

```text
subscription-management-system/
│
├── apps/
│   ├── web/                    # Next.js 14 App Router enterprise frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages (Admin dashboard & Customer portal)
│   │   │   ├── components/     # UI kit, layout shells, and shared widgets
│   │   │   ├── features/       # Domain UI modules (subscriptions, billing, catalog)
│   │   │   ├── hooks/          # React hooks & TanStack Query integrations
│   │   │   ├── lib/            # Utilities, API client & auth handlers
│   │   │   └── types/          # Strict TypeScript interfaces
│   │   └── public/
│   │
│   └── api/                    # Django REST Framework modular backend
│       ├── config/             # Project settings, URLs, Celery setup
│       ├── apps/
│       │   ├── accounts/       # User identity, roles (Admin/Staff/Customer), JWT
│       │   ├── customers/      # Customer organization & contact profiles
│       │   ├── catalog/        # Products, Variants, Subscription Plans
│       │   ├── quotations/     # Quotation templates & lines
│       │   ├── subscriptions/  # Subscriptions, lines, and lifecycle state machine
│       │   ├── billing/        # Taxes, Discounts, Invoices, and automated billing
│       │   ├── payments/       # Payment records & overdue balance calculation
│       │   └── reporting/      # High-performance dashboard KPI aggregations
│       ├── tests/              # Backend test suite (Pytest)
│       └── manage.py
│
├── docs/                       # Complete architectural and domain specifications
│   ├── REQUIREMENTS.md         # Source of truth extracted from requirements PDF
│   ├── ARCHITECTURE.md         # Modular monolith structure & performance SLA
│   ├── DATABASE_DESIGN.md      # Schema specifications & ER diagrams
│   ├── API_DESIGN.md           # Minimal REST API contracts (/api/v1/)
│   ├── DESIGN_SYSTEM.md        # Commercial SaaS design tokens & UI guidelines
│   ├── IMPLEMENTATION_PLAN.md  # Stage-by-stage engineering plan
│   ├── OPEN_QUESTIONS.md       # Architectural decisions & assumptions
│   └── BUILD_LOG.md            # Audited stage execution log
│
├── infrastructure/
│   └── docker/                 # Container Dockerfiles (api, web)
├── .env.example                # Sample environment variables
├── docker-compose.yml          # Multi-container orchestration
├── Makefile                    # Standard developer convenience commands
└── README.md
```

---

## 4. Getting Started & Installation

### Prerequisites
- Python 3.12+ and [`uv`](https://docs.astral.sh/uv/)
- Node.js 20+ and [`pnpm`](https://pnpm.io/)
- PostgreSQL 16+ (or Docker Desktop)
- Redis 7+ (or Docker Desktop)

### Environment Configuration
Copy `.env.example` to `.env` and review configuration values:
```bash
cp .env.example .env
```

### Local Development Setup

#### 1. Backend (Django REST Framework)
```bash
cd apps/api
uv venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

uv pip install -r pyproject.toml
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### 2. Frontend (Next.js)
```bash
cd apps/web
pnpm install
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Docker Orchestration

Run the complete multi-service stack with Docker Compose:
```bash
docker compose up --build
```
This starts:
- `db`: PostgreSQL 16 on port 5432
- `redis`: Redis 7 on port 6379
- `api`: Django backend on port 8000
- `celery_worker` & `celery_beat`: Background billing scheduler
- `web`: Next.js web application on port 3000

---

## 6. API Documentation

- **OpenAPI 3.0 Schema**: `http://localhost:8000/api/schema/`
- **Interactive Swagger UI**: `http://localhost:8000/api/docs/`
- **Health Check**: `http://localhost:8000/api/v1/health/`

---

## 7. Testing & Quality Control

```bash
# Backend tests & linting
cd apps/api
pytest
ruff check .

# Frontend build & typecheck
cd apps/web
pnpm run build
pnpm run lint
```

---

## 8. Deployment & Production Considerations

- Ensure `DEBUG=False` and supply a strong unique `SECRET_KEY`.
- Run migrations (`python manage.py migrate`) before traffic routing.
- Execute automated billing runs via Celery Beat or a scheduled cloud cron job invoking `python manage.py run_billing_cycle`.
- Serve static assets via Cloudflare CDN or AWS S3/CloudFront.
- Terminate SSL at Nginx/Traefik reverse proxy or cloud load balancer.
