from django.contrib import admin

from .models import QuotationTemplate, QuotationTemplateLine


class QuotationTemplateLineInline(admin.TabularInline):
    model = QuotationTemplateLine
    extra = 1


@admin.register(QuotationTemplate)
class QuotationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "plan", "validity_days", "created_at")
    inlines = [QuotationTemplateLineInline]
