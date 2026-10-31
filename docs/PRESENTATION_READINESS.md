# FlowGrid presentation readiness

**Review date:** 2026-10-31  
**Branch:** `feature/multi-tenant-saas-fullstack`  
**Scope:** Landing footer scroll behavior, workspace dashboard and reports, reporting API permissions, and local full-stack presentation setup.

## Verdict

**Ready for a controlled local rehearsal using seeded demo data. Not ready to claim production readiness.** The landing page visual design was retained. The footer's in-page links now use their actual section anchors and work with Lenis, native scrolling, and reduced-motion preferences. Dashboard and report figures come from the workspace reporting API; they no longer use the dashboard's local placeholder metrics. A seeded customer login was verified against the local API and its three persisted subscription records rendered in the personal portal. Customer memberships route to the personal portal at sign-in; business roles continue to the workspace dashboard.

The rehearsal environment must be distinguished from a production-like environment. The regular PostgreSQL configuration currently fails database authentication, Redis is not connected, and the unauthenticated account context still initializes placeholder account data. Those are material reliability and security issues to resolve before presenting the app as production-ready or using it with real accounts/data.

## Verification record

| Check                         | Result  | Notes                                                                                                                                |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend unit suite           | PASS    | 4 Vitest tests                                                                                                                       |
| Frontend lint                 | PASS    | `next lint`, no warnings or errors                                                                                                   |
| Frontend production build     | PASS    | All 35 routes generated; 1 dynamic checkout route                                                                                    |
| Backend lint                  | PASS    | `ruff check .`                                                                                                                       |
| Backend suite                 | PASS    | 20 tests using a disposable SQLite test database                                                                                     |
| Backend migration + demo seed | PASS    | Separate SQLite file under the OS temp directory                                                                                     |
| Live API health               | PARTIAL | HTTP 200; database connected; Redis disconnected                                                                                     |
| Browser presentation paths    | PARTIAL | Landing page/footer targets and seeded customer login/subscription list verified; workspace reports and mobile layout need rehearsal |
| Regular PostgreSQL run        | BLOCKED | Configured database credentials were rejected in this environment                                                                    |

Passing tests do not prove all application flows. Existing tests cover multi-tenant and core behavior, but there is no complete automated end-to-end suite for every route.

## Known release blockers

1. **Database and background jobs:** Repair the PostgreSQL credentials/configuration and bring Redis/Celery online. Verify readiness endpoints before a production-style demo.
2. **Unauthenticated account context:** `apps/web/src/context/account-context.tsx` initializes placeholder user/membership data when there is no access token. Ensure unauthenticated state remains empty and protected routes require real authentication before any shared or public deployment.
3. **Mock fallbacks outside reporting:** Other API methods and account/workspace flows still contain sample data or local success fallbacks. Audit and remove/guard them before presenting mutations as persistent backend operations.
4. **Reporting semantics:** Confirm the business definition for MRR normalization across daily and weekly billing before using the values as official financial reporting.
5. **Legal and commercial statements:** The landing page contains trial, cancellation and support statements. Confirm those claims and publish actual policy documents before public launch.

## Presentation sequence

1. Start the isolated demo database, apply migrations, and seed the documented sample records.
2. Start the API and frontend using the commands in `docs/END_USER_TEST_PLAN.md`.
3. Verify `/api/v1/health/` reports the expected database connection. Redis may be disconnected in the local rehearsal and must not be described as operational.
4. Open the landing page, keep its existing hero and section design, and test footer links to Products, Plans, Customers, Billing, Analytics, Back to top, and the legal dialog.
5. Sign in using the explicitly labeled local demo account, then verify dashboard and reports values load from the API. Do not describe seeded rows as live customer activity.
6. If the API reports an error or dashboard/report metrics are missing, stop the demo rather than presenting placeholder figures.

## Immediate follow-up plan

| Priority | Work                                                                                    | Acceptance condition                                                                |
| -------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| P0       | Fix PostgreSQL credentials and validate the configured database                         | API starts on the intended database and health/readiness checks pass                |
| P0       | Remove automatic demo sign-in and default demo identity                                 | Unauthenticated visitors remain unauthenticated; demo access is explicit            |
| P0       | Audit mocked mutation fallbacks across API/account modules                              | Failed API writes show an error and never claim persistent success                  |
| P1       | Start Redis, Celery worker and scheduler                                                | Queue health is confirmed and scheduled billing tasks run once in a controlled test |
| P1       | Add browser end-to-end coverage for auth, workspace isolation, billing and portal flows | Critical user journeys pass against an isolated test database                       |
| P1       | Resolve reporting definitions and verify role permissions against the permission matrix | Approved definitions and owner/admin/staff/customer tests agree                     |
| P2       | Validate responsive layout and accessibility across supported viewport sizes            | No clipping, keyboard traps, dead links or contrast failures in the review matrix   |
