# GitHub Copilot Instructions — Brightloop Subscription Management System

- Always follow the canonical directives established in `AGENTS.md`.
- Backend code belongs in `apps/api/` with domain boundaries (`accounts`, `customers`, `catalog`, `quotations`, `subscriptions`, `billing`, `payments`, `reporting`).
- Frontend code belongs in `apps/web/` using Next.js 14 App Router, TypeScript, and Tailwind CSS.
- Ensure all financial calculations use `Decimal(12, 2)` arithmetic.
- Adhere to the minimal REST API design defined in `docs/API_CATALOG.md`.
- Enforce Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
