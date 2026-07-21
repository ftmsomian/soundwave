# 🎧 SoundWave — فاز دوم (Backend + Django)

> این فایل رو داخل ریپو، توی مسیر `docs/backend/backend-overview.md` بذار و از این به بعد لینک‌ها رو توی README اصلی هم اضافه کن.

## 🎯 هدف فاز دوم
پیاده‌سازی بک‌اند با **Django + DRF**، طراحی مدل‌ها، اتصال به فرانت‌اندی که در فاز اول ساختیم، و پیاده‌سازی درگاه پرداخت. مهلت: **۹ روز**.

## 👥 تقسیم‌بندی جدید (فاز دوم)

| نقش | اپ جنگو | مسئولیت اصلی |
|-----|---------|--------------|
| عضو اول | `accounts` | راه‌اندازی پروژه، User/Artist model، احراز هویت (JWT)، پروفایل، دنبال کردن، آپلود آواتار، سطوح دسترسی |
| عضو دوم | `catalog` | آهنگ، آلبوم، پلی‌لیست، جستجو/فیلتر، آپلود فایل صوتی و کاور، استریم و محدودیت‌های اشتراک، مدیریت آثار هنرمند |
| عضو سوم | `platform` | اعلانات، تیکت‌ها و تأیید هنرمندان، قیمت‌گذاری پویا، درگاه پرداخت، حسابرسی و پاداش هنرمندان |

> این تقسیم‌بندی طوری طراحی شده که هرکس بیشترین overlap رو با کاری که خودش در فاز اول انجام داده داشته باشه (نگاه کن به `docs/checklist-member1/2/3.md` فاز اول)، ولی چون بک‌اند یک source of truth مشترک (مدل `User`) داره، **روز صفر و صبح روز اول** باید حتماً با هم هماهنگ بشید.

## 🗂 ساختار پیشنهادی ریپو (بعد از اضافه شدن بک‌اند)

```
/
├── frontend/                  ← فاز اول (بدون تغییر ساختاری، فقط اتصال به API)
├── backend/                   ← پروژه جدید Django
│   ├── config/                ← settings, urls, wsgi/asgi
│   ├── accounts/               ← عضو ۱
│   ├── catalog/                ← عضو ۲
│   ├── platform_ops/           ← عضو ۳  (notifications, tickets, subscriptions, payments, accounting)
│   ├── core/                   ← مشترک: permissions, pagination, response envelope, base models
│   ├── media/                  ← فایل‌های آپلودی (gitignore بشه)
│   ├── manage.py
│   └── requirements.txt
├── docs/
│   └── backend/                ← همین فایل‌ها
└── docker-compose.yml          ← اختیاری، آخر کار
```

## 📋 لینک‌های مهم فاز دوم

- [چک‌لیست عضو اول — Auth & Users](checklist-member1-auth-users.md)
- [چک‌لیست عضو دوم — Catalog (موسیقی)](checklist-member2-catalog.md)
- [چک‌لیست عضو سوم — Platform (اعلانات/پشتیبانی/پرداخت)](checklist-member3-platform-payments.md)
- [قرارداد مشترک API (خیلی مهم — همه باید رعایت کنن)](api-contract.md)
- [قراردادهای کدنویسی بک‌اند (Django/DRF)](backend-conventions.md)
- [برنامه‌ی روز به روز ۹ روزه](9-day-schedule.md)
- [چک‌لیست نهایی نمره‌دهی فاز دوم](final-checklist-backend.md)

## 🚀 شروع سریع (بعد از اینکه عضو اول اسکلت رو پوش کرد)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # ویندوز: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

فایل `.env` رو از روی `.env.example` بساز (مقادیر SECRET_KEY، DB، Zarinpal sandbox merchant id و ...).

## 🌿 قراردادهای برنچ (فاز دوم)

| نوع برنچ | فرمت | مثال |
|----------|------|------|
| هر نفر روی اپ خودش | `backend/<username>-<app>` | `backend/maani-accounts` |
| فیچر داخل اپ | `backend/<username>/<feature>` | `backend/maani/jwt-auth` |
| ادغام | همه به `dev` PR بزنن، نه مستقیم `main` |

**نکته حیاتی:** چون هر سه اپ به مدل `User` (اپ `accounts`) وابسته‌اند، عضو اول باید **همون روز اول، ظهر** نسخه‌ی اولیه‌ی مدل `User` (فقط فیلدها، بدون منطق کامل) رو به `dev` پوش کنه تا بقیه بتونن `ForeignKey`هاشون رو بدون بلاک شدن بزنن. جزئیات دقیق‌تر در [برنامه روز به روز](9-day-schedule.md) اومده.

## ✅ قوانین Pull Request (همون فاز اول + این‌ها)

1. هر PR باید به `dev` باشه، نه `main`.
2. حداقل یه نفر دیگه Review کنه.
3. تست‌ها (`pytest` یا `manage.py test`) باید پاس بشن.
4. اگه مدلی رو تغییر می‌دی که بقیه هم بهش وابسته‌اند (مثلاً `User`)، حتماً توی گروه اعلام کن قبل از merge.
5. Migration فایل‌ها همیشه commit بشن؛ هیچ‌وقت `migrate` رو لوکال نگه ندار.
6. هر endpoint جدید رو توی [قرارداد API](api-contract.md) اضافه کن تا بقیه بدونن هست.
