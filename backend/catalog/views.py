"""
View های catalog — عضو دوم.
CRUD آهنگ/آلبوم/پلی‌لیست، استریم (با محدودیت روزانه‌ی رایگان)، جستجوی هم‌زمان.
هیچ عددی (سقف پلی‌لیست / محدودیت استریم روزانه) اینجا hardcode نمی‌شه — همه از
core.subscription_rules خونده می‌شه تا وقتی مدیر (عضو سوم) قیمت/محدودیت رو عوض کرد،
نیازی به تغییر این فایل نباشه.
"""
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from core.exceptions import AppError
from core.subscription_rules import daily_stream_limit_for, playlist_limit_for

from .filters import AlbumFilter, SongFilter
from .models import Album, Playlist, PlaylistSong, Song, StreamLog
from .permissions import IsApprovedArtist, IsPlaylistOwner, IsWorkOwner, get_artist_profile
from .serializers import (
    AlbumSerializer,
    ArtistAlbumWorkSerializer,
    ArtistSongWorkSerializer,
    PlaylistSerializer,
    SongSerializer,
)


def _app_error_response(exc: AppError) -> Response:
    """فرمت خطا دقیقاً مطابق core/exceptions.py: {"error": {"code","message","details"}}."""
    return Response(
        {"error": {"code": exc.code, "message": exc.message, "details": {}}},
        status=exc.status_code,
    )


def _visible_songs_for(user):
    """
    آهنگ‌های is_early_access=True فقط برای کاربر gold یا خودِ هنرمندش قابل‌دیدنه
    (طبق checklist-member2-catalog.md، بخش «فیلتر is_early_access»).
    """
    qs = Song.objects.select_related("artist", "album").all()
    is_gold = bool(user and user.is_authenticated and user.subscription == "gold")
    if is_gold:
        return qs

    artist_profile = get_artist_profile(user)
    if artist_profile:
        return qs.filter(Q(is_early_access=False) | Q(artist_id=artist_profile.id))
    return qs.filter(is_early_access=False)


