from django.contrib import admin

from .models import DiscountRule, Invoice, InvoiceLine, TaxRule


@admin.register(TaxRule)
class TaxRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "rate_percent", "is_active", "created_at")


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "discount_type", "value", "scope", "times_used", "is_active")
    list_filter = ("scope", "discount_type", "is_active")
    search_fields = ("name", "code")


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number",
        "customer",
        "status",
        "issue_date",
        "due_date",
        "total_amount",
        "outstanding_balance",
    )
    list_filter = ("status", "issue_date", "due_date")
    search_fields = ("invoice_number", "customer__company_name")
    inlines = [InvoiceLineInline]
