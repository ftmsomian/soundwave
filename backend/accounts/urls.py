from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ArtistPublicProfileView,
    ArtistRegisterView,
    AvatarUploadView,
    FollowToggleView,
    ForgotPasswordView,
    LoginView,
    MeView,
    PublicProfileView,
    RegisterView,
    ResetPasswordView,
    UserSettingsView,
)

app_name = "accounts"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/register/artist/", ArtistRegisterView.as_view(), name="register-artist"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    path("users/me/", MeView.as_view(), name="me"),
    path("users/me/avatar/", AvatarUploadView.as_view(), name="me-avatar"),
    path("users/me/settings/", UserSettingsView.as_view(), name="me-settings"),
    path("users/<str:username>/", PublicProfileView.as_view(), name="public-profile"),
    path("users/<str:username>/follow/", FollowToggleView.as_view(), name="follow-toggle"),

    path("artists/<str:username>/", ArtistPublicProfileView.as_view(), name="artist-public-profile"),
]
