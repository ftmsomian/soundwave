# ✅ چک‌لیست نفر سوم — Music Player + صفحه هنرمند + داشبورد مدیریت

## وظایف اصلی

### پخش‌کننده موسیقی (کامپوننت جهانی)
- [ ] نوار ثابت پایین صفحه (دسکتاپ)
- [ ] Mini player در موبایل + تمام‌صفحه
- [ ] Progress bar با قابلیت جابجایی
- [ ] دکمه‌های پخش، توقف، بعدی، قبلی
- [ ] کنترل صدا (volume slider)
- [ ] حالت تکرار (بدون تکرار / تکرار لیست / تکرار آهنگ)
- [ ] حالت shuffle
- [ ] نمایش صف پخش (Queue)
- [ ] نمایش کاور، نام آهنگ، نام هنرمند
- [ ] نمایش متن آهنگ (lyrics) اگر موجود باشه
- [ ] آمار شنونده/استریم فقط برای کاربران طلایی

### صفحه نمایه هنرمند (`/artist/[id]`)
- [ ] بیوگرافی هنرمند
- [ ] نشان «هنرمند تأییدشده» (برای تأیید‌شده‌ها)
- [ ] لیست آلبوم‌ها و تک‌آهنگ‌ها
- [ ] دکمه دنبال کردن/لغو
- [ ] آمار کلی شنوندگان (فقط برای کاربران طلایی)

### مدیریت آثار هنرمند (`/artist/manage`)
- [ ] آپلود تک‌آهنگ یا آلبوم
- [ ] فرم اطلاعات (نام، ژانر، سال، هنرمندان همکار)
- [ ] آپلود کاور
- [ ] درج متن آهنگ
- [ ] لیست آثار منتشرشده با آمار
- [ ] ویرایش/حذف آثار

### داشبورد پشتیبان و مدیر (`/admin`)
- [ ] Sidebar اختصاصی با بخش‌های مختلف
- [ ] تب تأیید هنرمندان (جدول + approve/reject)
- [ ] تب تیکت‌های پشتیبانی (جدول + صفحه چت)
- [ ] جدول حسابرسی ماهانه هنرمندان (فقط مدیر)
- [ ] پنل تغییر قیمت اشتراک‌ها (فقط مدیر)
- [ ] نمودار توزیع اشتراک‌ها (pie chart، فقط مدیر)

### تنظیمات (`/settings`)
- [ ] تنظیمات اعلان‌ها
- [ ] تغییر صدای سامانه
- [ ] تغییر زبان
- [ ] نمایش نوع اشتراک + لینک ارتقا
- [ ] گزینه حذف حساب

## فایل‌هایی که باید بسازی

```
src/pages/artist/[id].tsx
src/pages/artist/manage.tsx
src/pages/admin/index.tsx
src/pages/settings.tsx
src/components/player/MusicPlayer.tsx
src/components/player/ProgressBar.tsx
src/components/player/VolumeControl.tsx
src/components/player/Queue.tsx
src/components/admin/ArtistApprovalTable.tsx
src/components/admin/TicketList.tsx
src/components/admin/AccountingTable.tsx
src/components/admin/PricingPanel.tsx
src/context/PlayerContext.tsx
src/hooks/usePlayer.ts
```

---

# 🚀 فاز دوم — بک‌اند (اپ `platform_ops`)

> مستند کامل در [`docs/backend/checklist-member3-platform-payments.md`](backend/checklist-member3-platform-payments.md). خلاصه‌ی خودت اینجاست.

## مسئولیت اصلی
اعلانات، تیکت‌ها و تأیید هنرمندان، قیمت‌گذاری پویا، درگاه پرداخت، حسابرسی و پاداش هنرمندان.

## روز ۱ (موازی)
- [ ] توافق ERD `Notification`/`Ticket`/`SubscriptionPricing`/`Transaction`/`MonthlyAccounting`
- [ ] مدل‌ها با `settings.AUTH_USER_MODEL`؛ برای FK به `Artist`/`Song` placeholder بذار تا مدل‌های عضو ۱ و ۲ نهایی بشن

## مدل‌ها
- [ ] `Notification(user, type, title, message, is_read, link, created_at)`
- [ ] `Ticket` + `TicketMessage`
- [ ] `SubscriptionPricing(silver_price, gold_price)` — بدون هیچ عدد hardcode
- [ ] `Transaction(user, tier, duration_months, amount, status, gateway_ref, created_at)`
- [ ] `MonthlyAccounting(artist, month, unique_listeners, total_streams, earnings, payment_status)`

## اندپوینت‌ها
- [ ] `GET /notifications/`, `POST /notifications/{id}/read/`, `POST /notifications/read-all/`, `DELETE /notifications/{id}/`
- [ ] سیگنال‌های خودکار اعلان: ثبت‌نام هنرمند، تأیید/رد، اثر جدید، انقضای اشتراک، حسابرسی ماهانه، تیکت جدید
- [ ] `GET/POST /tickets/`, `GET/POST /tickets/{id}/messages/`, `PATCH /tickets/{id}/status/`
- [ ] `GET /artist-requests/?status=pending`, `POST /artist-requests/{id}/approve/`, `POST /artist-requests/{id}/reject/`
- [ ] `GET/PATCH /pricing/` (فقط admin)
- [ ] `POST /subscriptions/purchase/` + `POST /payments/callback/` (Zarinpal sandbox)
- [ ] management command ماهانه برای ساخت `MonthlyAccounting` از داده‌های `catalog.StreamLog`
- [ ] `GET /accounting/monthly/`, `POST /accounting/{artist_id}/settle/`
- [ ] `GET /reports/subscription-distribution/`, `GET /reports/revenue/`

## فایل‌های لازم
```
backend/platform_ops/{models,serializers,views,urls,signals}.py
backend/platform_ops/services/{accounting.py,payment_gateway.py}
backend/platform_ops/management/commands/generate_monthly_accounting.py
backend/platform_ops/tests/{test_tickets.py,test_pricing.py,test_payments.py}
```

جزئیات کامل: [docs/backend/checklist-member3-platform-payments.md](backend/checklist-member3-platform-payments.md)
