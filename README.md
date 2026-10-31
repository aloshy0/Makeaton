# Brightloop Software — Subscription Management System

[![CI Quality Gate](https://github.com/aloshy0/Makeaton/actions/workflows/ci.yml/badge.svg)](https://github.com/aloshy0/Makeaton/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black.svg)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.x%2F6.x-green.svg)](https://www.djangoproject.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4%2B-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)

> **Enterprise Digital Backbone for Recurring Billing, Quotations, Plans & Financial Analytics**

---

## 1. Project Overview

Brightloop Software provides subscription-based software and service solutions ranging from monthly add-ons for small retail shops to complex annual enterprise contracts. This system serves as the mission-critical digital backbone managing the entire recurring revenue lifecycle.

---

## 2. Business Problem & Purpose

Prior to this system, Brightloop operated with fragmented spreadsheets, remembered renewals by chance, typed up invoices manually each month, matched payments by scrolling bank statements, and built manual revenue reports quarterly. Renewals were missed, invoices went out incorrectly, and real-time visibility into Monthly Recurring Revenue (MRR) was absent. This platform provides automated, low-latency execution for all billing operations.

---

## 3. Functional Scope

1. **User Authentication & Permissions**: Multi-role access (`ADMIN`, `STAFF`, `CUSTOMER`), password complexity enforcement, token authentication.
2. **Product Catalog & Attribute Variants**: Base pricing with attribute price deltas (e.g., Odoo Brand `+$560.00`).
3. **Subscription Plans**: Flexible intervals (`daily`, `weekly`, `monthly`, `yearly`) with policies (`auto_close_on_end`, `allow_early_close`, `allow_pause`, `allow_renew`).
4. **Quotations & Templates**: Pre-configured offers with validity windows in days.
5. **Subscription Lifecycle Machine**: $\text{Draft} \to \text{Quotation} \to \text{Confirmed} \to \text{Active} \longleftrightarrow \text{Paused} \to \text{Closed}$.
6. **Automated Idempotent Billing Engine**: Scheduled batch invoice generation with deterministic deduplication keys.
7. **Taxes & Discounts**: Admin-configured tax rules and percentage/fixed discount rules with usage limits.
8. **Payment Reconciliation & Overdue Tracking**: Multi-method recording, atomic balance calculation, and real-time overdue alerts.
9. **Customer Portal**: Scoped self-service view for customers to manage plans and pay invoices.
10. **Executive Analytics**: Consolidated real-time KPIs (MRR, ARR, overdue receivables, cash flow trends) with sub-2-second response SLA.

---

## 4. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui + Radix UI, Lucide React, TanStack Query, Recharts, Vitest, Playwright.
- **Backend**: Python 3.12+, Django 5/6, Django REST Framework, SimpleJWT, django-filter, drf-spectacular (OpenAPI 3.0), Celery.
- **Database & Cache**: PostgreSQL 16+, Redis 7.
- **Tooling & Infrastructure**: `uv`, `pnpm` (monorepo workspaces), Docker & Docker Compose, Ruff, Prettier, ESLint, Husky, Commitlint.

---

## 5. Architecture Overview

Architected as a high-performance **Modular Monolith** with clean business domain boundaries:

```text
subscription-management-system/
│
├── apps/
│   ├── web/                    # Next.js App Router frontend
│   │   ├── src/app/            # Routes (Dashboard, Subscriptions, Invoices, Catalog, Portal)
│   │   ├── src/components/     # UI kit and application layout shells
│   │   ├── src/lib/api.ts      # Typed REST API integration layer
│   │   └── tests/              # Vitest unit tests & Playwright specs
│   │
│   └── api/                    # Django REST Framework backend
│       ├── config/             # Settings, URLs, Celery, OpenAPI, Health Check
│       ├── apps/               # Modular domain apps (accounts, customers, catalog,
│       │                       # quotations, subscriptions, billing, payments, reporting)
│       └── tests/              # Pytest automated test suite
│
├── docs/                       # Comprehensive specifications and manuals
├── infrastructure/docker/      # Container Dockerfiles
├── .github/workflows/          # CI quality gate workflows
├── .husky/                     # Git pre-commit & commit-msg hooks
├── docker-compose.yml          # Multi-container orchestration
├── Makefile                    # Developer CLI commands
└── README.md
```

---

## 6. Directory Structure

Detailed file breakdown is documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 7. Dependencies

Complete dependency lists and locked versions are cataloged in [`docs/DEPENDENCIES.md`](docs/DEPENDENCIES.md).

---

## 8. Prerequisites

- **Node.js**: v20+ or v22+
- **pnpm**: v11+
- **Python**: v3.12+
- **uv**: v0.11+
- **Docker & Docker Compose**: v24+ (optional for local non-containerized dev)
- **PostgreSQL**: 16+ (or local fallback mode)

---

## 9. Installation

Clone and install dependencies:

```bash
# 1. Install root & frontend dependencies
pnpm install

# 2. Setup backend virtual environment and dependencies
cd apps/api
uv venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
uv pip install -r requirements.txt
```

---

## 10. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables:

- `DB_ENGINE`: `django.db.backends.postgresql` (or `django.db.backends.sqlite3` for local mode)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `REDIS_URL`: `redis://localhost:6379/0`
- `NEXT_PUBLIC_API_URL`: `http://localhost:8000/api/v1`

---

## 11. Local Development Commands

```bash
# Terminal 1 — Start Django Backend
cd apps/api
python manage.py runserver 0.0.0.0:8000

# Terminal 2 — Start Next.js Frontend
cd apps/web
pnpm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

---

## 12. Docker Instructions

Run the complete multi-service stack with Docker Compose:

```bash
docker compose up --build
```

Services started:

- `db`: PostgreSQL 16 (Port 5432)
- `redis`: Redis 7 (Port 6379)
- `api`: Django backend (Port 8000)
- `celery_worker` & `celery_beat`: Background billing scheduler
- `web`: Next.js web application (Port 3000)

---

## 13. Database Setup & Migrations

```bash
cd apps/api
# Run migrations
python manage.py migrate

# Seed demonstration & benchmark records
python manage.py seed_demo_data
```

**Seeded Demo Accounts:**

- **Admin**: `admin@brightloop.com` / `BrightloopAdmin2026!`
- **Staff**: `staff@brightloop.com` / `BrightloopStaff2026!`
- **Customer**: `customer@acme.com` / `BrightloopCustomer2026!`

---

## 14. API Documentation

- **OpenAPI 3.0 Schema**: `http://localhost:8000/api/schema/`
- **Swagger UI Documentation**: `http://localhost:8000/api/docs/`
- **Complete Endpoint Inventory**: [`docs/API_CATALOG.md`](docs/API_CATALOG.md)
- **RBAC Permission Matrix**: [`docs/API_PERMISSION_MATRIX.md`](docs/API_PERMISSION_MATRIX.md)
- **Operational Health Probes**:
  - Liveness: `http://localhost:8000/api/v1/health/live/`
  - Readiness: `http://localhost:8000/api/v1/health/ready/`

---

## 15. Testing Instructions

```bash
# Run backend tests
cd apps/api
pytest

# Run backend linter
ruff check .

# Run frontend unit tests
cd apps/web
pnpm run test

# Run frontend build check
pnpm run build
```

---

## 16. Git Conventions & Quality Hooks

- **Husky Git Hooks**:
  - `pre-commit`: Automatically runs `pnpm lint-staged` against staged files (formatting with Prettier and linting with Ruff).
  - `commit-msg`: Strictly validates commit messages against the **Conventional Commits** specification.
- **Commit Message Format**:
  - `feat: add subscription management`
  - `fix: prevent duplicate invoice generation`
  - `chore: configure development environment`
  - `docs: update API catalog`

---

## 17. CI Workflow

GitHub Actions workflow configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executes on every push and pull request:

1. **Frontend Job**: pnpm install, Prettier check, ESLint, TypeScript compilation check, Vitest unit tests, Next.js production build.
2. **Backend Job**: uv install, Ruff lint check, Ruff format check, Django system check, migration consistency check, Pytest suite.
3. **Infrastructure Job**: Docker Compose configuration validation.

---

## 18. AI Agent Instructions

Authoritative directives for all AI coding assistants are centralized in [`AGENTS.md`](AGENTS.md) and mirrored in [`GEMINI.md`](GEMINI.md), [`.cursor/rules/`](.cursor/rules/), and [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

---

## 19. Known Limitations & Open Questions

Non-blocking architectural assumptions (such as daily proration policies and grace periods) are logged in [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md).

---

## 20. Current Development Status

**Stage Status:** Completed Environment Setup, Architecture Audit & Development Readiness.  
**Verdict:** **READY FOR FEATURE DEVELOPMENT**.
