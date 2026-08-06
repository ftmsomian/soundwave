"""
منبع حقیقت واحد برای محدودیت‌های هر سطح اشتراک.
طبق نکته‌ی مستند پروژه: تغییر محدودیت/قیمت نباید نیاز به تغییر کد در چند جای مختلف داشته باشه.
قیمت واقعی (silver_price/gold_price) قرار بوده از مدل SubscriptionPricing (اپ platform_ops) خونده بشه؛
اون اپ فعلاً حذف شده، پس این فایل فقط محدودیت‌های عملکردی (نه مالی) رو نگه می‌داره.
"""

PLAYLIST_LIMITS = {
    "free": 6,
    "silver": 100,
    "gold": None,  # None یعنی نامحدود
}

DAILY_STREAM_LIMIT = {
    "free": 60,
    "silver": None,
    "gold": None,
}

CAN_UPLOAD_AVATAR = {"free": False, "silver": True, "gold": True}
CAN_DOWNLOAD_SONGS = {"free": False, "silver": True, "gold": True}
CAN_SEE_EARLY_ACCESS = {"free": False, "silver": False, "gold": True}
CAN_VIEW_ARTIST_STATS = {"free": False, "silver": False, "gold": True}


def playlist_limit_for(tier: str):
    return PLAYLIST_LIMITS.get(tier, PLAYLIST_LIMITS["free"])


def daily_stream_limit_for(tier: str):
    return DAILY_STREAM_LIMIT.get(tier, DAILY_STREAM_LIMIT["free"])
