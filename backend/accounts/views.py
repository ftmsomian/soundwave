"""View های accounts — عضو اول (لاگین/ثبت‌نام/پروفایل/دنبال کردن/آواتار/تنظیمات)."""
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.conf import settings
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core.subscription_rules import CAN_UPLOAD_AVATAR

from .models import Artist, Follow, UserSettings
from .serializers import (
    ArtistRegisterSerializer,
    ArtistSerializer,
    ForgotPasswordSerializer,
    PublicUserSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    UserSettingsSerializer,
)

User = get_user_model()


def _tokens_for_user(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


# ---------------------------------------------------------------------------
# ثبت‌نام و ورود
# ---------------------------------------------------------------------------
class RegisterView(CreateAPIView):
    """POST /auth/register/"""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user, context={"request": request}).data, **_tokens_for_user(user)},
            status=status.HTTP_201_CREATED,
        )


class ArtistRegisterView(CreateAPIView):
    """POST /auth/register/artist/  -> وضعیت pending، منتظر تأیید پشتیبان/مدیر"""

    serializer_class = ArtistRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        artist = serializer.save()
        # توجه: اعلان خودکار به پشتیبان‌ها قبلاً روی سیگنال post_save در platform_ops بود.
        # چون آن اپ حذف شده، فعلاً اعلانی ساخته نمی‌شود. اگر بعداً سیستم اعلانات را از نو
        # پیاده کردید، این نقطه (ثبت‌نام هنرمند) باید دوباره به آن وصل شود.
        return Response(
            {
                "detail": "درخواست هنرمند شدن ثبت شد و در انتظار تأیید است.",
                "artist": ArtistSerializer(artist, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /auth/login/  body: {"email"/"username", "password"}"""

    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        if not identifier or not password:
            return Response({"detail": "ایمیل/نام‌کاربری و رمز عبور الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

        if not user or not user.check_password(password):
            return Response({"detail": "ایمیل/نام‌کاربری یا رمز عبور اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({"user": UserSerializer(user, context={"request": request}).data, **_tokens_for_user(user)})


# refresh توکن از rest_framework_simplejwt.views.TokenRefreshView مستقیماً در urls.py استفاده می‌شود


# ---------------------------------------------------------------------------
# فراموشی / بازیابی رمز عبور
# ---------------------------------------------------------------------------
token_generator = PasswordResetTokenGenerator()


class ForgotPasswordView(APIView):
    """POST /auth/forgot-password/  body: {"email": "..."}"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email=email).first()
        # عمداً حتی اگه کاربر پیدا نشد هم پیام موفقیت می‌دیم تا ایمیل‌های موجود لو نره
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_RESET_PASSWORD_URL}?uid={uid}&token={token}"
            send_mail(
                subject="بازیابی رمز عبور SoundWave",
                message=f"برای تعیین رمز جدید روی لینک زیر کلیک کنید:\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )

        return Response({"detail": "اگر این ایمیل در سامانه ثبت شده باشد، لینک بازیابی برایش ارسال شد."})


class ResetPasswordView(APIView):
    """POST /auth/reset-password/  body: {"uid", "token", "new_password"}"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "لینک بازیابی نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, data["token"]):
            return Response({"detail": "لینک بازیابی نامعتبر یا منقضی شده است."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "رمز عبور با موفقیت تغییر کرد."})


# ---------------------------------------------------------------------------
# پروفایل
# ---------------------------------------------------------------------------
class MeView(APIView):
    """GET/PATCH /users/me/   DELETE /users/me/"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicProfileView(APIView):
    """GET /users/{username}/"""

    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        return Response(PublicUserSerializer(user, context={"request": request}).data)


class FollowToggleView(APIView):
    """POST /users/{username}/follow/  (toggle)"""

    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target = get_object_or_404(User, username=username)
        if target == request.user:
            return Response({"detail": "نمی‌توانید خودتان را دنبال کنید."}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if not created:
            follow.delete()
            return Response({"following": False})
        return Response({"following": True})


class AvatarUploadView(APIView):
    """POST /users/me/avatar/  (multipart/form-data)  -- فقط silver/gold"""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if not CAN_UPLOAD_AVATAR.get(request.user.subscription, False):
            return Response(
                {"detail": "آپلود عکس پروفایل فقط برای اشتراک نقره‌ای و طلایی فعال است."},
                status=status.HTTP_403_FORBIDDEN,
            )

        avatar_file = request.FILES.get("avatar")
        if not avatar_file:
            return Response({"detail": "فایل آواتار الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.avatar = avatar_file
        request.user.save(update_fields=["avatar"])
        return Response(UserSerializer(request.user, context={"request": request}).data)


class UserSettingsView(APIView):
    """GET/PATCH /users/me/settings/"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings_obj, _ = UserSettings.objects.get_or_create(user=request.user)
        return Response(UserSettingsSerializer(settings_obj).data)

    def patch(self, request):
        settings_obj, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ArtistPublicProfileView(APIView):
    """GET /artists/{username}/  -- آمار کامل فقط برای بیننده‌ی طلایی"""

    permission_classes = [AllowAny]

    def get(self, request, username):
        artist = get_object_or_404(Artist, user__username=username)
        return Response(ArtistSerializer(artist, context={"request": request}).data)
