"""Serializer های catalog — عضو دوم."""
import os

from django.db.models import Q
from rest_framework import serializers

from .models import Album, Playlist, PlaylistSong, Song

# ---------------------------------------------------------------------------
# اعتبارسنجی فایل‌های آپلودی (طبق چک‌لیست: فرمت/حجم مجاز)
# ---------------------------------------------------------------------------
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac"}
MAX_AUDIO_SIZE_MB = 30

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_SIZE_MB = 5


def _validate_audio_file(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise serializers.ValidationError(
            f"فرمت فایل صوتی مجاز نیست. فرمت‌های مجاز: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}"
        )
    if value.size > MAX_AUDIO_SIZE_MB * 1024 * 1024:
        raise serializers.ValidationError(f"حجم فایل صوتی نباید بیشتر از {MAX_AUDIO_SIZE_MB} مگابایت باشد.")
    return value


def _validate_cover_image(value):
    if not value:
        return value
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise serializers.ValidationError(
            f"فرمت تصویر کاور مجاز نیست. فرمت‌های مجاز: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"
        )
    if value.size > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise serializers.ValidationError(f"حجم تصویر کاور نباید بیشتر از {MAX_IMAGE_SIZE_MB} مگابایت باشد.")
    return value


def _early_access_visible_q(artist_id):
    """آهنگ یا is_early_access=False هست، یا صاحبش خودِ همین artist_id است."""
    return Q(is_early_access=False) | Q(artist_id=artist_id)


# ---------------------------------------------------------------------------
# Song / Album
# ---------------------------------------------------------------------------
class SongSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist.artist_name", read_only=True)
    album_name = serializers.CharField(source="album.title", read_only=True, default=None)
    unique_listener_count = serializers.ReadOnlyField()

    class Meta:
        model = Song
        fields = [
            "id", "title", "artist", "artist_name", "album", "album_name",
            "cover", "audio_file", "duration", "lyrics", "genre", "release_year",
            "stream_count", "unique_listener_count", "is_early_access", "created_at",
        ]
        read_only_fields = ["artist", "stream_count", "created_at"]

    def validate_audio_file(self, value):
        return _validate_audio_file(value)

    def validate_cover(self, value):
        return _validate_cover_image(value)

    def validate_album(self, album):
        """آلبومِ انتخاب‌شده باید متعلق به همون هنرمند باشه."""
        if album is None:
            return album
        request = self.context.get("request")
        artist_profile = getattr(request.user, "artist_profile", None) if request else None
        if artist_profile and album.artist_id != artist_profile.id:
            raise serializers.ValidationError("این آلبوم متعلق به شما نیست.")
        return album


class AlbumSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist.artist_name", read_only=True)
    songs = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = [
            "id", "title", "artist", "artist_name", "cover", "genre",
            "release_year", "created_at", "songs",
        ]
        read_only_fields = ["artist", "created_at"]

    def validate_cover(self, value):
        return _validate_cover_image(value)

    def get_songs(self, obj):
        """
        فقط آهنگ‌های قابل‌مشاهده برای بیننده‌ی فعلی برگردونده می‌شه، تا آلبوم یک آهنگ
        early-access رو برای کاربر غیرمجاز لو نده (همون قانونی که در لیست آهنگ‌ها هست).
        """
        request = self.context.get("request")
        songs_qs = obj.songs.all()
        user = getattr(request, "user", None) if request else None
        is_gold = bool(user and user.is_authenticated and user.subscription == "gold")

        if not is_gold:
            artist_profile = getattr(user, "artist_profile", None) if user else None
            if artist_profile:
                songs_qs = songs_qs.filter(_early_access_visible_q(artist_profile.id))
            else:
                songs_qs = songs_qs.filter(is_early_access=False)
        return SongSerializer(songs_qs, many=True, context=self.context).data


# ---------------------------------------------------------------------------
# Playlist
# ---------------------------------------------------------------------------
class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    songs_count = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ["id", "name", "owner", "cover", "songs", "songs_count", "created_at", "updated_at"]
        read_only_fields = ["owner", "created_at", "updated_at"]

    def validate_cover(self, value):
        return _validate_cover_image(value)

    def get_songs_count(self, obj):
        return obj.songs.count()


class PlaylistSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistSong
        fields = ["id", "playlist", "song", "added_at"]
        read_only_fields = ["added_at"]


# ---------------------------------------------------------------------------
# مدیریت آثار هنرمند — GET /artists/me/works/
# ---------------------------------------------------------------------------
class ArtistSongWorkSerializer(serializers.ModelSerializer):
    """آمار هر آهنگ برای صفحه‌ی «مدیریت آثار». درآمد واقعی رو عضو سوم محاسبه می‌کنه؛ اینجا فقط بخون."""

    unique_listener_count = serializers.ReadOnlyField()

    class Meta:
        model = Song
        fields = [
            "id", "title", "album", "cover", "duration", "genre", "release_year",
            "stream_count", "unique_listener_count", "is_early_access", "created_at",
        ]


class ArtistAlbumWorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ["id", "title", "cover", "genre", "release_year", "created_at"]
