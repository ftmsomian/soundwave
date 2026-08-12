"""
جستجو/فیلتر/مرتب‌سازی مشترک آهنگ و آلبوم — عضو دوم.
طبق api-contract.md: GET /songs/?search=&ordering=&genre=
«جستجوی هم‌زمان» یعنی یک query param واحد (search) هم روی نام اثر و هم نام هنرمند بگرده.
"""
import django_filters
from django.db.models import Q

from .models import Album, Song


class SongFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    genre = django_filters.CharFilter(field_name="genre", lookup_expr="icontains")

    class Meta:
        model = Song
        fields = ["genre"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) | Q(artist__artist_name__icontains=value)
        ).distinct()


class AlbumFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    genre = django_filters.CharFilter(field_name="genre", lookup_expr="icontains")

    class Meta:
        model = Album
        fields = ["genre"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) | Q(artist__artist_name__icontains=value)
        ).distinct()
