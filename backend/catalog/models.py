"""
مدل‌های اپ catalog — مسئول: عضو دوم
جزئیات کامل در docs/backend/checklist-member2-catalog.md
"""
from django.conf import settings
from django.db import models


class Album(models.Model):
    title = models.CharField(max_length=200)
    artist = models.ForeignKey("accounts.Artist", on_delete=models.CASCADE, related_name="albums")
    cover = models.ImageField(upload_to="covers/albums/", null=True, blank=True)
    genre = models.CharField(max_length=50, blank=True)
    release_year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.ForeignKey("accounts.Artist", on_delete=models.CASCADE, related_name="songs")
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name="songs")
    cover = models.ImageField(upload_to="covers/songs/", null=True, blank=True)
    audio_file = models.FileField(upload_to="songs/")
    duration = models.PositiveIntegerField(default=0, help_text="ثانیه")
    lyrics = models.TextField(blank=True)
    genre = models.CharField(max_length=50, blank=True)
    release_year = models.PositiveIntegerField(null=True, blank=True)
    stream_count = models.PositiveIntegerField(default=0)
    is_early_access = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def unique_listener_count(self):
        return self.stream_logs.values("user").distinct().count()


class Playlist(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="playlists")
    songs = models.ManyToManyField(Song, through="PlaylistSong", related_name="playlists")
    cover = models.ImageField(upload_to="covers/playlists/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PlaylistSong(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("playlist", "song")


class StreamLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stream_logs")
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name="stream_logs")
    created_at = models.DateTimeField(auto_now_add=True)
