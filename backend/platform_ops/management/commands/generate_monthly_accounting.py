"""Generate or refresh monthly accounting records from catalog.StreamLog."""
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count
from django.utils import timezone

from accounts.models import Artist
from catalog.models import StreamLog
from platform_ops.models import MonthlyAccounting
from platform_ops.services.accounting import calculate_artist_earnings


def _month_bounds(month_text):
    try:
        parsed = datetime.strptime(month_text, "%Y-%m")
    except ValueError as exc:
        raise CommandError("--month must use YYYY-MM format") from exc

    tz = timezone.get_current_timezone()
    start = timezone.make_aware(datetime(parsed.year, parsed.month, 1), tz)
    if parsed.month == 12:
        end = timezone.make_aware(datetime(parsed.year + 1, 1, 1), tz)
    else:
        end = timezone.make_aware(datetime(parsed.year, parsed.month + 1, 1), tz)
    return start, end


class Command(BaseCommand):
    help = "Generate monthly accounting for approved artists from StreamLog data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--month",
            default=timezone.localdate().strftime("%Y-%m"),
            help="Accounting month in YYYY-MM format (defaults to current month).",
        )

    def handle(self, *args, **options):
        month = options["month"]
        start, end = _month_bounds(month)
        created_count = 0
        updated_count = 0

        for artist in Artist.objects.filter(status="approved").select_related("user"):
            logs = StreamLog.objects.filter(
                song__artist=artist,
                created_at__gte=start,
                created_at__lt=end,
            )
            stats = logs.aggregate(
                total_streams=Count("id"),
                unique_listeners=Count("user_id", distinct=True),
            )
            total_streams = stats["total_streams"] or 0
            unique_listeners = stats["unique_listeners"] or 0
            earnings = calculate_artist_earnings(unique_listeners, total_streams)

            _, created = MonthlyAccounting.objects.update_or_create(
                artist=artist,
                month=month,
                defaults={
                    "total_streams": total_streams,
                    "unique_listeners": unique_listeners,
                    "earnings": earnings,
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Accounting {month}: {created_count} created, {updated_count} updated."
            )
        )
