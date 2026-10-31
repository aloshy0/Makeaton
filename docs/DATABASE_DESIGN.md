# Brightloop Software — Subscription Management System
## Database Design & Entity Relationship Model

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| Customer : "owns"
    Customer ||--o{ Subscription : "holds"
    Customer ||--o{ Invoice : "billed"
    
    Product ||--o{ ProductVariant : "has"
    SubscriptionPlan ||--o{ Subscription : "defines"
    
    Subscription ||--o{ SubscriptionLine : "contains"
    Product ||--o{ SubscriptionLine : "specifies"
    ProductVariant ||--o{ SubscriptionLine : "modifies"
    
    Subscription ||--o{ Invoice : "generates"
    Invoice ||--o{ InvoiceLine : "contains"
    Invoice ||--o{ Payment : "settled_by"
    
    TaxRule ||--o{ InvoiceLine : "applies_to"
    DiscountRule ||--o{ Invoice : "discounts"
    QuotationTemplate ||--o{ QuotationTemplateLine : "includes"
```

---

## 2. Entity Specifications

### 2.1 `accounts_user`
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) UNIQUE NOT NULL (Username field)
- `first_name`: VARCHAR(150)
- `last_name`: VARCHAR(150)
- `role`: VARCHAR(20) NOT NULL (`ADMIN`, `STAFF`, `CUSTOMER`)
- `is_active`: BOOLEAN DEFAULT TRUE
- `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

### 2.2 `customers_customer`
- `id`: UUID (Primary Key)
- `user`: FK(User, null=True, blank=True, on_delete=SET_NULL)
- `company_name`: VARCHAR(255) NOT NULL
- `contact_name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) NOT NULL INDEX
- `phone`: VARCHAR(50)
- `billing_address`: TEXT
- `tax_id`: VARCHAR(50)
- `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

### 2.3 `catalog_product` & `catalog_productvariant`
- **Product**:
  - `id`: UUID (PK)
  - `name`: VARCHAR(255) NOT NULL
  - `code`: VARCHAR(50) UNIQUE NOT NULL
  - `product_type`: VARCHAR(20) (`software`, `addon`, `service`, `physical`)
  - `sales_price`: DECIMAL(12, 2) NOT NULL
  - `cost_price`: DECIMAL(12, 2) DEFAULT 0.00
  - `notes`: TEXT
  - `is_active`: BOOLEAN DEFAULT TRUE
- **ProductVariant**:
  - `id`: UUID (PK)
  - `product`: FK(Product, on_delete=CASCADE)
  - `attribute_name`: VARCHAR(100) (e.g., "Brand", "Edition")
  - `attribute_value`: VARCHAR(100) (e.g., "Odoo", "Enterprise")
  - `price_delta`: DECIMAL(12, 2) DEFAULT 0.00 (e.g., +560.00)

### 2.4 `catalog_subscriptionplan`
- `id`: UUID (PK)
- `name`: VARCHAR(255) NOT NULL
- `code`: VARCHAR(50) UNIQUE NOT NULL
- `billing_frequency`: VARCHAR(20) (`daily`, `weekly`, `monthly`, `yearly`)
- `cost`: DECIMAL(12, 2) NOT NULL
- `minimum_quantity`: INTEGER DEFAULT 1
- `start_date`: DATE NULL
- `end_date`: DATE NULL
- **Policies**:
  - `auto_close_on_end`: BOOLEAN DEFAULT TRUE
  - `allow_early_close`: BOOLEAN DEFAULT TRUE
  - `allow_pause`: BOOLEAN DEFAULT TRUE
  - `allow_renew`: BOOLEAN DEFAULT TRUE
  - `is_active`: BOOLEAN DEFAULT TRUE

### 2.5 `quotations_quotationtemplate` & Lines
- **QuotationTemplate**:
  - `id`: UUID (PK)
  - `name`: VARCHAR(255)
  - `plan`: FK(SubscriptionPlan)
  - `validity_days`: INTEGER DEFAULT 30
- **QuotationTemplateLine**:
  - `id`: UUID (PK)
  - `template`: FK(QuotationTemplate)
  - `product`: FK(Product)
  - `variant`: FK(ProductVariant, null=True)
  - `quantity`: INTEGER DEFAULT 1

### 2.6 `subscriptions_subscription` & Lines
- **Subscription**:
  - `id`: UUID (PK)
  - `subscription_number`: VARCHAR(50) UNIQUE NOT NULL INDEX
  - `customer`: FK(Customer, on_delete=PROTECT)
  - `plan`: FK(SubscriptionPlan, on_delete=PROTECT)
  - `status`: VARCHAR(20) (`draft`, `quotation`, `confirmed`, `active`, `paused`, `closed`) INDEX
  - `start_date`: DATE NOT NULL
  - `expiry_date`: DATE NULL
  - `next_billing_date`: DATE NULL INDEX
  - `payment_terms`: VARCHAR(20) (`due_on_receipt`, `net_15`, `net_30`, `net_60`)
  - `subtotal`: DECIMAL(12, 2) DEFAULT 0.00
  - `tax_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `discount_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `total_amount`: DECIMAL(12, 2) DEFAULT 0.00
- **SubscriptionLine**:
  - `id`: UUID (PK)
  - `subscription`: FK(Subscription, on_delete=CASCADE)
  - `product`: FK(Product, on_delete=PROTECT)
  - `variant`: FK(ProductVariant, null=True, on_delete=SET_NULL)
  - `quantity`: INTEGER DEFAULT 1
  - `unit_price`: DECIMAL(12, 2) NOT NULL
  - `subtotal`: DECIMAL(12, 2) NOT NULL

### 2.7 `billing_taxrule` & `billing_discountrule`
- **TaxRule**:
  - `id`: UUID (PK)
  - `name`: VARCHAR(100)
  - `rate_percent`: DECIMAL(5, 2) NOT NULL
  - `is_active`: BOOLEAN DEFAULT TRUE
- **DiscountRule**:
  - `id`: UUID (PK)
  - `name`: VARCHAR(100)
  - `code`: VARCHAR(50) UNIQUE NOT NULL
  - `discount_type`: VARCHAR(20) (`percentage`, `fixed`)
  - `value`: DECIMAL(12, 2) NOT NULL
  - `min_purchase_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `min_quantity`: INTEGER DEFAULT 0
  - `start_date`: DATE NULL
  - `end_date`: DATE NULL
  - `max_uses`: INTEGER NULL
  - `times_used`: INTEGER DEFAULT 0
  - `scope`: VARCHAR(20) (`product`, `subscription`)
  - `target_product`: FK(Product, null=True, blank=True)
  - `is_active`: BOOLEAN DEFAULT TRUE

### 2.8 `billing_invoice` & `billing_invoiceline`
- **Invoice**:
  - `id`: UUID (PK)
  - `invoice_number`: VARCHAR(50) UNIQUE NOT NULL INDEX
  - `subscription`: FK(Subscription, null=True, on_delete=SET_NULL)
  - `customer`: FK(Customer, on_delete=PROTECT)
  - `billing_period_start`: DATE
  - `billing_period_end`: DATE
  - `issue_date`: DATE NOT NULL
  - `due_date`: DATE NOT NULL INDEX
  - `status`: VARCHAR(20) (`draft`, `confirmed`, `paid`, `cancelled`) INDEX
  - `subtotal`: DECIMAL(12, 2) NOT NULL
  - `tax_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `discount_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `total_amount`: DECIMAL(12, 2) NOT NULL
  - `paid_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `outstanding_balance`: DECIMAL(12, 2) NOT NULL INDEX
  - `idempotency_key`: VARCHAR(100) UNIQUE NULL INDEX
- **InvoiceLine**:
  - `id`: UUID (PK)
  - `invoice`: FK(Invoice, on_delete=CASCADE)
  - `description`: VARCHAR(255)
  - `product`: FK(Product, null=True, on_delete=SET_NULL)
  - `variant`: FK(ProductVariant, null=True, on_delete=SET_NULL)
  - `quantity`: INTEGER DEFAULT 1
  - `unit_price`: DECIMAL(12, 2) NOT NULL
  - `tax_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `discount_amount`: DECIMAL(12, 2) DEFAULT 0.00
  - `line_total`: DECIMAL(12, 2) NOT NULL

### 2.9 `payments_payment`
- **Payment**:
  - `id`: UUID (PK)
  - `payment_number`: VARCHAR(50) UNIQUE NOT NULL
  - `invoice`: FK(Invoice, on_delete=PROTECT, related_name='payments')
  - `amount`: DECIMAL(12, 2) NOT NULL
  - `payment_method`: VARCHAR(20) (`credit_card`, `bank_transfer`, `cash`, `check`, `other`)
  - `payment_date`: DATE NOT NULL INDEX
  - `reference`: VARCHAR(100)
  - `notes`: TEXT
