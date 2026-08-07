"""Create subscription-expiry notifications without requiring Celery."""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from platform_ops.models import Notification

User = get_user_model()


class Command(BaseCommand):
    help = "Notify users whose paid subscription expires within N days."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=3, help="Expiry window in days (default: 3).")

    def handle(self, *args, **options):
        days = max(0, options["days"])
        now = timezone.now()
        until = now + timedelta(days=days)
        today = timezone.localdate()
        users = User.objects.filter(
            subscription__in=["silver", "gold"],
            subscription_expires_at__gt=now,
            subscription_expires_at__lte=until,
            is_active=True,
        )
        created = 0
        for user in users:
            already_sent_today = Notification.objects.filter(
                user=user,
                type="subscription_expiring",
                created_at__date=today,
            ).exists()
            if already_sent_today:
                continue
            Notification.objects.create(
                user=user,
                type="subscription_expiring",
                title="اشتراک شما رو به پایان است",
                message=f"اشتراک {user.subscription} شما در {timezone.localtime(user.subscription_expires_at):%Y-%m-%d} منقضی می‌شود.",
                link="/settings",
            )
            created += 1
        self.stdout.write(self.style.SUCCESS(f"Created {created} expiry notification(s)."))
