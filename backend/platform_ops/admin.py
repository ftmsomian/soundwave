from django.contrib import admin

from .models import MonthlyAccounting, Notification, SubscriptionPricing, Ticket, TicketMessage, Transaction


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "is_read", "created_at")
    list_filter = ("type", "is_read")
    search_fields = ("user__username", "title", "message")


class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 0
    readonly_fields = ("sender", "content", "created_at")


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "subject", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("user__username", "subject")
    inlines = [TicketMessageInline]


@admin.register(SubscriptionPricing)
class SubscriptionPricingAdmin(admin.ModelAdmin):
    list_display = ("silver_price", "gold_price", "updated_at")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "tier", "duration_months", "amount", "status", "created_at")
    list_filter = ("tier", "status")
    search_fields = ("user__username", "gateway_ref")


@admin.register(MonthlyAccounting)
class MonthlyAccountingAdmin(admin.ModelAdmin):
    list_display = ("artist", "month", "total_streams", "unique_listeners", "earnings", "payment_status")
    list_filter = ("month", "payment_status")
    search_fields = ("artist__artist_name", "artist__user__username")
