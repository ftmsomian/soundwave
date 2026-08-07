"""Artist accounting service. All reward math stays in this module."""
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings


def calculate_artist_earnings(unique_listeners: int, total_streams: int) -> Decimal:
    """
    Calculate monthly artist earnings using centrally configurable rates.

    The project documents never finalized the reward formula. The original scaffold
    used 0.50 per unique listener + 0.01 per stream, so those values remain the
    development defaults but can be changed through environment-backed settings
    without touching application code.
    """
    listener_rate = Decimal(str(settings.ARTIST_EARNING_PER_UNIQUE_LISTENER))
    stream_rate = Decimal(str(settings.ARTIST_EARNING_PER_STREAM))
    amount = Decimal(unique_listeners) * listener_rate + Decimal(total_streams) * stream_rate
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
