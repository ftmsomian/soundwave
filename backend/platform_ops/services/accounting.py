"""فرمول محاسبه‌ی پاداش هنرمند — یک‌جا، قابل تغییر بدون دست زدن به بقیه‌ی کد."""


def calculate_artist_earnings(unique_listeners: int, total_streams: int) -> float:
    # TODO(member3): فرمول دقیق رو با تیم/استاد نهایی کن
    return round(unique_listeners * 0.5 + total_streams * 0.01, 2)
