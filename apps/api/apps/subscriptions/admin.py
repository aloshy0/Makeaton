from django.contrib import admin

from .models import Subscription, SubscriptionLine


class SubscriptionLineInline(admin.TabularInline):
    model = SubscriptionLine
    extra = 1


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "subscription_number",
        "customer",
        "plan",
        "status",
        "start_date",
        "total_amount",
        "created_at",
    )
    list_filter = ("status", "payment_terms", "start_date")
    search_fields = ("subscription_number", "customer__company_name")
    inlines = [SubscriptionLineInline]
