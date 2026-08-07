from django.urls import path

from .views import (
    AccountingSettleView,
    ArtistApproveView,
    ArtistRejectView,
    ArtistRequestListView,
    MonthlyAccountingView,
    NotificationDeleteView,
    NotificationListView,
    NotificationReadAllView,
    NotificationReadView,
    PaymentCallbackView,
    PricingView,
    RevenueReportView,
    SubscriptionDistributionReportView,
    SubscriptionPurchaseView,
    TicketListCreateView,
    TicketMessagesView,
    TicketStatusView,
)

app_name = "platform_ops"

urlpatterns = [
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/read-all/", NotificationReadAllView.as_view(), name="notification-read-all"),
    path("notifications/<int:pk>/read/", NotificationReadView.as_view(), name="notification-read"),
    path("notifications/<int:pk>/", NotificationDeleteView.as_view(), name="notification-delete"),
    path("tickets/", TicketListCreateView.as_view(), name="ticket-list-create"),
    path("tickets/<int:pk>/messages/", TicketMessagesView.as_view(), name="ticket-messages"),
    path("tickets/<int:pk>/status/", TicketStatusView.as_view(), name="ticket-status"),
    path("artist-requests/", ArtistRequestListView.as_view(), name="artist-request-list"),
    path("artist-requests/<int:pk>/approve/", ArtistApproveView.as_view(), name="artist-approve"),
    path("artist-requests/<int:pk>/reject/", ArtistRejectView.as_view(), name="artist-reject"),
    path("pricing/", PricingView.as_view(), name="pricing"),
    path("subscriptions/purchase/", SubscriptionPurchaseView.as_view(), name="subscription-purchase"),
    path("payments/callback/", PaymentCallbackView.as_view(), name="payment-callback"),
    path("accounting/monthly/", MonthlyAccountingView.as_view(), name="accounting-monthly"),
    path("accounting/<int:artist_id>/settle/", AccountingSettleView.as_view(), name="accounting-settle"),
    path(
        "reports/subscription-distribution/",
        SubscriptionDistributionReportView.as_view(),
        name="subscription-distribution",
    ),
    path("reports/revenue/", RevenueReportView.as_view(), name="revenue-report"),
]
