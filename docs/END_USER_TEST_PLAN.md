# End-user test plan and local presentation setup

## Safe local setup (Windows PowerShell)

The demo configuration uses a separate SQLite file under `%TEMP%`; it does not connect to or migrate the configured PostgreSQL database.

### Terminal 1: API

```powershell
cd D:\PROGRAMING\hackthon\apps\api
$env:FLOWGRID_SQLITE_DB = Join-Path $env:TEMP 'flowgrid-teacher-demo-20261031-1710.sqlite3'
& .venv\Scripts\python.exe manage.py migrate --settings=config.local_demo_settings
& .venv\Scripts\python.exe manage.py seed_demo_data --settings=config.local_demo_settings
& .venv\Scripts\python.exe manage.py runserver 127.0.0.1:8002 --settings=config.local_demo_settings
```

To use a different isolated database file, set `$env:FLOWGRID_SQLITE_DB` to its full path before these commands. Keep that path separate from `apps/api/db.sqlite3` and any configured PostgreSQL database.

### Terminal 2: frontend

```powershell
cd D:\PROGRAMING\hackthon\apps\web
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8002/api/v1'
pnpm run dev -- --port 3002
```

Open `http://localhost:3002`. The default production build command is `pnpm run build`; `pnpm run start -- --port 3002` serves the latest build. Rebuild after changing `NEXT_PUBLIC_API_URL`, because Next.js embeds it into the client bundle.

## Seeded demo accounts

These credentials are for the isolated local demo database only. The owner account opens the FlowGrid Cloud Technologies business workspace. The customer account opens the personal portal and shows seeded subscription and billing records.

| Persona           | Email                | Password             | Landing route |
| ----------------- | -------------------- | -------------------- | ------------- |
| Business owner    | `owner@flowgrid.com` | `StrongPassword123!` | `/dashboard`  |
| Personal customer | `customer@acme.com`  | `StrongPassword123!` | `/portal`     |

The customer has three persisted subscription records in the seeded workspace, including active and paused states. Use `/portal/subscriptions` to show the full details. The portal dashboard also includes visual sample offers/payment rows; describe these as demo examples, not live payment gateway data.

## Manual end-user scenarios

| ID        | Scenario                                                             | Expected result                                                                                                                | Status in this review                                                              |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| LP-01     | Open `/` at desktop and narrow viewport widths                       | Existing landing sections remain present; no blank page or runtime error                                                       | Desktop browser render verified; narrow viewport needs a dedicated responsive pass |
| LP-02     | Use footer Platform links                                            | Products, Plans, Customers, Billing and Analytics reach their corresponding section IDs without conflicting with smooth scroll | Footer targets verified in browser DOM; manually click-check before recording      |
| LP-03     | Enable reduced motion and use footer links                           | Navigation uses immediate/native scrolling and avoids Lenis animation                                                          | Code path implemented; browser preference scenario not automated                   |
| LP-04     | Open legal dialog, switch tabs, close by Escape, close by backdrop   | Dialog remains keyboard dismissible and page scroll is restored                                                                | Existing interaction code reviewed; confirm active browser before presentation     |
| DB-01     | Load Dashboard with an active business workspace                     | Loading, API error, empty state and API-backed metrics are distinguishable; no sample KPI appears on API failure               | Implemented; metrics and role permissions covered by backend regression suite      |
| DB-02     | Load Reports with an active workspace                                | Summary and monthly collections reflect reporting API; CSV uses returned decimal strings                                       | Implemented; confirm with seeded API data                                          |
| DB-03     | Open Dashboard/Reports without a workspace                           | User gets a clear path to `/workspaces`                                                                                        | Implemented                                                                        |
| API-01    | Owner reads workspace dashboard                                      | `200`, workspace-scoped metrics, decimal money strings and six calendar months                                                 | Covered by backend regression test                                                 |
| API-02    | Customer reads business dashboard                                    | `403`                                                                                                                          | Covered by backend regression test                                                 |
| API-03    | Staff without `can_view_reports` reads dashboard                     | `403`                                                                                                                          | Covered by backend regression test                                                 |
| API-04    | Staff with `can_view_reports` reads dashboard                        | `200`                                                                                                                          | Covered by backend regression test                                                 |
| API-05    | Different workspace owner reads another tenant's dashboard           | `403`                                                                                                                          | Covered by backend regression test                                                 |
| ENV-01    | Check local demo API health                                          | HTTP 200 and SQLite connected; Redis status is visible                                                                         | HTTP 200 and database connected observed; Redis is disconnected                    |
| PORTAL-01 | Sign in as the seeded Acme customer and open `/portal/subscriptions` | Customer is routed to personal account and sees three stored subscriptions with billing/renewal/status details                 | Sign-in and API-backed subscription list verified in browser                       |

## Test evidence

- Frontend: `pnpm run test` (4 passed), `pnpm run lint` (passed), and `pnpm run build` (passed; 35 routes).
- Backend: `ruff check .` (passed) and `pytest` (20 passed using an isolated temporary SQLite test database).
- API integration rehearsal: Django migrations and `seed_demo_data` completed against an isolated temporary SQLite database. `/api/v1/health/` returned HTTP 200 with the database connected and Redis disconnected.
- The tests above do not certify every route or all browser/device combinations. Run LP-01 through ENV-01 before each presentation.
