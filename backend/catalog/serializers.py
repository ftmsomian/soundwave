"""Serializer های catalog — عضو دوم تکمیل می‌کنه."""
from rest_framework import serializers

from .models import Album, Playlist, Song


class SongSerializer(serializers.ModelSerializer):
    unique_listener_count = serializers.ReadOnlyField()

    class Meta:
        model = Song
        fields = "__all__"


class AlbumSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = "__all__"


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = "__all__"
        read_only_fields = ["owner"]
