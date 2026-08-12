from django.urls import path

from .views import (
    AlbumDetailView,
    AlbumListCreateView,
    ArtistWorksView,
    PlaylistDetailView,
    PlaylistListCreateView,
    PlaylistSongView,
    SongDetailView,
    SongListCreateView,
    StreamCreateView,
)

app_name = "catalog"

urlpatterns = [
    path("songs/", SongListCreateView.as_view(), name="song-list-create"),
    path("songs/<int:pk>/", SongDetailView.as_view(), name="song-detail"),
    path("songs/<int:pk>/stream/", StreamCreateView.as_view(), name="song-stream"),

    path("albums/", AlbumListCreateView.as_view(), name="album-list-create"),
    path("albums/<int:pk>/", AlbumDetailView.as_view(), name="album-detail"),

    path("playlists/", PlaylistListCreateView.as_view(), name="playlist-list-create"),
    path("playlists/<int:pk>/", PlaylistDetailView.as_view(), name="playlist-detail"),
    path("playlists/<int:pk>/songs/<int:song_id>/", PlaylistSongView.as_view(), name="playlist-song"),

    path("artists/me/works/", ArtistWorksView.as_view(), name="artist-me-works"),
]
