from django.contrib import admin

from .models import MonthlyAccounting, Notification, SubscriptionPricing, Ticket, TicketMessage, Transaction

admin.site.register(Notification)
admin.site.register(Ticket)
admin.site.register(TicketMessage)
admin.site.register(SubscriptionPricing)
admin.site.register(Transaction)
admin.site.register(MonthlyAccounting)
