from rest_framework.views import exception_handler


def standard_exception_handler(exc, context):
    """
    فرمت خطای مشترک بین هر سه اپ (طبق docs/backend/backend-conventions.md):
    {"error": {"code": "...", "message": "...", "details": {}}}
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    code = getattr(exc, "default_code", exc.__class__.__name__.upper())
    detail = response.data

    response.data = {
        "error": {
            "code": code,
            "message": detail if isinstance(detail, str) else str(detail),
            "details": detail if isinstance(detail, dict) else {},
        }
    }
    return response


class AppError(Exception):
    """برای خطاهای سفارشی دامنه (مثل DAILY_STREAM_LIMIT_REACHED) استفاده کن."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)
