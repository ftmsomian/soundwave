# ✅ چک‌لیست عضو سوم (بک‌اند) — اپ `platform_ops`

## روز ۱ (موازی)

- [ ] با تیم روی ERD `Notification` / `Ticket` / `SubscriptionPricing` / `Transaction` / `ArtistAccounting` توافق کن
- [ ] مدل‌ها رو با `settings.AUTH_USER_MODEL` بساز؛ برای FK به `Artist`/`Song` فعلاً placeholder بذار تا عضو ۱ و ۲ مدل‌هاشون رو پوش کنن (تا آخر روز ۲)

## مدل‌ها

- [ ] `Notification(user FK, type, title, message, is_read, link, created_at)` — `type` دقیقاً همون enum فاز اول: `subscription_expiring`, `new_release`, `artist_approved`, `artist_rejected`, `monthly_earnings`, `new_ticket`, `artist_verification_request`
- [ ] `Ticket(user FK, subject, status)` + `TicketMessage(ticket FK, sender FK, content, created_at)`
- [ ] `SubscriptionPricing(silver_price, gold_price, updated_at)` — تک ردیف یا سینگلتون؛ **هیچ عددی hardcode نشه**
- [ ] `Transaction(user FK, tier, duration_months, amount, status[pending/success/failed], gateway_ref, created_at)`
- [ ] `MonthlyAccounting(artist FK, month, unique_listeners, total_streams, earnings, payment_status[pending/settled])`

## اندپوینت‌ها

### اعلانات
- [ ] `GET /notifications/` (فقط مال خودم، جدیدترین اول)
- [ ] `POST /notifications/{id}/read/` و `POST /notifications/read-all/`
- [ ] `DELETE /notifications/{id}/`
- [ ] Signal/receiver هایی که موقع اتفاقات زیر خودکار Notification بسازن:
  - ثبت‌نام هنرمند جدید → اعلان به همه‌ی support/admin (`artist_verification_request`)
  - تأیید/رد هنرمند → اعلان به همون هنرمند
  - انتشار اثر جدید توسط هنرمندی که دنبال شده → اعلان به دنبال‌کننده‌ها (`new_release`)
  - نزدیک شدن انقضای اشتراک → یک management command / celery task دوره‌ای
  - محاسبه‌ی حسابرسی ماهانه → اعلان به هنرمند (`monthly_earnings`)
  - تیکت جدید → اعلان به support/admin (`new_ticket`)

### تیکت‌ها
- [ ] `GET/POST /tickets/` (کاربر: تیکت‌های خودش می‌سازه و می‌بینه؛ support/admin: همه رو می‌بینن)
- [ ] `GET/POST /tickets/{id}/messages/` (چت)
- [ ] `PATCH /tickets/{id}/status/` (فقط support/admin: باز→پاسخ‌داده‌شده→بسته)

### تأیید هنرمندان (روی مدل `Artist` از عضو اول)
- [ ] `GET /artist-requests/?status=pending` (فقط support/admin)
- [ ] `POST /artist-requests/{id}/approve/`
- [ ] `POST /artist-requests/{id}/reject/` (با `reason` اجباری)
- هر دو با ارسال Notification مربوطه

### قیمت‌گذاری پویا (فقط admin)
- [ ] `GET /pricing/`
- [ ] `PATCH /pricing/` — تغییر آنی قیمت نقره‌ای/طلایی، بدون نیاز به تغییر کد یا دیپلوی

### خرید اشتراک و درگاه پرداخت
- [ ] `POST /subscriptions/purchase/` — ورودی: `tier`, `duration_months (1/3/6/12)` → محاسبه‌ی مبلغ از `SubscriptionPricing` × ماه (با تخفیف احتمالی برای بازه‌های بلندتر اگه بخواید) → ساخت `Transaction(status=pending)` → ریدایرکت به درگاه (Zarinpal Sandbox)
- [ ] `POST /payments/callback/` — دریافت نتیجه از درگاه، آپدیت `Transaction.status` و در صورت موفقیت آپدیت `user.subscription` و `subscription_expires_at`
- [ ] مستندسازی sandbox merchant id در `.env.example`

### حسابرسی و پاداش
- [ ] فرمول پاداش هنرمند رو با تیم/استاد نهایی کن (تابع در `platform_ops/services/accounting.py` — یک‌جا، قابل تغییر)
- [ ] management command یا celery task ماهانه: برای هر هنرمند approved، از داده‌های `catalog.StreamLog` عضو دوم، `unique_listeners`/`total_streams` رو حساب کن و `MonthlyAccounting` بساز
- [ ] `GET /accounting/monthly/` (support/admin) — جدول کامل
- [ ] `POST /accounting/{artist_id}/settle/` (فقط admin) — `payment_status → settled`

### گزارش‌های مدیر
- [ ] `GET /reports/subscription-distribution/` — تعداد کاربران هر سطح (محاسبه‌شده در بک‌اند، نه خام)
- [ ] `GET /reports/revenue/` — جمع درآمد ماه جاری از `Transaction`

## فایل‌هایی که باید بسازی

```
backend/platform_ops/models.py
backend/platform_ops/serializers.py
backend/platform_ops/views.py
backend/platform_ops/urls.py
backend/platform_ops/signals.py
backend/platform_ops/services/accounting.py
backend/platform_ops/services/payment_gateway.py     # wrapper روی Zarinpal sandbox
backend/platform_ops/management/commands/generate_monthly_accounting.py
backend/platform_ops/tests/test_tickets.py
backend/platform_ops/tests/test_pricing.py
backend/platform_ops/tests/test_payments.py
```

## نکات مهم

- درگاه پرداخت رو اول با sandbox تست کن (`https://www.zarinpal.com/docs/paymentGateway/sandBox.html`)؛ اگه هر مشکلی پیش اومد طبق مستند پروژه جای نگرانی نیست، جایگزین اعلام می‌شه.
- تمام محاسبات آماری (توزیع اشتراک، درآمد، حسابرسی) باید کامل سمت بک‌اند انجام بشه — طبق تأکید مستند، فرانت‌اند نباید داده‌ی خام بگیره و خودش بشمره.
- بخش امتیازی (پخش‌کننده پیشرفته / پیشنهاددهنده / شنیدار گروهی) رو اگه گروه تصمیم گرفت انجام بده، معمولاً به این اپ یا catalog اضافه می‌شه — روز ۹ در موردش با تیم هماهنگ کن.
