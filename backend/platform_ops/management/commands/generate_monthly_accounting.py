"""
اجرا: python manage.py generate_monthly_accounting
برای هر هنرمند approved، از StreamLog اپ catalog آمار ماه جاری رو حساب و MonthlyAccounting می‌سازه.
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "محاسبه‌ی حسابرسی ماهانه‌ی هنرمندان"

    def handle(self, *args, **options):
        # TODO(member3): پیاده‌سازی طبق checklist خودت
        self.stdout.write(self.style.SUCCESS("TODO: implement monthly accounting generation"))
