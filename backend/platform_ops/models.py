"""
مدل‌های اپ platform_ops — مسئول: عضو سوم
جزئیات کامل در docs/backend/checklist-member3-platform-payments.md
"""
from django.conf import settings
from django.db import models

NOTIFICATION_TYPES = [
    ("subscription_expiring", "subscription_expiring"),
    ("new_release", "new_release"),
    ("artist_approved", "artist_approved"),
    ("artist_rejected", "artist_rejected"),
    ("monthly_earnings", "monthly_earnings"),
    ("new_ticket", "new_ticket"),
    ("artist_verification_request", "artist_verification_request"),
]
TICKET_STATUS = [("open", "open"), ("answered", "answered"), ("closed", "closed")]
PAYMENT_STATUS = [("pending", "pending"), ("settled", "settled")]
TRANSACTION_STATUS = [("pending", "pending"), ("success", "success"), ("failed", "failed")]


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=40, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Ticket(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tickets")
    subject = models.CharField(max_length=200)
    status = models.CharField(max_length=15, choices=TICKET_STATUS, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class SubscriptionPricing(models.Model):
    """سینگلتون: همیشه فقط یک ردیف. قیمت‌ها هیچ‌جای دیگه hardcode نمی‌شن."""
    silver_price = models.DecimalField(max_digits=10, decimal_places=2)
    gold_price = models.DecimalField(max_digits=10, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)


class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    tier = models.CharField(max_length=10)
    duration_months = models.PositiveSmallIntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=TRANSACTION_STATUS, default="pending")
    gateway_ref = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class MonthlyAccounting(models.Model):
    artist = models.ForeignKey("accounts.Artist", on_delete=models.CASCADE, related_name="accounting_records")
    month = models.CharField(max_length=7, help_text="YYYY-MM")
    unique_listeners = models.PositiveIntegerField(default=0)
    total_streams = models.PositiveIntegerField(default=0)
    earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default="pending")

    class Meta:
        unique_together = ("artist", "month")
