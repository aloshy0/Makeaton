from django.contrib import admin

from .models import Product, ProductVariant, SubscriptionPlan


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "product_type", "sales_price", "cost_price", "is_active")
    list_filter = ("product_type", "is_active")
    search_fields = ("name", "code")
    inlines = [ProductVariantInline]


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "billing_frequency", "cost", "minimum_quantity", "is_active")
    list_filter = ("billing_frequency", "is_active")
    search_fields = ("name", "code")
