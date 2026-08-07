"""Automatic notification receivers for events owned by or consumed by platform_ops."""
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from accounts.models import Artist, Follow
from catalog.models import Song

from .models import MonthlyAccounting, Notification, Ticket

User = get_user_model()


def _staff_users():
    return User.objects.filter(role__in=["support", "admin"], is_active=True)


@receiver(post_save, sender=Artist)
def notify_artist_registration(sender, instance, created, **kwargs):
    if not created or instance.status != "pending":
        return
    notifications = [
        Notification(
            user=user,
            type="artist_verification_request",
            title="درخواست جدید تأیید هنرمند",
            message=f"{instance.artist_name} درخواست تأیید هنرمندی ثبت کرده است.",
            link="/admin?tab=artists",
        )
        for user in _staff_users()
    ]
    Notification.objects.bulk_create(notifications)


@receiver(pre_save, sender=Artist)
def remember_previous_artist_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return
    instance._previous_status = sender.objects.filter(pk=instance.pk).values_list("status", flat=True).first()


@receiver(post_save, sender=Artist)
def notify_artist_status_change(sender, instance, created, **kwargs):
    if created or getattr(instance, "_previous_status", None) == instance.status:
        return
    if instance.status == "approved":
        Notification.objects.create(
            user=instance.user,
            type="artist_approved",
            title="درخواست هنرمندی تأیید شد",
            message="حساب هنرمندی شما تأیید شد.",
            link=f"/artist/{instance.user.username}",
        )
    elif instance.status == "rejected":
        reason = instance.rejection_reason.strip()
        message = "درخواست هنرمندی شما رد شد."
        if reason:
            message += f" دلیل: {reason}"
        Notification.objects.create(
            user=instance.user,
            type="artist_rejected",
            title="درخواست هنرمندی رد شد",
            message=message,
            link="/settings",
        )


@receiver(post_save, sender=Song)
def notify_followers_about_release(sender, instance, created, **kwargs):
    if not created:
        return
    follower_ids = Follow.objects.filter(following=instance.artist.user).values_list("follower_id", flat=True)
    notifications = [
        Notification(
            user_id=user_id,
            type="new_release",
            title="اثر جدید منتشر شد",
            message=f"{instance.artist.artist_name} اثر «{instance.title}» را منتشر کرد.",
            link=f"/song/{instance.pk}",
        )
        for user_id in follower_ids
    ]
    Notification.objects.bulk_create(notifications)


@receiver(post_save, sender=Ticket)
def notify_staff_about_ticket(sender, instance, created, **kwargs):
    if not created:
        return
    notifications = [
        Notification(
            user=user,
            type="new_ticket",
            title="تیکت پشتیبانی جدید",
            message=f"تیکت «{instance.subject}» ثبت شد.",
            link=f"/admin?tab=tickets&ticket={instance.pk}",
        )
        for user in _staff_users()
    ]
    Notification.objects.bulk_create(notifications)


@receiver(post_save, sender=MonthlyAccounting)
def notify_artist_about_accounting(sender, instance, created, **kwargs):
    if not created:
        return
    Notification.objects.create(
        user=instance.artist.user,
        type="monthly_earnings",
        title="حسابرسی ماهانه آماده شد",
        message=f"حسابرسی {instance.month} با مبلغ {instance.earnings} ثبت شد.",
        link="/artist/manage",
    )
