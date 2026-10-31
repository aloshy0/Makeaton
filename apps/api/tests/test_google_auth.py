import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APIClient

GOOGLE_PROFILE = {
    "sub": "google-sub-123",
    "email": "flowgrid.user@example.com",
    "first_name": "Flow",
    "last_name": "User",
    "name": "Flow User",
    "picture": "https://example.com/profile.png",
}
ORIGIN = "http://localhost:3000"


@pytest.fixture
def google_client(monkeypatch, settings):
    from apps.accounts import views

    settings.CORS_ALLOWED_ORIGINS = [ORIGIN]
    monkeypatch.setattr(views, "exchange_google_code", lambda code, redirect: "verified-id-token")
    monkeypatch.setattr(views, "verify_google_id_token", lambda token: GOOGLE_PROFILE.copy())
    client = APIClient()
    client.defaults["HTTP_ORIGIN"] = ORIGIN
    client.defaults["HTTP_X_REQUESTED_WITH"] = "XmlHttpRequest"
    return client


@pytest.mark.django_db
def test_google_registration_and_existing_login_use_one_account(google_client):
    response = google_client.post("/api/v1/auth/google/", {"code": "google-code"}, format="json")
    assert response.status_code == 200
    assert response.data["is_new_user"] is True
    assert response.data["user"]["email"] == GOOGLE_PROFILE["email"]
    assert response.data["user"]["profile_picture"] == GOOGLE_PROFILE["picture"]
    assert response.data["access"]
    assert response.cookies["refresh_token"]["httponly"] is True

    response = google_client.post("/api/v1/auth/google/", {"code": "google-code"}, format="json")
    assert response.status_code == 200
    assert response.data["is_new_user"] is False
    assert get_user_model().objects.filter(email=GOOGLE_PROFILE["email"]).count() == 1
    refresh_to_rotate = google_client.cookies["refresh_token"].value

    refresh = google_client.post("/api/v1/auth/token/refresh/")
    assert refresh.status_code == 200
    assert refresh.data["access"]
    assert "refresh" not in refresh.data
    assert refresh.cookies["refresh_token"]["httponly"] is True
    assert refresh.cookies["refresh_token"].value != refresh_to_rotate

    google_client.cookies.clear()
    replay = google_client.post(
        "/api/v1/auth/token/refresh/", {"refresh": refresh_to_rotate}, format="json"
    )
    assert replay.status_code == 401

    google_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.data['access']}")
    assert google_client.get("/api/v1/auth/me/").status_code == 200


@pytest.mark.django_db
@override_settings(GOOGLE_CLIENT_ID="flowgrid-web-client")
def test_google_token_verifier_rejects_malformed_id_tokens():
    from apps.accounts.views import verify_google_id_token

    with pytest.raises(ValueError):
        verify_google_id_token("not.a.valid-google-id-token")


@pytest.mark.django_db
def test_google_linking_requires_existing_password(google_client):
    user = get_user_model().objects.create_user(
        email=GOOGLE_PROFILE["email"], password="SecurePass123!"
    )
    response = google_client.post("/api/v1/auth/google/", {"code": "google-code"}, format="json")
    assert response.status_code == 409
    assert response.data["code"] == "account_link_required"
    link_token = response.data["link_token"]

    response = google_client.post(
        "/api/v1/auth/google/",
        {"link_token": link_token, "password": "wrong-password"},
        format="json",
    )
    assert response.status_code == 401
    assert user.google_sub is None

    response = google_client.post(
        "/api/v1/auth/google/",
        {"link_token": link_token, "password": "SecurePass123!"},
        format="json",
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.google_sub == GOOGLE_PROFILE["sub"]
    assert response.data["user"]["email"] == GOOGLE_PROFILE["email"]


@pytest.mark.django_db
def test_google_request_origin_and_logout(google_client):
    google_client.defaults.pop("HTTP_ORIGIN")
    response = google_client.post("/api/v1/auth/google/", {"code": "google-code"}, format="json")
    assert response.status_code == 403

    google_client.defaults["HTTP_ORIGIN"] = ORIGIN
    response = google_client.post("/api/v1/auth/google/", {"code": "google-code"}, format="json")
    google_client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    refresh_token = google_client.cookies["refresh_token"].value
    logout = google_client.post("/api/v1/auth/logout/")
    assert logout.status_code == 200
    assert logout.cookies["refresh_token"]["max-age"] == 0
    refresh = google_client.post(
        "/api/v1/auth/token/refresh/", {"refresh": refresh_token}, format="json"
    )
    assert refresh.status_code == 401


@pytest.mark.django_db
def test_password_registration_still_returns_a_session(google_client):
    response = google_client.post(
        "/api/v1/auth/register/",
        {
            "email": "password.user@example.com",
            "password": "SecurePass123!",
            "first_name": "Password",
            "last_name": "User",
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["access"]
    assert response.cookies["refresh_token"]["httponly"] is True
