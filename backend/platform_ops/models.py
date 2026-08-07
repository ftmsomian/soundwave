"""Models owned by Member 3: notifications, support, payments and accounting."""
from django.conf import settings
from django.core.exceptions import ValidationError
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
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    type = models.CharField(max_length=40, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["user", "is_read", "-created_at"], name="plat_notif_user_read_idx")]

    def __str__(self):
        return f"{self.user}: {self.title}"


class Ticket(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tickets"
    )
    subject = models.CharField(max_length=200)
    status = models.CharField(max_length=15, choices=TICKET_STATUS, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]

    def __str__(self):
        return f"#{self.pk} {self.subject}"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"Ticket #{self.ticket_id} message #{self.pk}"


class SubscriptionPricing(models.Model):
    """Dynamic subscription prices. The API maintains this table as a singleton."""

    silver_price = models.DecimalField(max_digits=12, decimal_places=2)
    gold_price = models.DecimalField(max_digits=12, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.silver_price <= 0 or self.gold_price <= 0:
            raise ValidationError("Subscription prices must be greater than zero.")
        if SubscriptionPricing.objects.exclude(pk=self.pk).exists():
            raise ValidationError("Only one SubscriptionPricing row is allowed.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"silver={self.silver_price}, gold={self.gold_price}"


class Transaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions"
    )
    tier = models.CharField(max_length=10, choices=[("silver", "silver"), ("gold", "gold")])
    duration_months = models.PositiveSmallIntegerField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=10, choices=TRANSACTION_STATUS, default="pending")
    gateway_ref = models.CharField(max_length=100, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["status", "-created_at"], name="plat_txn_status_created_idx")]

    def __str__(self):
        return f"Transaction #{self.pk} - {self.user} - {self.status}"


class MonthlyAccounting(models.Model):
    artist = models.ForeignKey(
        "accounts.Artist", on_delete=models.CASCADE, related_name="accounting_records"
    )
    month = models.CharField(max_length=7, help_text="YYYY-MM")
    unique_listeners = models.PositiveIntegerField(default=0)
    total_streams = models.PositiveIntegerField(default=0)
    earnings = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default="pending")

    class Meta:
        ordering = ["-month", "artist_id"]
        constraints = [
            models.UniqueConstraint(fields=["artist", "month"], name="unique_artist_month_accounting")
        ]

    def __str__(self):
        return f"{self.artist} - {self.month}"
