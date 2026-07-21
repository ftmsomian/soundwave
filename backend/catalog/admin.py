from django.contrib import admin

from .models import Album, Playlist, PlaylistSong, Song, StreamLog

admin.site.register(Album)
admin.site.register(Song)
admin.site.register(Playlist)
admin.site.register(PlaylistSong)
admin.site.register(StreamLog)
