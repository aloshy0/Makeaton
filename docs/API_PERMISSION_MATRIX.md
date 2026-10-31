# Brightloop Software — Multi-Tenant Subscription SaaS Platform

## Role-Based Access Control (RBAC) & API Permission Matrix

**Document Version:** 3.0.0 (Multi-Tenant SaaS Architecture)  
**Roles:** `OWNER`, `ADMIN`, `STAFF`, `CUSTOMER`

---

## 1. Multi-Tenant Role Matrix

| Endpoint / Action                                   | OWNER |    ADMIN    |         STAFF         |             CUSTOMER              |     Anonymous     |
| :-------------------------------------------------- | :---: | :---------: | :-------------------: | :-------------------------------: | :---------------: |
| **Auth Register / Login / Refresh**                 | Allow |    Allow    |         Allow         |               Allow               |       Allow       |
| **List / Create Workspaces**                        | Allow |    Allow    |         Allow         |      Allow (Creates new WS)       |       Deny        |
| **Update / Delete Workspace Settings**              | Allow | Deny Delete |         Deny          |               Deny                |       Deny        |
| **List Workspace Memberships**                      | Allow |    Allow    |     Allow (Read)      |               Deny                |       Deny        |
| **Invite Staff / Revoke Invites**                   | Allow |    Allow    |         Deny          |               Deny                |       Deny        |
| **Accept Staff Invitation**                         | Allow |    Allow    |         Allow         |               Allow               | Allow (via Token) |
| **Catalog Products & Variants (Create/Update)**     | Allow |    Allow    |       Read-Only       |               Deny                |       Deny        |
| **Subscription Plans (Create/Update)**              | Allow |    Allow    |       Read-Only       |        Read-Only (Portal)         |       Deny        |
| **Customers Management**                            | Allow |    Allow    |         Allow         |      Deny (Own Profile only)      |       Deny        |
| **Quotations & Templates**                          | Allow |    Allow    |         Allow         |      Deny (Own Quotes only)       |       Deny        |
| **Subscriptions (Create / Transitions)**            | Allow |    Allow    |      Operational      |   Own Active (Allowed Actions)    |       Deny        |
| **Sensitive Transitions (Early Close / Write-off)** | Allow |    Allow    | **Requires Approval** |               Deny                |       Deny        |
| **Invoices (Confirm / Cancel)**                     | Allow |    Allow    |     Allow Confirm     |       Deny (Read Own only)        |       Deny        |
| **Payments (Record Settlement)**                    | Allow |    Allow    |         Allow         |        Settle Own Invoices        |       Deny        |
| **Tax & Discount Rules (Create/Update)**            | Allow |    Allow    |       Read-Only       |               Deny                |       Deny        |
| **Dashboard Summary & Executive Reports**           | Allow |    Allow    |   Operational KPIs    |               Deny                |       Deny        |
| **Audit Logs Inspection**                           | Allow |    Allow    |         Deny          |               Deny                |       Deny        |
| **Customer Portal Routes**                          | Allow |    Allow    |  Deny (Portal View)   | **Allow (Scoped to Own Profile)** |       Deny        |

---

## 2. Staff Limited Power & Approval Rules

- Staff can perform daily operational actions: drafting quotes, confirming orders, recording payments, and initiating invoices.
- **Sensitive Operations Requiring Admin/Owner Approval**:
  - Subscription early cancellation without contract fulfillment.
  - Applying custom discounts exceeding standard rules.
  - Invoice write-offs or manual cancellations of confirmed invoices.
  - Changing customer tax exemptions.

---

## 3. Strict Cross-Tenant Denials

Any request made with valid authentication credentials for Workspace A against resources belonging to Workspace B returns:

- HTTP 403 Forbidden (if user has no membership in Workspace B).
- HTTP 404 Not Found (if resource does not exist within the scoped tenant).
