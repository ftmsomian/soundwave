"""Small ZarinPal v4 gateway adapter used by the subscription purchase flow."""
import json
from dataclasses import dataclass
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings


class PaymentGatewayError(RuntimeError):
    pass


@dataclass(frozen=True)
class PaymentRequestResult:
    authority: str
    payment_url: str


@dataclass(frozen=True)
class PaymentVerificationResult:
    code: int
    ref_id: str | None = None


def _base_url() -> str:
    return "https://sandbox.zarinpal.com" if settings.ZARINPAL_SANDBOX else "https://api.zarinpal.com"


def _gateway_url(authority: str) -> str:
    host = "https://sandbox.zarinpal.com" if settings.ZARINPAL_SANDBOX else "https://www.zarinpal.com"
    return f"{host}/pg/StartPay/{authority}"


def _post_json(path: str, payload: dict) -> dict:
    request = Request(
        f"{_base_url()}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=settings.ZARINPAL_TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8")
    except (HTTPError, URLError, TimeoutError) as exc:
        raise PaymentGatewayError(f"ZarinPal request failed: {exc}") from exc

    try:
        data = json.loads(body)
    except json.JSONDecodeError as exc:
        raise PaymentGatewayError("ZarinPal returned invalid JSON.") from exc

    if data.get("errors"):
        error = data["errors"]
        raise PaymentGatewayError(str(error.get("message") or error))
    return data.get("data") or data


def _gateway_amount(amount: Decimal) -> int:
    if amount != amount.to_integral_value():
        raise PaymentGatewayError("ZarinPal amount must be a whole-number currency amount.")
    return int(amount)


def request_payment(amount: Decimal, callback_url: str, description: str) -> PaymentRequestResult:
    if not settings.ZARINPAL_MERCHANT_ID:
        raise PaymentGatewayError("ZARINPAL_MERCHANT_ID is not configured.")

    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": _gateway_amount(amount),
        "callback_url": callback_url,
        "description": description,
        "currency": settings.ZARINPAL_CURRENCY,
    }
    data = _post_json("/pg/v4/payment/request.json", payload)
    code = int(data.get("code", 0))
    authority = data.get("authority", "")
    if code != 100 or not authority:
        raise PaymentGatewayError(data.get("message") or f"Payment request rejected with code {code}.")
    return PaymentRequestResult(authority=authority, payment_url=_gateway_url(authority))


def verify_payment(authority: str, amount: Decimal) -> PaymentVerificationResult:
    if not settings.ZARINPAL_MERCHANT_ID:
        raise PaymentGatewayError("ZARINPAL_MERCHANT_ID is not configured.")

    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": _gateway_amount(amount),
        "authority": authority,
    }
    data = _post_json("/pg/v4/payment/verify.json", payload)
    code = int(data.get("code", 0))
    if code not in (100, 101):
        raise PaymentGatewayError(data.get("message") or f"Payment verification failed with code {code}.")
    ref_id = data.get("ref_id")
    return PaymentVerificationResult(code=code, ref_id=str(ref_id) if ref_id is not None else None)
