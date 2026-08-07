from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Artist
from platform_ops.models import Notification

User = get_user_model()


class NotificationAndArtistRequestTests(APITestCase):
    def setUp(self):
        self.support = User.objects.create_user(username="support", password="pass12345", role="support")
        self.admin = User.objects.create_user(username="admin", password="pass12345", role="admin")
        self.artist_user = User.objects.create_user(username="artist", password="pass12345", role="artist")
        self.artist = Artist.objects.create(user=self.artist_user, artist_name="Artist", status="pending")

    def test_artist_registration_notifies_support_and_admin(self):
        self.assertTrue(
            Notification.objects.filter(user=self.support, type="artist_verification_request").exists()
        )
        self.assertTrue(
            Notification.objects.filter(user=self.admin, type="artist_verification_request").exists()
        )

    def test_support_can_approve_artist_and_artist_is_notified(self):
        self.client.force_authenticate(self.support)
        response = self.client.post(reverse("platform_ops:artist-approve", args=[self.artist.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.artist.refresh_from_db()
        self.assertEqual(self.artist.status, "approved")
        self.assertTrue(self.artist.is_verified)
        self.assertTrue(Notification.objects.filter(user=self.artist_user, type="artist_approved").exists())

    def test_rejection_requires_reason(self):
        self.client.force_authenticate(self.support)
        response = self.client.post(
            reverse("platform_ops:artist-reject", args=[self.artist.id]), {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.artist.refresh_from_db()
        self.assertEqual(self.artist.status, "pending")

    def test_user_can_read_and_delete_only_own_notifications(self):
        own = Notification.objects.create(
            user=self.artist_user, type="new_ticket", title="Mine", message="Mine"
        )
        other_user = User.objects.create_user(username="other", password="pass12345")
        other = Notification.objects.create(user=other_user, type="new_ticket", title="Other", message="Other")
        self.client.force_authenticate(self.artist_user)

        read = self.client.post(reverse("platform_ops:notification-read", args=[own.id]))
        self.assertEqual(read.status_code, status.HTTP_200_OK)
        own.refresh_from_db()
        self.assertTrue(own.is_read)

        denied = self.client.delete(reverse("platform_ops:notification-delete", args=[other.id]))
        self.assertEqual(denied.status_code, status.HTTP_404_NOT_FOUND)
        deleted = self.client.delete(reverse("platform_ops:notification-delete", args=[own.id]))
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
