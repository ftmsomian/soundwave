"""Member 3 API views for platform operations."""
import calendar
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction
from django.db.models import Count, Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Artist
from core.permissions import RoleRequired

from .models import MonthlyAccounting, Notification, SubscriptionPricing, Ticket, Transaction
from .serializers import (
    ArtistRejectSerializer,
    ArtistRequestSerializer,
    MonthlyAccountingSerializer,
    NotificationSerializer,
    PaymentCallbackSerializer,
    SubscriptionPricingSerializer,
    SubscriptionPurchaseSerializer,
    TicketMessageSerializer,
    TicketSerializer,
    TicketStatusSerializer,
    TransactionSerializer,
)
from .services.payment_gateway import PaymentGatewayError, request_payment, verify_payment

User = get_user_model()


class IsSupportOrAdmin(RoleRequired):
    allowed_roles = ("support", "admin")

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser) or super().has_permission(request, view)


class IsAdminRole(RoleRequired):
    allowed_roles = ("admin",)

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser) or super().has_permission(request, view)


def _is_staff_role(user):
    return bool(user.is_superuser or user.role in {"support", "admin"})


def _add_months(value, months):
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Notification.objects.filter(user=request.user)
        # APIView does not create a paginator automatically; use the configured class explicitly.
        from core.pagination import StandardPagination

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(NotificationSerializer(page, many=True).data)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)


class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"updated": updated})


