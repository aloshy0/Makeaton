# Brightloop Software — Central AI Coding Agent Instructions

**Target Organization:** Brightloop Software  
**System:** Subscription Management System (Modular Monolith)  
**Authoritative Rule:** All AI agents and coding assistants (Gemini, Claude, Cursor, Copilot, ChatGPT) must strictly adhere to the guidelines herein.

---

## 1. Prime Directives

1. **Follow Established Architecture**:
   - The system is engineered as a **Modular Monolith** (`apps/web` for Next.js App Router and `apps/api` for Django REST Framework).
   - Do NOT introduce microservices, serverless splits, or separate standalone backend servers.
2. **Never Invent Requirements**:
   - The authoritative source of truth is `Subscription_Management_System_goal.pdf` and [`docs/REQUIREMENTS.md`](file:///d:/PROGRAMING/hackthon/docs/REQUIREMENTS.md).
   - Any edge case or unspecified business rule must be cataloged in [`docs/OPEN_QUESTIONS.md`](file:///d:/PROGRAMING/hackthon/docs/OPEN_QUESTIONS.md). Never silently assume business logic.
3. **Inspect Before Modifying**:
   - Always read existing files and inspect git status before editing.
   - Do not overwrite or discard existing user work or working foundations.
4. **Minimal API Surface**:
   - Follow the minimal API design in [`docs/API_CATALOG.md`](file:///d:/PROGRAMING/hackthon/docs/API_CATALOG.md).
   - Do NOT create a unique API endpoint for every frontend button. Use RESTful resource routes and standard business action transitions (`/actions/`).
   - Background jobs (renewals, billing cycle runs, overdue checks) must remain Celery tasks, NOT public endpoints.
5. **Security & Financial Precision**:
   - Always use exact `Decimal(12, 2)` for monetary values. Never use floating-point numbers for currency.
   - Never store long-lived JWT refresh tokens in browser `localStorage`.
   - Strictly enforce password complexity on the backend (min 8 characters, uppercase, lowercase, special character).
   - Never commit `.env` files, passwords, or secrets.
6. **Testing & Documentation Mandate**:
   - Run relevant tests (`pytest` for backend, `vitest` for frontend) after modifications.
   - Run linters (`ruff check .`, `eslint`, `prettier`).
   - Update [`docs/BUILD_LOG.md`](file:///d:/PROGRAMING/hackthon/docs/BUILD_LOG.md) whenever features or configurations change.
   - Never claim an unexecuted test as passed.

---

## 2. Directory Structure Map

```text
apps/
  web/                     # Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
    src/app/               # Application routes
    src/components/        # UI components (ui/, layout/)
    src/lib/api.ts         # Typed API client
    src/types/index.ts     # Domain interfaces
    tests/                 # Vitest unit tests & Playwright e2e tests
  api/                     # Django 5/6, Django REST Framework, Celery
    config/                # Project settings, Celery app, OpenAPI
    apps/
      accounts/            # Users, roles, authentication, audit log
      customers/           # Customer organizations
      catalog/             # Products, variants, subscription plans
      quotations/          # Quotation templates & quotes
      subscriptions/       # Subscriptions, lines, state machine
      billing/             # Invoices, lines, tax rules, discount rules, billing engine
      payments/            # Payment records, invoice settlement
      reporting/           # Executive dashboard SQL aggregations
    tests/                 # Pytest test suite
docs/                      # Comprehensive technical architecture & design specs
```

---

## 3. Tooling & Execution Commands

```bash
# Backend Quality Checks
cd apps/api
pytest
ruff check .

# Frontend Quality Checks
cd apps/web
pnpm run test
pnpm run build
pnpm run lint

# Git Commits
# Enforce Conventional Commits (e.g., feat:, fix:, chore:, docs:, test:)
```
