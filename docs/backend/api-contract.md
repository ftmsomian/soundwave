# 🔗 قرارداد مشترک API — بین هر سه نفر و فرانت‌اند

> این فایل باید هر بار که یک اندپوینت جدید اضافه می‌شه، آپدیت بشه. هدف: جلوگیری از تداخل route و اینکه فرانت‌اند (که خودتون فاز اول زدید) بدونه دقیقاً چی صدا بزنه.

## قواعد کلی

- Base URL: `/api/v1/`
- همه‌ی request/response ها JSON
- Auth: JWT — هدر `Authorization: Bearer <token>`
- Pagination: `?page=1&page_size=20` → پاسخ شامل `{count, next, previous, results}`
- تاریخ‌ها: ISO 8601 (`2026-07-21T10:00:00Z`)
- فایل‌ها (آواتار، کاور، آهنگ): `multipart/form-data`، URL برگشتی همیشه absolute

## نقشه‌ی اندپوینت‌ها بر اساس مسئول

### عضو اول — `accounts`

| متد | مسیر | توضیح |
|-----|------|-------|
| POST | `/api/v1/auth/register/` | ثبت‌نام کاربر عادی |
| POST | `/api/v1/auth/register/artist/` | ثبت‌نام هنرمند (وضعیت pending) |
| POST | `/api/v1/auth/login/` | ورود، برگشت access/refresh token |
| POST | `/api/v1/auth/token/refresh/` | تمدید توکن |
| POST | `/api/v1/auth/forgot-password/` | درخواست بازیابی رمز |
| POST | `/api/v1/auth/reset-password/` | تعیین رمز جدید با توکن ایمیل |
| GET/PATCH | `/api/v1/users/me/` | مشاهده/ویرایش پروفایل خودم |
| GET | `/api/v1/users/{username}/` | مشاهده پروفایل عمومی |
| POST | `/api/v1/users/{username}/follow/` | دنبال کردن / لغو دنبال کردن (toggle) |
| POST | `/api/v1/users/me/avatar/` | آپلود عکس پروفایل (نقره‌ای/طلایی فقط) |
| GET/PATCH | `/api/v1/users/me/settings/` | تنظیمات (زبان، صدا، اعلانات) |
| GET | `/api/v1/artists/{username}/` | نمایه هنرمند + آمار (فقط طلایی آمار کامل می‌بینه) |

### عضو دوم — `catalog`

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/v1/songs/?search=&ordering=&genre=` | جستجو/فیلتر آهنگ‌ها |
| GET | `/api/v1/songs/{id}/` | جزئیات آهنگ |
| POST | `/api/v1/songs/` | ایجاد آهنگ (فقط هنرمند approved) |
| PATCH/DELETE | `/api/v1/songs/{id}/` | ویرایش/حذف (فقط صاحب اثر) |
| POST | `/api/v1/songs/{id}/stream/` | ثبت یک استریم (چک محدودیت روزانه) |
| GET | `/api/v1/albums/` `/api/v1/albums/{id}/` | آلبوم‌ها |
| POST/PATCH/DELETE | `/api/v1/albums/{id}/` | مدیریت آلبوم (هنرمند) |
| GET/POST | `/api/v1/playlists/` | لیست/ساخت پلی‌لیست (چک سقف اشتراک) |
| PATCH/DELETE | `/api/v1/playlists/{id}/` | ویرایش نام/حذف |
| POST/DELETE | `/api/v1/playlists/{id}/songs/{song_id}/` | افزودن/حذف آهنگ از پلی‌لیست |
| GET | `/api/v1/artists/me/works/` | آثار من (هنرمند) + آمار هر اثر |

### عضو سوم — `platform_ops`

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/api/v1/notifications/` | لیست اعلانات من |
| POST | `/api/v1/notifications/{id}/read/` | خوانده شد |
| POST | `/api/v1/notifications/read-all/` | همه خوانده شد |
| DELETE | `/api/v1/notifications/{id}/` | حذف اعلان |
| GET/POST | `/api/v1/tickets/` | لیست تیکت‌های من / ثبت تیکت |
| GET/POST | `/api/v1/tickets/{id}/messages/` | مکالمه‌ی تیکت |
| PATCH | `/api/v1/tickets/{id}/status/` | بستن تیکت (پشتیبان) |
| GET | `/api/v1/artist-requests/?status=pending` | لیست درخواست‌های تأیید هنرمند (پشتیبان/مدیر) |
| POST | `/api/v1/artist-requests/{id}/approve/` | تأیید هنرمند |
| POST | `/api/v1/artist-requests/{id}/reject/` | رد با دلیل |
| GET/PATCH | `/api/v1/pricing/` | مشاهده/تغییر قیمت اشتراک‌ها (فقط مدیر) |
| POST | `/api/v1/subscriptions/purchase/` | خرید/تمدید اشتراک (۱،۳،۶،۱۲ ماهه) → می‌ره به درگاه |
| POST | `/api/v1/payments/callback/` | callback درگاه پرداخت |
| GET | `/api/v1/accounting/monthly/` | جدول حسابرسی هنرمندان (پشتیبان/مدیر) |
| POST | `/api/v1/accounting/{artist_id}/settle/` | تأیید تسویه (فقط مدیر) |
| GET | `/api/v1/reports/subscription-distribution/` | نمودار توزیع اشتراک‌ها (مدیر) |
| GET | `/api/v1/reports/revenue/` | درآمد ماه جاری (مدیر) |

## نکته‌ی هماهنگی مهم

اندپوینت‌های تأیید هنرمند (`artist-requests`) روی مدل `Artist` از اپ `accounts` عملیات می‌کنن، ولی خودِ منطق و View داخل `platform_ops` نوشته می‌شه (چون بخشی از داشبورد پشتیبانی است). یعنی عضو سوم از مدل عضو اول import می‌کنه — پس عضو اول باید فیلد `status`, `rejection_reason` رو زود آماده کنه (روز اول).

مشابهاً، محاسبه‌ی حسابرسی (عضو سوم) به `stream_count` و `unique_listener_count` از مدل `Song` (عضو دوم) نیاز داره — پس مدل `Song` هم باید زود (روز ۲) نهایی بشه.