class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TicketListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Ticket.objects.all() if _is_staff_role(request.user) else Ticket.objects.filter(user=request.user)
        from core.pagination import StandardPagination

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(TicketSerializer(page, many=True).data)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(user=request.user)
        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class TicketMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def _ticket(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        if not (_is_staff_role(request.user) or ticket.user_id == request.user.id):
            self.permission_denied(request, message="شما به این تیکت دسترسی ندارید.")
        return ticket

    def get(self, request, pk):
        ticket = self._ticket(request, pk)
        return Response(TicketMessageSerializer(ticket.messages.all(), many=True).data)

    def post(self, request, pk):
        ticket = self._ticket(request, pk)
        if ticket.status == "closed":
            return Response(
                {"detail": "تیکت بسته است و پیام جدید نمی‌پذیرد."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = TicketMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(ticket=ticket, sender=request.user)
        if _is_staff_role(request.user) and ticket.status == "open":
            ticket.status = "answered"
            ticket.save(update_fields=["status", "updated_at"])
        return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)


class TicketStatusView(APIView):
    permission_classes = [IsSupportOrAdmin]

    def patch(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        serializer = TicketStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        allowed = {
            "open": {"open", "answered", "closed"},
            "answered": {"answered", "open", "closed"},
            "closed": {"closed"},
        }
        if new_status not in allowed[ticket.status]:
            return Response({"detail": "تغییر وضعیت درخواستی مجاز نیست."}, status=status.HTTP_400_BAD_REQUEST)
        ticket.status = new_status
        ticket.save(update_fields=["status", "updated_at"])
        return Response(TicketSerializer(ticket).data)


class ArtistRequestListView(APIView):
    permission_classes = [IsSupportOrAdmin]

    def get(self, request):
        requested_status = request.query_params.get("status", "pending")
        if requested_status not in {"pending", "approved", "rejected"}:
            return Response({"detail": "status نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)
        queryset = Artist.objects.select_related("user").filter(status=requested_status).order_by("created_at")
        from core.pagination import StandardPagination

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(ArtistRequestSerializer(page, many=True).data)


class ArtistApproveView(APIView):
    permission_classes = [IsSupportOrAdmin]

    def post(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        artist.status = "approved"
        artist.is_verified = True
        artist.rejection_reason = ""
        artist.save(update_fields=["status", "is_verified", "rejection_reason"])
        return Response(ArtistRequestSerializer(artist).data)


class ArtistRejectView(APIView):
    permission_classes = [IsSupportOrAdmin]

    def post(self, request, pk):
        artist = get_object_or_404(Artist, pk=pk)
        serializer = ArtistRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        artist.status = "rejected"
        artist.is_verified = False
        artist.rejection_reason = serializer.validated_data["reason"]
        artist.save(update_fields=["status", "is_verified", "rejection_reason"])
        return Response(ArtistRequestSerializer(artist).data)


class PricingView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        pricing = SubscriptionPricing.objects.first()
        if pricing is None:
            return Response(
                {"detail": "قیمت اشتراک هنوز توسط مدیر تنظیم نشده است."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(SubscriptionPricingSerializer(pricing).data)

    def patch(self, request):
        pricing = SubscriptionPricing.objects.first()
        if pricing is None:
            required = {"silver_price", "gold_price"}
            if not required.issubset(request.data.keys()):
                return Response(
                    {"detail": "برای تنظیم اولیه هر دو قیمت silver_price و gold_price الزامی‌اند."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = SubscriptionPricingSerializer(data=request.data)
        else:
            serializer = SubscriptionPricingSerializer(pricing, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        pricing = serializer.save()
        return Response(SubscriptionPricingSerializer(pricing).data)


class SubscriptionPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubscriptionPurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pricing = SubscriptionPricing.objects.first()
        if pricing is None:
            return Response(
                {"detail": "قیمت اشتراک هنوز تنظیم نشده است."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        tier = serializer.validated_data["tier"]
        duration = int(serializer.validated_data["duration_months"])
        monthly_price = pricing.silver_price if tier == "silver" else pricing.gold_price
        amount = monthly_price * Decimal(duration)
        txn = Transaction.objects.create(
            user=request.user,
            tier=tier,
            duration_months=duration,
            amount=amount,
            status="pending",
        )

        callback_url = getattr(settings, "PAYMENT_CALLBACK_URL", "") or request.build_absolute_uri(
            reverse("platform_ops:payment-callback")
        )
        try:
            gateway = request_payment(
                amount=amount,
                callback_url=callback_url,
                description=f"SoundWave {tier} subscription - {duration} month(s)",
            )
        except PaymentGatewayError as exc:
            txn.status = "failed"
            txn.save(update_fields=["status"])
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        txn.gateway_ref = gateway.authority
        txn.save(update_fields=["gateway_ref"])
        return Response(
            {"transaction": TransactionSerializer(txn).data, "payment_url": gateway.payment_url},
            status=status.HTTP_201_CREATED,
        )


class PaymentCallbackView(APIView):
    permission_classes = []
    authentication_classes = []

    def _handle(self, request):
        payload = request.query_params.copy()
        payload.update(request.data)
        normalized = {
            "authority": payload.get("authority") or payload.get("Authority"),
            "status": payload.get("status") or payload.get("Status") or "",
        }
        serializer = PaymentCallbackSerializer(data=normalized)
        serializer.is_valid(raise_exception=True)
        authority = serializer.validated_data["authority"]
        gateway_status = serializer.validated_data.get("status", "").upper()

        with db_transaction.atomic():
            txn = get_object_or_404(Transaction.objects.select_for_update(), gateway_ref=authority)
            if txn.status == "success":
                return Response({"transaction": TransactionSerializer(txn).data, "verified": True})
            if gateway_status and gateway_status not in {"OK", "SUCCESS"}:
                txn.status = "failed"
                txn.save(update_fields=["status"])
                return Response({"transaction": TransactionSerializer(txn).data, "verified": False})

            try:
                verification = verify_payment(authority=authority, amount=txn.amount)
            except PaymentGatewayError as exc:
                txn.status = "failed"
                txn.save(update_fields=["status"])
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

            user = txn.user
            now = timezone.now()
            if user.subscription == txn.tier and user.subscription_expires_at and user.subscription_expires_at > now:
                base = user.subscription_expires_at
            else:
                base = now
            user.subscription = txn.tier
            user.subscription_expires_at = _add_months(base, txn.duration_months)
            user.save(update_fields=["subscription", "subscription_expires_at"])
            txn.status = "success"
            txn.save(update_fields=["status"])

        return Response(
            {
                "transaction": TransactionSerializer(txn).data,
                "verified": True,
                "verification_code": verification.code,
                "ref_id": verification.ref_id,
            }
        )

    def post(self, request):
        return self._handle(request)

    def get(self, request):
        # ZarinPal redirects browsers to the callback with query parameters.
        return self._handle(request)


class MonthlyAccountingView(APIView):
    permission_classes = [IsSupportOrAdmin]

    def get(self, request):
        queryset = MonthlyAccounting.objects.select_related("artist", "artist__user")
        month = request.query_params.get("month")
        payment_status = request.query_params.get("payment_status")
        if month:
            try:
                datetime.strptime(month, "%Y-%m")
            except ValueError:
                return Response({"detail": "month باید به فرمت YYYY-MM باشد."}, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(month=month)
        if payment_status:
            if payment_status not in {"pending", "settled"}:
                return Response({"detail": "payment_status نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(payment_status=payment_status)
        from core.pagination import StandardPagination

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(MonthlyAccountingSerializer(page, many=True).data)


class AccountingSettleView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, artist_id):
        queryset = MonthlyAccounting.objects.filter(artist_id=artist_id)
        month = request.data.get("month") or request.query_params.get("month")
        if month:
            queryset = queryset.filter(month=month)
        else:
            queryset = queryset.filter(payment_status="pending")
        accounting = queryset.order_by("-month").first()
        if accounting is None:
            return Response({"detail": "رکورد حسابرسی قابل تسویه پیدا نشد."}, status=status.HTTP_404_NOT_FOUND)
        accounting.payment_status = "settled"
        accounting.save(update_fields=["payment_status"])
        return Response(MonthlyAccountingSerializer(accounting).data)


class SubscriptionDistributionReportView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        counts = {"free": 0, "silver": 0, "gold": 0}
        for row in User.objects.values("subscription").annotate(count=Count("id")):
            if row["subscription"] in counts:
                counts[row["subscription"]] = row["count"]
        return Response({"distribution": counts, "total": sum(counts.values())})


class RevenueReportView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        now = timezone.now()
        queryset = Transaction.objects.filter(status="success", created_at__year=now.year, created_at__month=now.month)
        revenue = queryset.aggregate(total=Coalesce(Sum("amount"), Decimal("0.00")))["total"]
        return Response({"month": now.strftime("%Y-%m"), "revenue": revenue, "successful_transactions": queryset.count()})
