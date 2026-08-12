"""تست‌های آهنگ: ساخت (فقط هنرمند approved)، مالکیت، جستجو، فیلتر is_early_access."""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Artist, User
from catalog.models import Song


def _make_user(username, subscription="free", role="user"):
    return User.objects.create_user(
        username=username, email=f"{username}@example.com", password="Pass1234!",
        role=role, subscription=subscription,
    )


def _make_artist(username, status="approved", subscription="free"):
    user = _make_user(username, subscription=subscription, role="artist")
    return Artist.objects.create(user=user, artist_name=f"{username}-artist", status=status)


class SongCreateTests(APITestCase):
    def test_approved_artist_can_create_song(self):
        artist = _make_artist("art1")
        self.client.force_authenticate(user=artist.user)
        audio = self._fake_audio_file()
        response = self.client.post(
            reverse("catalog:song-list-create"),
            {"title": "Song One", "duration": 180, "audio_file": audio},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(Song.objects.count(), 1)
        self.assertEqual(Song.objects.first().artist, artist)

    def test_pending_artist_cannot_create_song(self):
        artist = _make_artist("art2", status="pending")
        self.client.force_authenticate(user=artist.user)
        response = self.client.post(
            reverse("catalog:song-list-create"),
            {"title": "Song Two", "duration": 180, "audio_file": self._fake_audio_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_normal_user_cannot_create_song(self):
        user = _make_user("plainuser")
        self.client.force_authenticate(user=user)
        response = self.client.post(
            reverse("catalog:song-list-create"),
            {"title": "Song Three", "duration": 180, "audio_file": self._fake_audio_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_song(self):
        response = self.client.post(
            reverse("catalog:song-list-create"),
            {"title": "Song Four", "duration": 180, "audio_file": self._fake_audio_file()},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @staticmethod
    def _fake_audio_file():
        from django.core.files.uploadedfile import SimpleUploadedFile
        return SimpleUploadedFile("song.mp3", b"fake-audio-bytes", content_type="audio/mpeg")


class SongOwnershipTests(APITestCase):
    def setUp(self):
        self.owner = _make_artist("owner1")
        self.other = _make_artist("other1")
        self.song = Song.objects.create(title="Owned Song", artist=self.owner, duration=120)

    def test_owner_can_update_song(self):
        self.client.force_authenticate(user=self.owner.user)
        response = self.client.patch(
            reverse("catalog:song-detail", args=[self.song.id]), {"title": "Renamed"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.song.refresh_from_db()
        self.assertEqual(self.song.title, "Renamed")

    def test_other_artist_cannot_update_song(self):
        self.client.force_authenticate(user=self.other.user)
        response = self.client.patch(
            reverse("catalog:song-detail", args=[self.song.id]), {"title": "Hacked"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_artist_cannot_delete_song(self):
        self.client.force_authenticate(user=self.other.user)
        response = self.client.delete(reverse("catalog:song-detail", args=[self.song.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Song.objects.filter(pk=self.song.id).exists())


class SongSearchAndFilterTests(APITestCase):
    def setUp(self):
        self.artist = _make_artist("searchartist", subscription="gold")
        Song.objects.create(title="Blue Sky", artist=self.artist, duration=100, genre="pop")
        Song.objects.create(title="Night Ride", artist=self.artist, duration=100, genre="rock")

    def test_search_by_song_title(self):
        response = self.client.get(reverse("catalog:song-list-create"), {"search": "blue"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item["title"] for item in response.data["results"]]
        self.assertIn("Blue Sky", titles)
        self.assertNotIn("Night Ride", titles)

    def test_search_by_artist_name(self):
        response = self.client.get(reverse("catalog:song-list-create"), {"search": "searchartist"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_filter_by_genre(self):
        response = self.client.get(reverse("catalog:song-list-create"), {"genre": "rock"})
        titles = [item["title"] for item in response.data["results"]]
        self.assertEqual(titles, ["Night Ride"])


class EarlyAccessVisibilityTests(APITestCase):
    def setUp(self):
        self.artist = _make_artist("eaartist")
        self.early_song = Song.objects.create(
            title="Secret Drop", artist=self.artist, duration=100, is_early_access=True
        )

    def test_free_user_cannot_see_early_access_song_in_list(self):
        listener = _make_user("freelistener", subscription="free")
        self.client.force_authenticate(user=listener)
        response = self.client.get(reverse("catalog:song-list-create"))
        titles = [item["title"] for item in response.data["results"]]
        self.assertNotIn("Secret Drop", titles)

    def test_gold_user_can_see_early_access_song(self):
        listener = _make_user("goldlistener", subscription="gold")
        self.client.force_authenticate(user=listener)
        response = self.client.get(reverse("catalog:song-list-create"))
        titles = [item["title"] for item in response.data["results"]]
        self.assertIn("Secret Drop", titles)

    def test_owning_artist_can_see_own_early_access_song(self):
        self.client.force_authenticate(user=self.artist.user)
        response = self.client.get(reverse("catalog:song-list-create"))
        titles = [item["title"] for item in response.data["results"]]
        self.assertIn("Secret Drop", titles)
