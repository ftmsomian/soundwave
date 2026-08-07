from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Artist
from catalog.models import Song, StreamLog
from platform_ops.models import MonthlyAccounting, Notification, Transaction

User = get_user_model()


class AccountingAndReportTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin", password="pass12345", role="admin")
        self.support = User.objects.create_user(username="support", password="pass12345", role="support")
        self.listener1 = User.objects.create_user(username="listener1", password="pass12345", subscription="silver")
        self.listener2 = User.objects.create_user(username="listener2", password="pass12345", subscription="gold")
        artist_user = User.objects.create_user(username="artist", password="pass12345", role="artist")
        self.artist = Artist.objects.create(
            user=artist_user, artist_name="Approved Artist", status="approved", is_verified=True
        )
        self.song = Song.objects.create(title="Track", artist=self.artist, audio_file="songs/track.mp3")

    def test_monthly_command_aggregates_stream_logs_and_notifies_artist(self):
        StreamLog.objects.create(user=self.listener1, song=self.song)
        StreamLog.objects.create(user=self.listener1, song=self.song)
        StreamLog.objects.create(user=self.listener2, song=self.song)
        month = timezone.localdate().strftime("%Y-%m")
        call_command("generate_monthly_accounting", month=month)

        row = MonthlyAccounting.objects.get(artist=self.artist, month=month)
        self.assertEqual(row.total_streams, 3)
        self.assertEqual(row.unique_listeners, 2)
        self.assertEqual(row.earnings, Decimal("1.03"))
        self.assertTrue(
            Notification.objects.filter(user=self.artist.user, type="monthly_earnings").exists()
        )

    def test_support_can_list_accounting_and_only_admin_can_settle(self):
        row = MonthlyAccounting.objects.create(
            artist=self.artist,
            month=timezone.localdate().strftime("%Y-%m"),
            unique_listeners=1,
            total_streams=2,
            earnings="1.00",
        )
        self.client.force_authenticate(self.support)
        listed = self.client.get(reverse("platform_ops:accounting-monthly"))
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(listed.data["count"], 1)
        denied = self.client.post(reverse("platform_ops:accounting-settle", args=[self.artist.id]))
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin)
        settled = self.client.post(reverse("platform_ops:accounting-settle", args=[self.artist.id]))
        self.assertEqual(settled.status_code, status.HTTP_200_OK)
        row.refresh_from_db()
        self.assertEqual(row.payment_status, "settled")

    def test_admin_reports_are_aggregated_in_backend(self):
        Transaction.objects.create(
            user=self.listener1,
            tier="silver",
            duration_months=1,
            amount="1000.00",
            status="success",
            gateway_ref="R1",
        )
        Transaction.objects.create(
            user=self.listener2,
            tier="gold",
            duration_months=1,
            amount="2500.00",
            status="failed",
            gateway_ref="R2",
        )
        self.client.force_authenticate(self.admin)
        distribution = self.client.get(reverse("platform_ops:subscription-distribution"))
        self.assertEqual(distribution.status_code, status.HTTP_200_OK)
        self.assertEqual(distribution.data["distribution"]["silver"], 1)
        self.assertEqual(distribution.data["distribution"]["gold"], 1)

        revenue = self.client.get(reverse("platform_ops:revenue-report"))
        self.assertEqual(revenue.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(revenue.data["revenue"])), Decimal("1000.00"))
        self.assertEqual(revenue.data["successful_transactions"], 1)
