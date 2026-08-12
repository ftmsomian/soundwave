"""تست‌های استریم: محدودیت روزانه‌ی رایگان، افزایش stream_count، محاسبه‌ی unique_listener_count."""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Artist, User
from catalog.models import Song, StreamLog
from core.subscription_rules import DAILY_STREAM_LIMIT


def _make_user(username, subscription="free"):
    return User.objects.create_user(
        username=username, email=f"{username}@example.com", password="Pass1234!",
        subscription=subscription,
    )


class StreamLimitTests(APITestCase):
    def setUp(self):
        artist_user = User.objects.create_user(
            username="streamartist", email="streamartist@example.com", password="Pass1234!", role="artist"
        )
        self.artist = Artist.objects.create(user=artist_user, artist_name="Stream Artist", status="approved")
        self.song = Song.objects.create(title="Loop It", artist=self.artist, duration=60)

    def test_stream_increments_count(self):
        listener = _make_user("listener1")
        self.client.force_authenticate(user=listener)
        response = self.client.post(reverse("catalog:song-stream", args=[self.song.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.song.refresh_from_db()
        self.assertEqual(self.song.stream_count, 1)
        self.assertEqual(StreamLog.objects.filter(song=self.song, user=listener).count(), 1)

    def test_free_user_blocked_after_daily_limit(self):
        listener = _make_user("listener2", subscription="free")
        limit = DAILY_STREAM_LIMIT["free"]
        # از قبل به سقف رسونده شده
        for _ in range(limit):
            StreamLog.objects.create(user=listener, song=self.song)

        self.client.force_authenticate(user=listener)
        response = self.client.post(reverse("catalog:song-stream", args=[self.song.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"]["code"], "DAILY_STREAM_LIMIT_REACHED")

    def test_silver_user_has_no_daily_limit(self):
        listener = _make_user("listener3", subscription="silver")
        limit = DAILY_STREAM_LIMIT["free"]
        for _ in range(limit + 5):
            StreamLog.objects.create(user=listener, song=self.song)

        self.client.force_authenticate(user=listener)
        response = self.client.post(reverse("catalog:song-stream", args=[self.song.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unique_listener_count_counts_distinct_users(self):
        listener_a = _make_user("uniquea")
        listener_b = _make_user("uniqueb")

        self.client.force_authenticate(user=listener_a)
        self.client.post(reverse("catalog:song-stream", args=[self.song.id]))
        self.client.post(reverse("catalog:song-stream", args=[self.song.id]))  # همون کاربر، دوباره

        self.client.force_authenticate(user=listener_b)
        self.client.post(reverse("catalog:song-stream", args=[self.song.id]))

        self.song.refresh_from_db()
        self.assertEqual(self.song.stream_count, 3)
        self.assertEqual(self.song.unique_listener_count, 2)
