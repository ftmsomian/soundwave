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
