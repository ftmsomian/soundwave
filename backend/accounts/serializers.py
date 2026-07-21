"""Serializer های accounts — عضو اول تکمیل می‌کنه."""
from rest_framework import serializers

from .models import Artist, User, UserSettings


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "display_name", "email", "role", "subscription",
            "avatar", "bio", "birth_date", "gender", "created_at",
        ]
        read_only_fields = ["id", "role", "subscription", "created_at"]


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = "__all__"


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ["notification_prefs", "language", "sound_volume"]
