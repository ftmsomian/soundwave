"""
Permission های اپ catalog — عضو دوم.
منطق role/subscription تکراری نمی‌شه؛ فقط چیزهایی که مخصوص «مالکیت اثر هنرمند» هستن اینجان،
بقیه (سطح اشتراک، role های عمومی) از core.permissions میاد.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission

from core.permissions import IsOwnerOrReadOnly  # noqa: reuse مشترک


def get_artist_profile(user):
    """پروفایل هنرمندِ کاربر لاگین‌شده رو برمی‌گردونه، یا None اگه کاربر هنرمند نباشه."""
    if not (user and user.is_authenticated):
        return None
    return getattr(user, "artist_profile", None)


class IsApprovedArtist(BasePermission):
    """
    برای GET (لیست/جزئیات) همیشه اجازه می‌ده.
    برای POST (ساخت آهنگ/آلبوم) فقط کاربری که پروفایل Artist با status=approved داره اجازه داره.
    """

    message = "فقط هنرمندان تأییدشده می‌توانند اثر جدید ثبت کنند."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        artist_profile = get_artist_profile(request.user)
        return bool(artist_profile and artist_profile.status == "approved")


class IsWorkOwner(BasePermission):
    """فقط هنرمندِ صاحبِ آهنگ/آلبوم اجازه‌ی PATCH/DELETE داره؛ GET برای همه آزاده."""

    message = "فقط صاحب اثر اجازه‌ی ویرایش یا حذف آن را دارد."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        artist_profile = get_artist_profile(request.user)
        return bool(artist_profile and obj.artist_id == artist_profile.id)


class IsPlaylistOwner(IsOwnerOrReadOnly):
    """پلی‌لیست‌ها خصوصی‌اند: فقط مالک می‌بینه/ویرایش می‌کنه (queryset هم owner-scoped نگه داشته می‌شه)."""

    owner_field = "owner"

    def has_object_permission(self, request, view, obj):
        # برخلاف IsOwnerOrReadOnly پایه، اینجا حتی GET هم فقط برای مالک آزاده
        # چون پلی‌لیست عمومی/قابل‌اشتراک نیست (طبق api-contract.md اندپوینت عمومی نداره).
        return obj.owner_id == request.user.id
