from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from platform_ops.models import SubscriptionPricing

User = get_user_model()


class PricingApiTests(APITestCase):
    def setUp(self):
        SubscriptionPricing.objects.all().delete()
        self.admin = User.objects.create_user(username="admin1", password="pass12345", role="admin")
        self.support = User.objects.create_user(username="support1", password="pass12345", role="support")
        self.url = reverse("platform_ops:pricing")

    def test_admin_can_initialize_dynamic_pricing(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            self.url, {"silver_price": "100000.00", "gold_price": "200000.00"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(SubscriptionPricing.objects.count(), 1)

    def test_initial_pricing_requires_both_prices(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(self.url, {"silver_price": "100000.00"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(SubscriptionPricing.objects.count(), 0)

    def test_admin_can_patch_one_existing_price(self):
        SubscriptionPricing.objects.create(silver_price="100000.00", gold_price="200000.00")
        self.client.force_authenticate(self.admin)
        response = self.client.patch(self.url, {"gold_price": "250000.00"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(SubscriptionPricing.objects.get().gold_price), "250000.00")

    def test_non_admin_cannot_read_or_change_pricing(self):
        SubscriptionPricing.objects.create(silver_price="100000.00", gold_price="200000.00")
        self.client.force_authenticate(self.support)
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            self.client.patch(self.url, {"gold_price": "1.00"}, format="json").status_code,
            status.HTTP_403_FORBIDDEN,
        )
