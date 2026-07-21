"""
Permission های مشترک بین هر سه اپ.
هیچ‌کدوم از اعضا نباید منطق role/subscription رو داخل View خودش کپی کنه —
همیشه از همین کلاس‌ها ارث‌بری کنید.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS

TIER_ORDER = {"free": 0, "silver": 1, "gold": 2}


class IsOwnerOrReadOnly(BasePermission):
    """فقط صاحب رکورد (owner_field="owner" یا "user") اجازه‌ی نوشتن داره."""

    owner_field = "owner"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, self.owner_field, None) or getattr(obj, "user", None)
        return owner == request.user


class RoleRequired(BasePermission):
    """
    استفاده: permission_classes = [RoleRequired(['support', 'admin'])]
    یا با subclass کردن و ست کردن allowed_roles.
    """

    allowed_roles: tuple = ()

    def __init__(self, allowed_roles=None):
        if allowed_roles:
            self.allowed_roles = allowed_roles

    def __call__(self):
        # اجازه می‌ده هم به صورت instance و هم به صورت کلاس در permission_classes بیاد
        return self

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class HasActiveSubscription(BasePermission):
    """
    استفاده: permission_classes = [HasActiveSubscription(min_tier='silver')]
    ترتیب سطوح: free < silver < gold
    """

    min_tier = "free"

    def __init__(self, min_tier="free"):
        self.min_tier = min_tier

    def __call__(self):
        return self

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return TIER_ORDER.get(user.subscription, 0) >= TIER_ORDER.get(self.min_tier, 0)
