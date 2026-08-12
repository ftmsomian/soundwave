"""تست‌های پلی‌لیست: سقف بر اساس اشتراک (core/subscription_rules.py)، مالکیت، افزودن/حذف آهنگ."""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Artist, User
from catalog.models import Playlist, PlaylistSong, Song
from core.subscription_rules import PLAYLIST_LIMITS


def _make_user(username, subscription="free"):
    return User.objects.create_user(
        username=username, email=f"{username}@example.com", password="Pass1234!",
        subscription=subscription,
    )


class PlaylistLimitTests(APITestCase):
    def test_free_user_can_create_up_to_limit(self):
        user = _make_user("freeplaylister", subscription="free")
        self.client.force_authenticate(user=user)
        limit = PLAYLIST_LIMITS["free"]

        for i in range(limit):
            response = self.client.post(reverse("catalog:playlist-list-create"), {"name": f"pl-{i}"})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        self.assertEqual(Playlist.objects.filter(owner=user).count(), limit)

    def test_free_user_blocked_after_limit(self):
        user = _make_user("freeover", subscription="free")
        self.client.force_authenticate(user=user)
        limit = PLAYLIST_LIMITS["free"]
        for i in range(limit):
            Playlist.objects.create(name=f"existing-{i}", owner=user)

        response = self.client.post(reverse("catalog:playlist-list-create"), {"name": "one-too-many"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"]["code"], "PLAYLIST_LIMIT_REACHED")
        self.assertEqual(Playlist.objects.filter(owner=user).count(), limit)

    def test_gold_user_has_unlimited_playlists(self):
        user = _make_user("golduser", subscription="gold")
        self.client.force_authenticate(user=user)
        free_limit = PLAYLIST_LIMITS["free"]
        for i in range(free_limit + 2):
            Playlist.objects.create(name=f"existing-{i}", owner=user)

        response = self.client.post(reverse("catalog:playlist-list-create"), {"name": "still-fine"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PlaylistOwnershipTests(APITestCase):
    def setUp(self):
        self.owner = _make_user("plowner")
        self.other = _make_user("plother")
        self.playlist = Playlist.objects.create(name="My Mix", owner=self.owner)

    def test_owner_can_rename_playlist(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(
            reverse("catalog:playlist-detail", args=[self.playlist.id]), {"name": "New Name"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_other_user_cannot_see_or_edit_playlist(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.patch(
            reverse("catalog:playlist-detail", args=[self.playlist.id]), {"name": "Hacked"}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PlaylistSongManagementTests(APITestCase):
    def setUp(self):
        artist_user = User.objects.create_user(username="plsartist", email="plsartist@example.com", password="Pass1234!", role="artist")
        self.artist = Artist.objects.create(user=artist_user, artist_name="PLS Artist", status="approved")
        self.song = Song.objects.create(title="Add Me", artist=self.artist, duration=90)
        self.owner = _make_user("addremoveowner")
        self.playlist = Playlist.objects.create(name="Fresh", owner=self.owner)

    def test_add_song_to_playlist(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            reverse("catalog:playlist-song", args=[self.playlist.id, self.song.id])
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(PlaylistSong.objects.filter(playlist=self.playlist, song=self.song).exists())

    def test_remove_song_from_playlist(self):
        PlaylistSong.objects.create(playlist=self.playlist, song=self.song)
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(
            reverse("catalog:playlist-song", args=[self.playlist.id, self.song.id])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(PlaylistSong.objects.filter(playlist=self.playlist, song=self.song).exists())