# ---------------------------------------------------------------------------
# Song
# ---------------------------------------------------------------------------
class SongListCreateView(generics.ListCreateAPIView):
    """GET /songs/?search=&genre=&ordering=-stream_count|-created_at   POST /songs/"""

    serializer_class = SongSerializer
    permission_classes = [IsApprovedArtist]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SongFilter
    ordering_fields = ["stream_count", "created_at", "release_year"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return _visible_songs_for(self.request.user)

    def perform_create(self, serializer):
        artist_profile = get_artist_profile(self.request.user)
        serializer.save(artist=artist_profile)


class SongDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET /songs/{id}/   PATCH/DELETE /songs/{id}/ (فقط صاحب اثر)"""

    serializer_class = SongSerializer
    permission_classes = [IsWorkOwner]

    def get_queryset(self):
        return _visible_songs_for(self.request.user)


class StreamCreateView(APIView):
    """
    POST /songs/{id}/stream/
    ثبت StreamLog + افزایش stream_count. اگه کاربر free باشه و امروز به سقف رسیده باشه
    -> 403 با کد DAILY_STREAM_LIMIT_REACHED.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        song = get_object_or_404(_visible_songs_for(request.user), pk=pk)

        limit = daily_stream_limit_for(request.user.subscription)
        if limit is not None:
            today = timezone.localdate()
            streamed_today = StreamLog.objects.filter(
                user=request.user, created_at__date=today
            ).count()
            if streamed_today >= limit:
                return _app_error_response(
                    AppError(
                        code="DAILY_STREAM_LIMIT_REACHED",
                        message=f"شما به سقف روزانه‌ی {limit} استریم برای اشتراک رایگان رسیده‌اید.",
                        status_code=status.HTTP_403_FORBIDDEN,
                    )
                )

        StreamLog.objects.create(user=request.user, song=song)
        Song.objects.filter(pk=song.pk).update(stream_count=F("stream_count") + 1)
        song.refresh_from_db()

        return Response(SongSerializer(song, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Album
# ---------------------------------------------------------------------------
class AlbumListCreateView(generics.ListCreateAPIView):
    """GET /albums/?search=&genre=   POST /albums/"""

    serializer_class = AlbumSerializer
    permission_classes = [IsApprovedArtist]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AlbumFilter
    ordering_fields = ["created_at", "release_year"]
    ordering = ["-created_at"]
    queryset = Album.objects.select_related("artist").all()

    def perform_create(self, serializer):
        artist_profile = get_artist_profile(self.request.user)
        serializer.save(artist=artist_profile)


class AlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET /albums/{id}/   PATCH/DELETE /albums/{id}/ (فقط صاحب اثر)"""

    serializer_class = AlbumSerializer
    permission_classes = [IsWorkOwner]
    queryset = Album.objects.select_related("artist").all()


# ---------------------------------------------------------------------------
# Playlist
# ---------------------------------------------------------------------------
class PlaylistListCreateView(generics.ListCreateAPIView):
    """
    GET /playlists/   لیست پلی‌لیست‌های خودِ کاربر (پلی‌لیست خصوصیه، اندپوینت عمومی نداره)
    POST /playlists/  ساخت پلی‌لیست با چک سقف اشتراک (core.subscription_rules)
    """

    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(owner=self.request.user).prefetch_related("songs")

    def create(self, request, *args, **kwargs):
        limit = playlist_limit_for(request.user.subscription)
        if limit is not None:
            current_count = Playlist.objects.filter(owner=request.user).count()
            if current_count >= limit:
                return _app_error_response(
                    AppError(
                        code="PLAYLIST_LIMIT_REACHED",
                        message=f"شما به سقف {limit} پلی‌لیست برای سطح اشتراک فعلی رسیده‌اید.",
                        status_code=status.HTTP_403_FORBIDDEN,
                    )
                )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/DELETE /playlists/{id}/ (فقط مالک). GET هم برای مالک برای صفحه‌ی جزئیات پلی‌لیست."""

    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated, IsPlaylistOwner]

    def get_queryset(self):
        return Playlist.objects.filter(owner=self.request.user).prefetch_related("songs")


class PlaylistSongView(APIView):
    """POST/DELETE /playlists/{id}/songs/{song_id}/ — افزودن/حذف آهنگ از پلی‌لیست."""

    permission_classes = [IsAuthenticated]

    def _get_playlist(self, request, playlist_id):
        return get_object_or_404(Playlist, pk=playlist_id, owner=request.user)

    def post(self, request, pk, song_id):
        playlist = self._get_playlist(request, pk)
        song = get_object_or_404(_visible_songs_for(request.user), pk=song_id)
        PlaylistSong.objects.get_or_create(playlist=playlist, song=song)
        return Response(
            PlaylistSerializer(playlist, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, pk, song_id):
        playlist = self._get_playlist(request, pk)
        PlaylistSong.objects.filter(playlist=playlist, song_id=song_id).delete()
        return Response(
            PlaylistSerializer(playlist, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# مدیریت آثار هنرمند
# ---------------------------------------------------------------------------
class ArtistWorksView(APIView):
    """
    GET /artists/me/works/ — آثار خودِ هنرمند لاگین‌شده + آمار هر اثر.
    درآمد واقعی رو عضو سوم (accounting) محاسبه می‌کنه؛ اینجا فقط مقدار فعلیِ
    Artist.monthly_earnings خونده می‌شه (aggregate، نه per-song).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        artist_profile = get_artist_profile(request.user)
        if artist_profile is None:
            return _app_error_response(
                AppError(
                    code="NOT_AN_ARTIST",
                    message="این حساب کاربری پروفایل هنرمند ندارد.",
                    status_code=status.HTTP_403_FORBIDDEN,
                )
            )

        songs = Song.objects.filter(artist=artist_profile).order_by("-created_at")
        albums = Album.objects.filter(artist=artist_profile).order_by("-created_at")

        return Response(
            {
                "artist_status": artist_profile.status,
                "total_streams": artist_profile.total_streams,
                "unique_listeners": artist_profile.unique_listeners,
                "monthly_earnings": artist_profile.monthly_earnings,
                "songs": ArtistSongWorkSerializer(songs, many=True, context={"request": request}).data,
                "albums": ArtistAlbumWorkSerializer(albums, many=True, context={"request": request}).data,
            }
        )
