# ⚙️ SoundWave Backend (Django + DRF)

## راه‌اندازی سریع

```bash
cd backend
python -m venv venv
source venv/bin/activate        # ویندوز: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # مقادیر لازم رو پر کن
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## ساختار اپ‌ها

| اپ | مسئول | توضیح |
|----|-------|-------|
| `core` | مشترک | permission/pagination/exception/subscription_rules مشترک |
| `accounts` | عضو ۱ | User/Artist/Follow، احراز هویت JWT، پروفایل |
| `catalog` | عضو ۲ | Song/Album/Playlist، آپلود، استریم، جستجو |
| `platform_ops` | عضو ۳ | Notification/Ticket/Pricing/Payment/Accounting |

## مستندات کامل تقسیم‌بندی و برنامه

همه‌ی جزئیات، چک‌لیست هرکس و برنامه‌ی ۹ روزه در [`docs/backend/`](../docs/backend/backend-overview.md) هست.

> نکته: فایل‌های `views.py`/`urls.py`/`signals.py` هر اپ فعلاً فقط `TODO` دارن — هرکس طبق چک‌لیست خودش پرشون می‌کنه.
