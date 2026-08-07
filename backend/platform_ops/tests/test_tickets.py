from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from platform_ops.models import Notification, Ticket

User = get_user_model()


class TicketApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="user1", password="pass12345", display_name="User One")
        self.other = User.objects.create_user(username="user2", password="pass12345")
        self.support = User.objects.create_user(username="support1", password="pass12345", role="support")

    def test_user_can_create_ticket_and_support_is_notified(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse("platform_ops:ticket-list-create"), {"subject": "Need help"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = Ticket.objects.get()
        self.assertEqual(ticket.user, self.user)
        self.assertTrue(Notification.objects.filter(user=self.support, type="new_ticket").exists())

    def test_regular_user_only_lists_own_tickets(self):
        Ticket.objects.create(user=self.user, subject="Mine")
        Ticket.objects.create(user=self.other, subject="Other")
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("platform_ops:ticket-list-create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["subject"], "Mine")

    def test_support_lists_all_tickets(self):
        Ticket.objects.create(user=self.user, subject="Mine")
        Ticket.objects.create(user=self.other, subject="Other")
        self.client.force_authenticate(self.support)
        response = self.client.get(reverse("platform_ops:ticket-list-create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_ticket_owner_and_support_can_message_but_other_user_cannot(self):
        ticket = Ticket.objects.create(user=self.user, subject="Conversation")
        url = reverse("platform_ops:ticket-messages", args=[ticket.id])

        self.client.force_authenticate(self.other)
        denied = self.client.post(url, {"content": "No access"})
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.user)
        owner_response = self.client.post(url, {"content": "Hello"})
        self.assertEqual(owner_response.status_code, status.HTTP_201_CREATED)

        self.client.force_authenticate(self.support)
        support_response = self.client.post(url, {"content": "We are checking"})
        self.assertEqual(support_response.status_code, status.HTTP_201_CREATED)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "answered")

    def test_only_support_or_admin_can_change_ticket_status(self):
        ticket = Ticket.objects.create(user=self.user, subject="Close me")
        url = reverse("platform_ops:ticket-status", args=[ticket.id])

        self.client.force_authenticate(self.user)
        denied = self.client.patch(url, {"status": "closed"}, format="json")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.support)
        allowed = self.client.patch(url, {"status": "closed"}, format="json")
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "closed")
