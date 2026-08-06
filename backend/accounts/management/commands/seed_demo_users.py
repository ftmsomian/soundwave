"""
دستور کمکی برای ساخت حساب‌های تستی — دقیقاً همان‌هایی که در LoginForm.tsx (فرانت‌اند)
به‌عنوان راهنمای توسعه نمایش داده می‌شوند، تا بشه لاگین واقعی رو با نقش‌ها و سطوح اشتراک
مختلف امتحان کرد.

اجرا:
    python manage.py seed_demo_users
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import Artist

User = get_user_model()

DEMO_PASSWORD = "test123"

DEMO_USERS = [
    {"email": "user.free@test.com", "username": "user_free", "display_name": "کاربر رایگان", "role": "user", "subscription": "free"},
    {"email": "user.silver@test.com", "username": "user_silver", "display_name": "کاربر نقره‌ای", "role": "user", "subscription": "silver"},
    {"email": "user.gold@test.com", "username": "user_gold", "display_name": "کاربر طلایی", "role": "user", "subscription": "gold"},
    {"email": "support@test.com", "username": "support_demo", "display_name": "پشتیبان تستی", "role": "support", "subscription": "free"},
    {"email": "admin@test.com", "username": "admin_demo", "display_name": "مدیر تستی", "role": "admin", "subscription": "gold"},
]

DEMO_ARTIST = {
    "email": "artist@test.com",
    "username": "artist_demo",
    "display_name": "هنرمند تستی",
    "role": "artist",
    "subscription": "free",
}


class Command(BaseCommand):
    help = "حساب‌های کاربری تستی (مطابق راهنمای صفحه‌ی ورود) را در دیتابیس می‌سازد یا به‌روزرسانی می‌کند."

    def handle(self, *args, **options):
        created, updated = 0, 0

        for spec in DEMO_USERS:
            user, was_created = User.objects.get_or_create(
                email=spec["email"],
                defaults={
                    "username": spec["username"],
                    "display_name": spec["display_name"],
                    "role": spec["role"],
                    "subscription": spec["subscription"],
                },
            )
            user.username = spec["username"]
            user.display_name = spec["display_name"]
            user.role = spec["role"]
            user.subscription = spec["subscription"]
            user.set_password(DEMO_PASSWORD)
            user.save()
            created += 1 if was_created else 0
            updated += 0 if was_created else 1

        artist_user, was_created = User.objects.get_or_create(
            email=DEMO_ARTIST["email"],
            defaults={
                "username": DEMO_ARTIST["username"],
                "display_name": DEMO_ARTIST["display_name"],
                "role": "artist",
                "subscription": "free",
            },
        )
        artist_user.username = DEMO_ARTIST["username"]
        artist_user.display_name = DEMO_ARTIST["display_name"]
        artist_user.role = "artist"
        artist_user.set_password(DEMO_PASSWORD)
        artist_user.save()
        created += 1 if was_created else 0
        updated += 0 if was_created else 1

        Artist.objects.update_or_create(
            user=artist_user,
            defaults={
                "artist_name": DEMO_ARTIST["display_name"],
                "status": "approved",
                "is_verified": True,
                "portfolio_url": "https://soundcloud.com/demo-artist",
            },
        )

        self.stdout.write(self.style.SUCCESS(
            f"✅ {created} حساب تستی ساخته شد، {updated} حساب به‌روزرسانی شد. رمز همه: {DEMO_PASSWORD}"
        ))
        self.stdout.write("حساب‌ها: " + ", ".join(u["email"] for u in DEMO_USERS) + f", {DEMO_ARTIST['email']}")
