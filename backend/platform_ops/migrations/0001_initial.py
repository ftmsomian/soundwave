# Initial migration for Member 3 platform operations.
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "type",
                    models.CharField(
                        choices=[
                            ("subscription_expiring", "subscription_expiring"),
                            ("new_release", "new_release"),
                            ("artist_approved", "artist_approved"),
                            ("artist_rejected", "artist_rejected"),
                            ("monthly_earnings", "monthly_earnings"),
                            ("new_ticket", "new_ticket"),
                            ("artist_verification_request", "artist_verification_request"),
                        ],
                        max_length=40,
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("message", models.TextField()),
                ("is_read", models.BooleanField(default=False)),
                ("link", models.CharField(blank=True, max_length=200)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-created_at", "-id"]},
        ),
        migrations.CreateModel(
            name="SubscriptionPricing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("silver_price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("gold_price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="Ticket",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("subject", models.CharField(max_length=200)),
                (
                    "status",
                    models.CharField(
                        choices=[("open", "open"), ("answered", "answered"), ("closed", "closed")],
                        default="open",
                        max_length=15,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tickets",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-updated_at", "-id"]},
        ),
        migrations.CreateModel(
            name="TicketMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "sender",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
                ),
                (
                    "ticket",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="messages",
                        to="platform_ops.ticket",
                    ),
                ),
            ],
            options={"ordering": ["created_at", "id"]},
        ),
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("tier", models.CharField(choices=[("silver", "silver"), ("gold", "gold")], max_length=10)),
                ("duration_months", models.PositiveSmallIntegerField()),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                (
                    "status",
                    models.CharField(
                        choices=[("pending", "pending"), ("success", "success"), ("failed", "failed")],
                        default="pending",
                        max_length=10,
                    ),
                ),
                ("gateway_ref", models.CharField(blank=True, db_index=True, max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="transactions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-created_at", "-id"]},
        ),
        migrations.CreateModel(
            name="MonthlyAccounting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("month", models.CharField(help_text="YYYY-MM", max_length=7)),
                ("unique_listeners", models.PositiveIntegerField(default=0)),
                ("total_streams", models.PositiveIntegerField(default=0)),
                ("earnings", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                (
                    "payment_status",
                    models.CharField(
                        choices=[("pending", "pending"), ("settled", "settled")],
                        default="pending",
                        max_length=10,
                    ),
                ),
                (
                    "artist",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="accounting_records",
                        to="accounts.artist",
                    ),
                ),
            ],
            options={"ordering": ["-month", "artist_id"]},
        ),
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(fields=["user", "is_read", "-created_at"], name="plat_notif_user_read_idx"),
        ),
        migrations.AddIndex(
            model_name="transaction",
            index=models.Index(fields=["status", "-created_at"], name="plat_txn_status_created_idx"),
        ),
        migrations.AddConstraint(
            model_name="monthlyaccounting",
            constraint=models.UniqueConstraint(
                fields=("artist", "month"), name="unique_artist_month_accounting"
            ),
        ),
    ]
