# Brightloop Software — Open Architectural & Business Questions

This document tracks edge cases, business choices, and non-blocking architectural assumptions requiring confirmation as development evolves.

---

| ID | Topic | Description & Current Working Assumption | Impact / Status |
|---|---|---|---|
| **OQ-01** | Proration Policy on Mid-Cycle Upgrades | When a customer upgrades a plan or adds variants mid-billing cycle, should proration be computed down to the exact day, or applied on the subsequent billing date? **Working Assumption:** Standard daily proration is calculated when transitioning active subscriptions mid-cycle; automated renewal retains original cycle anchor. | Low / Decided with standard default |
| **OQ-02** | Grace Period for Overdue Subscriptions | Does an unpaid overdue invoice immediately suspend/close an active subscription, or is there a grace period (e.g., 7 days)? **Working Assumption:** System flags the subscription with a warning banner and overdue notice, keeping status `Active` until manual intervention or configured grace expiration (14 days default). | Medium / Configurable via policy |
| **OQ-03** | Multi-Currency Support | Does Brightloop bill in single currency (USD) or multiple currencies? **Working Assumption:** Primary currency is USD (`$`), with monetary values stored as exact `Decimal(12, 2)` to eliminate floating-point rounding errors. Multi-currency code column included in DB for forward compatibility. | Low / Implemented safely |
| **OQ-04** | Email Delivery Backend | Production email provider (SendGrid, Postmark, AWS SES) vs. local console backend. **Working Assumption:** In development/testing, Django outputs emails to console or in-memory backend; settings allow simple environment variable activation of SMTP/SendGrid. | Low / Handled in environment settings |
| **OQ-05** | Customer Portal Self-Cancellation | Does the customer have authority to immediately cancel or only request cancellation? **Working Assumption:** If the plan's `allow_early_close` flag is True, customer can trigger cancellation; otherwise, the portal presents a "Request Cancellation" workflow. | Low / Respects Plan Flags |
