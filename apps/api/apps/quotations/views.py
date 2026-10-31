from rest_framework import filters, viewsets

from apps.accounts.permissions import IsStaffOrAdmin

from .models import QuotationTemplate, QuotationTemplateLine
from .serializers import QuotationTemplateLineSerializer, QuotationTemplateSerializer


class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.prefetch_related("lines__product", "lines__variant").all()
    serializer_class = QuotationTemplateSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class QuotationTemplateLineViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplateLine.objects.all()
    serializer_class = QuotationTemplateLineSerializer
    permission_classes = [IsStaffOrAdmin]
