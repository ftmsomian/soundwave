"""Serializer های platform_ops — عضو سوم تکمیل می‌کنه."""
from rest_framework import serializers

from .models import MonthlyAccounting, Notification, SubscriptionPricing, Ticket, TicketMessage, Transaction


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class TicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = "__all__"


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = "__all__"


class SubscriptionPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPricing
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"


class MonthlyAccountingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyAccounting
        fields = "__all__"
