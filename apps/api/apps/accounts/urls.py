from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from .views import (
    ActiveContextSwitchView,
    CancelSubscriptionView,
    ContextPermissionsView,
    CookieTokenRefreshView,
    GoogleSignInView,
    LoginView,
    LogoutView,
    MeView,
    PaymentMethodListCreateView,
    PersonalDashboardView,
    PlatformPlansListView,
    RegisterView,
    UpgradePlanView,
    UserContextsView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", LoginView.as_view(), name="auth_login"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
    path("google/", GoogleSignInView.as_view(), name="auth_google"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="auth_me"),
    path("me/contexts/", UserContextsView.as_view(), name="auth_me_contexts"),
    path("me/active-context/", ActiveContextSwitchView.as_view(), name="auth_active_context"),
    path("me/permissions/", ContextPermissionsView.as_view(), name="auth_context_permissions"),
    path("platform-plans/", PlatformPlansListView.as_view(), name="platform_plans_list"),
    path("me/personal-dashboard/", PersonalDashboardView.as_view(), name="personal_dashboard"),
    path("me/upgrade-plan/", UpgradePlanView.as_view(), name="upgrade_plan"),
    path(
        "me/payment-methods/",
        PaymentMethodListCreateView.as_view(),
        name="payment_methods_list_create",
    ),
    path("me/cancel-subscription/", CancelSubscriptionView.as_view(), name="cancel_subscription"),
]
