# FlowGrid

[![CI](https://github.com/aloshy0/Makeaton/actions/workflows/ci.yml/badge.svg)](https://github.com/aloshy0/Makeaton/actions)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Django REST Framework](https://img.shields.io/badge/API-Django%20REST%20Framework-green)](https://www.django-rest-framework.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Keep your business in flow.** FlowGrid is a subscription management platform for managing products, customers, subscriptions, invoices, and payments in one place.

## What you can do

- Manage business workspaces, products, customers, and subscription plans.
- Track subscriptions through their billing lifecycle.
- Create invoices, record payments, and review recurring revenue.
- Invite team members with role-based permissions.
- Give customers a portal to view their subscriptions and invoices.

FlowGrid is built as a modular monolith: the Next.js web app and Django API live in this repository and work together as one product.

## Technology

- **Web:** Next.js 14, React, TypeScript, and Tailwind CSS
- **API:** Django REST Framework and JWT authentication
- **Data and background work:** PostgreSQL, Redis, and Celery
- **Tests:** Vitest, Playwright, and pytest

## Run locally

### Requirements

- Node.js 22 or later and pnpm
- Python 3.12 or later

### 1. Configure the API

From the project root:

```bash
cp .env.example .env
```

For a simple local demo, add this line to the root `.env` file to use SQLite instead of PostgreSQL:

```dotenv
USE_SQLITE=True
```

Create the Python environment, install the API dependencies, set up the database, and load demo data:

```bash
python3 -m venv apps/api/.venv
source apps/api/.venv/bin/activate
pip install -r apps/api/requirements.txt
cd apps/api
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

The API runs at [http://localhost:8000](http://localhost:8000). Interactive API documentation is at [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/).

### 2. Start the web app

In a second terminal, from the project root:

```bash
pnpm install
pnpm --filter brightloop-web dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

After running `seed_demo_data`, use one of these local demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Business owner | `owner@flowgrid.com` | `StrongPassword123!` |
| Staff member | `staff@flowgrid.com` | `StrongPassword123!` |
| Customer portal | `customer@acme.com` | `StrongPassword123!` |

These credentials are for local demonstration only. Do not use them in a deployed environment.

This setup is intended for local demos. Before deployment, set unique secrets, disable Django debug mode, and remove demo accounts.

## Google Sign-In (optional)

Google Sign-In requires a Google OAuth Web application client. Add the client ID and secret to the root `.env` as `OAUTH2_GOOGLE_CLIENT_ID` and `OAUTH2_GOOGLE_CLIENT_SECRET`, then add the client ID to `apps/web/.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Configure the allowed frontend origins in Google Cloud Console and restart both apps.

See [Google Sign-In setup](docs/GOOGLE_SIGN_IN.md) for local and production configuration. Keep the client secret on the API; never put it in a `NEXT_PUBLIC_` variable.

## Run with Docker

Docker Compose starts the web app, API, PostgreSQL, Redis, and Celery services:

```bash
docker compose up --build
```

In another terminal, initialize the database and demo data:

```bash
docker compose exec api python manage.py migrate
docker compose exec api python manage.py seed_demo_data
```

Then open [http://localhost:3000](http://localhost:3000). Google Sign-In is optional; configure its environment variables before starting the services if you want to demo it.

## Checks

From the project root:

```bash
pnpm test:web
pnpm lint:web
pnpm build:web
```

With the API virtual environment activated:

```bash
cd apps/api
pytest
ruff check .
```

## Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Requirements](docs/REQUIREMENTS.md)
- [API catalog](docs/API_CATALOG.md)
- [Database design](docs/DATABASE_DESIGN.md)
- [Roles and permissions](docs/API_PERMISSION_MATRIX.md)
- [Google Sign-In setup](docs/GOOGLE_SIGN_IN.md)

## Demo limitations

Email verification and password recovery are not connected to backend endpoints yet. Do not treat their prototype screens as working email flows.
