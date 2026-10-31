# Brightloop Software — Subscription Management System

## Complete Dependency & Package Inventory

**Document Version:** 1.0.0  
**Scope:** Frontend, Backend, Tooling, Infrastructure, and Security

---

## 1. Root & Monorepo Tooling Dependencies

Managed via `pnpm` (v11.10.0) from root `package.json`:

| Package                           | Version   | Purpose                                          |
| --------------------------------- | --------- | ------------------------------------------------ |
| `husky`                           | `^9.1.4`  | Git hooks manager (`pre-commit`, `commit-msg`)   |
| `lint-staged`                     | `^15.2.7` | Runs linters strictly against staged git files   |
| `@commitlint/cli`                 | `^19.3.0` | Validates Conventional Commit message compliance |
| `@commitlint/config-conventional` | `^19.2.2` | Conventional Commits rules preset                |
| `prettier`                        | `^3.3.3`  | Code formatting standard                         |
| `eslint`                          | `^8.57.0` | JavaScript / TypeScript static linting engine    |

---

## 2. Frontend Dependencies (`apps/web`)

Managed via `pnpm` in `apps/web/package.json`:

### Production Runtime Dependencies

| Package                         | Version    | Purpose                                            |
| ------------------------------- | ---------- | -------------------------------------------------- |
| `next`                          | `14.2.5`   | React framework with App Router & server rendering |
| `react`                         | `^18.3.1`  | Core React engine                                  |
| `react-dom`                     | `^18.3.1`  | React DOM renderer                                 |
| `typescript`                    | `^5.5.4`   | Static typing and compiler                         |
| `tailwindcss`                   | `^3.4.7`   | Utility-first CSS styling engine                   |
| `lucide-react`                  | `^0.417.0` | High-clarity iconography library                   |
| `@tanstack/react-query`         | `^5.51.11` | Server state management, cache & data fetching     |
| `recharts`                      | `^2.12.7`  | High-performance SVG analytics visualization       |
| `zod`                           | `^3.23.8`  | Schema validation and type inference               |
| `react-hook-form`               | `^7.52.1`  | Performant form state management                   |
| `@hookform/resolvers`           | `^3.9.0`   | Connects React Hook Form with Zod schemas          |
| `clsx`                          | `^2.1.1`   | Utility for constructing `className` strings       |
| `tailwind-merge`                | `^2.4.0`   | Safely merges Tailwind CSS utility classes         |
| `@radix-ui/react-dialog`        | `^1.1.1`   | Accessible modal dialog primitives                 |
| `@radix-ui/react-dropdown-menu` | `^2.1.1`   | Accessible dropdown menu primitives                |
| `@radix-ui/react-select`        | `^2.1.1`   | Accessible select input primitives                 |
| `@radix-ui/react-slot`          | `^1.1.0`   | Polymorphic component rendering primitive          |
| `@radix-ui/react-tabs`          | `^1.1.0`   | Accessible tabs primitives                         |

### Development & Testing Dependencies

| Package                     | Version    | Purpose                                      |
| --------------------------- | ---------- | -------------------------------------------- |
| `vitest`                    | `^2.0.5`   | Fast Vite-native unit testing runner         |
| `@testing-library/react`    | `^16.0.0`  | React component testing harness              |
| `@testing-library/jest-dom` | `^6.4.8`   | Custom Jest matchers for DOM assertions      |
| `jsdom`                     | `^24.1.1`  | Headless browser DOM environment for Node.js |
| `@playwright/test`          | `^1.45.3`  | Critical browser end-to-end testing engine   |
| `eslint-config-next`        | `14.2.5`   | Official Next.js ESLint configuration        |
| `postcss`                   | `^8.4.40`  | CSS transformation pipeline                  |
| `autoprefixer`              | `^10.4.19` | Vendor prefix parser for CSS                 |

---

## 3. Backend Dependencies (`apps/api`)

Managed via `uv` in `apps/api/pyproject.toml` and locked in `apps/api/uv.lock`:

### Core Runtime

| Package                         | Version    | Purpose                                          |
| ------------------------------- | ---------- | ------------------------------------------------ |
| `django`                        | `>=5.0.0`  | High-level Python web framework                  |
| `djangorestframework`           | `>=3.15.0` | REST API toolkit for Django                      |
| `djangorestframework-simplejwt` | `>=5.3.1`  | JWT authentication with secure cookie rotation   |
| `django-cors-headers`           | `>=4.3.1`  | Cross-Origin Resource Sharing handling           |
| `django-filter`                 | `>=24.2`   | URL query parameter dynamic filtering            |
| `drf-spectacular`               | `>=0.27.2` | OpenAPI 3.0 specification & Swagger UI generator |
| `psycopg[binary]`               | `>=3.1.18` | Modern PostgreSQL database adapter               |
| `celery`                        | `>=5.4.0`  | Distributed asynchronous task queue              |
| `redis`                         | `>=5.0.3`  | Redis client for caching and Celery broker       |
| `python-dotenv`                 | `>=1.0.1`  | Environment variable loader (.env)               |

### Development & Testing

| Package         | Version   | Purpose                                         |
| --------------- | --------- | ----------------------------------------------- |
| `pytest`        | `>=8.1.0` | Python automated test framework                 |
| `pytest-django` | `>=4.8.0` | Django integration plugin for Pytest            |
| `ruff`          | `>=0.4.0` | Extremely fast Python linter and code formatter |
