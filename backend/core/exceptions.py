from rest_framework.views import exception_handler


def _first_message(value):
    """اولین پیام خطا رو به رشته‌ی تمیز (بدون ErrorDetail(...) خام) تبدیل می‌کنه."""
    if isinstance(value, list):
        return str(value[0]) if value else ""
    if isinstance(value, dict):
        for v in value.values():
            return _first_message(v)
        return ""
    return str(value)


def _clean_details(detail):
    """دیکشنری details رو به {field: [رشته‌های تمیز]} تبدیل می‌کنه تا هیچ ErrorDetail خامی درش نمونه."""
    if not isinstance(detail, dict):
        return {}
    cleaned = {}
    for field, value in detail.items():
        cleaned[field] = [str(v) for v in value] if isinstance(value, list) else str(value)
    return cleaned


def standard_exception_handler(exc, context):
    """
    فرمت خطای مشترک بین هر سه اپ (طبق docs/backend/backend-conventions.md):
    {"error": {"code": "...", "message": "...", "details": {}}}

    نکته‌ی رفع‌شده: قبلاً وقتی خطا شامل چند فیلد بود (مثلاً هم‌زمان password و gender
    نامعتبر بودن)، message با str(detail) ساخته می‌شد که repr خام پایتون مثل
    ErrorDetail(string='...', code='...') رو توش می‌آورد. الان message همیشه یک جمله‌ی
    تمیز و قابل‌نمایش به کاربره؛ جزئیات کامل هر فیلد هم در details موجوده.
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    code = getattr(exc, "default_code", exc.__class__.__name__.upper())
    detail = response.data

    if isinstance(detail, str):
        message, details = detail, {}
    else:
        message = _first_message(detail) or "اطلاعات ارسالی نامعتبر است."
        details = _clean_details(detail)

    response.data = {"error": {"code": code, "message": message, "details": details}}
    return response


class AppError(Exception):
    """برای خطاهای سفارشی دامنه (مثل DAILY_STREAM_LIMIT_REACHED) استفاده کن."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)
