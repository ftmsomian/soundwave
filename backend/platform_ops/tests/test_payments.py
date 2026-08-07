from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from platform_ops.models import SubscriptionPricing, Transaction
from platform_ops.services.payment_gateway import PaymentRequestResult, PaymentVerificationResult

User = get_user_model()


class PaymentApiTests(APITestCase):
    def setUp(self):
        SubscriptionPricing.objects.all().delete()
        self.user = User.objects.create_user(username="buyer", password="pass12345")
        SubscriptionPricing.objects.create(silver_price="1000.00", gold_price="2500.00")
        self.purchase_url = reverse("platform_ops:subscription-purchase")
        self.callback_url = reverse("platform_ops:payment-callback")

    @patch("platform_ops.views.request_payment")
    def test_purchase_uses_database_price_and_creates_pending_transaction(self, mocked_request):
        mocked_request.return_value = PaymentRequestResult(authority="AUTH-1", payment_url="https://pay.test/AUTH-1")
        self.client.force_authenticate(self.user)
        response = self.client.post(
            self.purchase_url, {"tier": "silver", "duration_months": 3}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        txn = Transaction.objects.get()
        self.assertEqual(str(txn.amount), "3000.00")
        self.assertEqual(txn.gateway_ref, "AUTH-1")
        self.assertEqual(txn.status, "pending")

    def test_purchase_rejects_invalid_tier_or_duration(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            self.purchase_url, {"tier": "platinum", "duration_months": 2}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("platform_ops.views.verify_payment")
    def test_successful_callback_updates_subscription(self, mocked_verify):
        mocked_verify.return_value = PaymentVerificationResult(code=100, ref_id="REF-100")
        Transaction.objects.create(
            user=self.user,
            tier="gold",
            duration_months=1,
            amount="2500.00",
            status="pending",
            gateway_ref="AUTH-2",
        )
        response = self.client.post(
            self.callback_url, {"Authority": "AUTH-2", "Status": "OK"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.subscription, "gold")
        self.assertIsNotNone(self.user.subscription_expires_at)
        self.assertGreater(self.user.subscription_expires_at, timezone.now())
        self.assertEqual(Transaction.objects.get(gateway_ref="AUTH-2").status, "success")

    @patch("platform_ops.views.verify_payment")
    def test_success_callback_is_idempotent(self, mocked_verify):
        mocked_verify.return_value = PaymentVerificationResult(code=100, ref_id="REF-101")
        txn = Transaction.objects.create(
            user=self.user,
            tier="silver",
            duration_months=1,
            amount="1000.00",
            status="pending",
            gateway_ref="AUTH-3",
        )
        first = self.client.post(self.callback_url, {"Authority": "AUTH-3", "Status": "OK"}, format="json")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        first_expiry = self.user.subscription_expires_at

        second = self.client.post(self.callback_url, {"Authority": "AUTH-3", "Status": "OK"}, format="json")
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.subscription_expires_at, first_expiry)
        self.assertEqual(mocked_verify.call_count, 1)
        txn.refresh_from_db()
        self.assertEqual(txn.status, "success")

    def test_cancelled_gateway_callback_marks_transaction_failed(self):
        Transaction.objects.create(
            user=self.user,
            tier="silver",
            duration_months=1,
            amount="1000.00",
            status="pending",
            gateway_ref="AUTH-4",
        )
        response = self.client.post(
            self.callback_url, {"Authority": "AUTH-4", "Status": "NOK"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Transaction.objects.get(gateway_ref="AUTH-4").status, "failed")
