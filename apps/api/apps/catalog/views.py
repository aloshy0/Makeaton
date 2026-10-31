from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import exceptions, filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.workspaces.mixins import TenantScopedMixin
from apps.workspaces.permissions import IsWorkspaceAdmin, IsWorkspaceMember

from .models import Product, ProductVariant, SubscriptionPlan
from .serializers import ProductSerializer, ProductVariantSerializer, SubscriptionPlanSerializer


class ProductViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = Product.objects.prefetch_related("variants").all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["product_type", "is_active"]
    search_fields = ["name", "code", "notes"]
    ordering_fields = ["name", "sales_price", "created_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsWorkspaceAdmin()]
        return [IsWorkspaceMember()]

    def perform_create(self, serializer):
        workspace = self.workspace
        plan = workspace.owner.get_flowgrid_plan()
        count = Product.objects.filter(workspace=workspace).count()
        if count >= plan.max_products_per_workspace:
            raise exceptions.ValidationError(
                {
                    "error": f"Product limit reached ({plan.max_products_per_workspace} max for your {plan.name} plan). Please upgrade your FlowGrid plan to add more products."
                }
            )
        return super().perform_create(serializer)


    @action(detail=True, methods=["get", "post"], url_path="variants")
    def variants(self, request, workspace_id, pk=None):
        product = self.get_object()
        if request.method == "POST":
            if not IsWorkspaceAdmin().has_permission(request, self):
                raise exceptions.PermissionDenied("Only Workspace Admins/Owners can add variants.")
            serializer = ProductVariantSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(product=product)
            return Response(serializer.data, status=201)

        variants = product.variants.all()
        return Response(ProductVariantSerializer(variants, many=True).data)


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsWorkspaceAdmin()]
        return [IsWorkspaceMember()]


class SubscriptionPlanViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["billing_interval", "is_active"]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "base_price", "created_at"]

    def get_permissions(self):
        if self.action == "published":
            return [permissions.AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsWorkspaceAdmin()]
        return [IsWorkspaceMember()]

    @action(detail=False, methods=["get"], url_path="published")
    def published(self, request, workspace_id):
        plans = SubscriptionPlan.objects.filter(workspace_id=workspace_id, is_active=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)
