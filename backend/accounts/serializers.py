"""Serializer های accounts — عضو اول."""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import GENDER_CHOICES, Artist, Follow, User, UserSettings

UserModel = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "display_name", "email", "role", "subscription",
            "subscription_expires_at", "avatar", "bio", "birth_date", "gender",
            "created_at", "followers_count", "following_count",
        ]
        read_only_fields = ["id", "role", "subscription", "subscription_expires_at", "created_at"]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()


class PublicUserSerializer(serializers.ModelSerializer):
    """پروفایل عمومی — بدون فیلدهای خصوصی (ایمیل، تاریخ تولد و ...)."""

    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_followed_by_me = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "display_name", "role", "subscription",
            "avatar", "bio", "followers_count", "following_count", "is_followed_by_me",
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_followed_by_me(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user, following=obj).exists()


class RegisterSerializer(serializers.ModelSerializer):
    """
    مطابق مستند پروژه (بخش ۲.۱)، کاربر عادی هنگام ثبت‌نام «نام نمایشی» وارد می‌کند،
    نه نام‌کاربری — نام‌کاربری را خودِ سامانه اختصاص می‌دهد. بنابراین «username» عمداً
    در ورودی‌های این سریالایزر نیست (فقط داخلی، در create ساخته می‌شود).

    نکته‌ی باگ رفع‌شده: چون فیلدهای email/display_name/birth_date/gender روی مدل
    User با blank=True تعریف شده‌اند (برای اینکه ادمین بتونه بدون این مقادیر هم کاربر
    بسازه)، DRF به‌صورت پیش‌فرض این فیلدها را «اختیاری» می‌گرفت؛ در حالی که طبق مستند
    پروژه، همه‌ی این فیلدها در فرم ثبت‌نام اجباری هستند. اینجا صریحاً required=True
    ست شده تا این مغایرت رفع بشه.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    display_name = serializers.CharField(required=True, max_length=100)
    birth_date = serializers.DateField(required=True)
    gender = serializers.ChoiceField(choices=GENDER_CHOICES, required=True)

    class Meta:
        model = User
        fields = ["email", "display_name", "password", "password_confirm", "birth_date", "gender"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("این ایمیل قبلاً ثبت‌نام کرده است.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "رمز عبور و تکرار آن یکسان نیستند."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.username = self._generate_unique_username(validated_data["email"])
        user.set_password(password)
        user.role = "user"
        user.save()
        return user

    @staticmethod
    def _generate_unique_username(email: str) -> str:
        """نام‌کاربری را از روی ایمیل می‌سازد و در صورت تکراری بودن، یک پسوند عددی اضافه می‌کند."""
        base = email.split("@")[0] or "user"
        username = base
        suffix = 1
        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f"{base}{suffix}"
        return username


class ArtistRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    artist_name = serializers.CharField()
    portfolio_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Artist
        fields = ["email", "password", "password_confirm", "artist_name", "portfolio_url"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("این ایمیل قبلاً ثبت‌نام کرده است.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "رمز عبور و تکرار آن یکسان نیستند."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        artist_name = validated_data.pop("artist_name")
        portfolio_url = validated_data.pop("portfolio_url", "")

        user = User(email=email, username=email.split("@")[0], display_name=artist_name, role="artist")
        user.set_password(password)
        user.save()

        artist = Artist.objects.create(
            user=user, artist_name=artist_name, portfolio_url=portfolio_url, status="pending"
        )
        return artist


class ArtistSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    is_gold_viewer = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = [
            "id", "username", "artist_name", "status", "rejection_reason",
            "portfolio_url", "is_verified", "total_streams", "unique_listeners",
            "monthly_earnings", "created_at", "is_gold_viewer",
        ]
        read_only_fields = [
            "status", "rejection_reason", "is_verified",
            "total_streams", "unique_listeners", "monthly_earnings", "created_at",
        ]

    def get_is_gold_viewer(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and request.user.subscription == "gold")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # آمار کامل فقط برای بیننده‌ی طلایی نمایش داده می‌شه
        if not data.pop("is_gold_viewer", False):
            data["total_streams"] = None
            data["unique_listeners"] = None
        return data


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ["notification_prefs", "language", "sound_volume"]


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
