"""DRF serializers for Member 3's platform operations API."""
from rest_framework import serializers

from accounts.models import Artist

from .models import (
    MonthlyAccounting,
    Notification,
    SubscriptionPricing,
    Ticket,
    TicketMessage,
    Transaction,
)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "type", "title", "message", "is_read", "link", "created_at"]
        read_only_fields = fields


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source="sender.role", read_only=True)

    class Meta:
        model = TicketMessage
        fields = ["id", "ticket", "sender", "sender_name", "sender_role", "content", "created_at"]
        read_only_fields = ["id", "ticket", "sender", "sender_name", "sender_role", "created_at"]

    def get_sender_name(self, obj):
        return obj.sender.display_name or obj.sender.username

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("متن پیام نمی‌تواند خالی باشد.")
        return value


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ["id", "user", "user_name", "subject", "status", "messages", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "user_name", "status", "messages", "created_at", "updated_at"]

    def get_user_name(self, obj):
        return obj.user.display_name or obj.user.username

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("موضوع تیکت نمی‌تواند خالی باشد.")
        return value


class TicketStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["open", "answered", "closed"])


class ArtistRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Artist
        fields = [
            "id",
            "username",
            "email",
            "artist_name",
            "portfolio_url",
            "status",
            "rejection_reason",
            "is_verified",
            "created_at",
        ]
        read_only_fields = fields


class ArtistRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=2000, allow_blank=False, trim_whitespace=True)


class SubscriptionPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPricing
        fields = ["silver_price", "gold_price", "updated_at"]
        read_only_fields = ["updated_at"]

    def validate_silver_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("قیمت باید بزرگ‌تر از صفر باشد.")
        return value

    def validate_gold_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("قیمت باید بزرگ‌تر از صفر باشد.")
        return value


class SubscriptionPurchaseSerializer(serializers.Serializer):
    tier = serializers.ChoiceField(choices=["silver", "gold"])
    duration_months = serializers.ChoiceField(choices=[1, 3, 6, 12])


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "user", "tier", "duration_months", "amount", "status", "gateway_ref", "created_at"]
        read_only_fields = fields


class PaymentCallbackSerializer(serializers.Serializer):
    authority = serializers.CharField(max_length=100)
    status = serializers.CharField(required=False, allow_blank=True, max_length=20)


class MonthlyAccountingSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist.artist_name", read_only=True)

    class Meta:
        model = MonthlyAccounting
        fields = [
            "id",
            "artist",
            "artist_name",
            "month",
            "unique_listeners",
            "total_streams",
            "earnings",
            "payment_status",
        ]
        read_only_fields = fields
