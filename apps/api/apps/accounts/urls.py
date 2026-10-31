from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    ActiveContextSwitchView,
    ContextPermissionsView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    UserContextsView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("login/", LoginView.as_view(), name="auth_login"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="auth_me"),
    path("me/contexts/", UserContextsView.as_view(), name="auth_me_contexts"),
    path("me/active-context/", ActiveContextSwitchView.as_view(), name="auth_active_context"),
    path("me/permissions/", ContextPermissionsView.as_view(), name="auth_context_permissions"),
]
