# ✅ چک‌لیست عضو اول (بک‌اند) — اپ `accounts`

## روز صفر / ساعات اول روز ۱ (حیاتی، همه منتظرتن)

- [ ] راه‌اندازی پروژه‌ی جنگو (`django-admin startproject config .`) داخل پوشه‌ی `backend/`
- [ ] نصب و تنظیم DRF، `django-environ`، `djangorestframework-simplejwt`، `django-cors-headers`, `Pillow`
- [ ] ساخت اپ‌های خالی: `accounts`, `catalog`, `platform_ops`, `core`
- [ ] تعریف `AUTH_USER_MODEL = 'accounts.User'` در settings **قبل از اولین migrate**
- [ ] نوشتن مدل اولیه‌ی `User` (فیلدهای پایه‌ای که بقیه بهش نیاز دارن) و **پوش فوری به `dev`**:

```python
class User(AbstractUser):
    ROLE_CHOICES = [('user','user'),('artist','artist'),('support','support'),('admin','admin')]
    TIER_CHOICES = [('free','free'),('silver','silver'),('gold','gold')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    subscription = models.CharField(max_length=10, choices=TIER_CHOICES, default='free')
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    display_name = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

- [ ] اعلام در گروه که `dev` آماده‌ست تا عضو دوم و سوم بتونن FK بزنن.
- [ ] `core/permissions.py` و `core/pagination.py` و `core/exceptions.py` رو طبق [قراردادهای بک‌اند](backend-conventions.md) بساز (مشترکه، بقیه هم ازش استفاده می‌کنن).

## وظایف اصلی (روزهای ۱ تا ۶)

### مدل `Artist` (extends/relates to User)
- [ ] مدل `Artist` (یا فیلدهای اضافه روی `User` با `OneToOneField`): `artist_name`, `status (pending/approved/rejected)`, `rejection_reason`, `portfolio_url`, `is_verified`
- [ ] مدل `Follow` (`follower`, `following`, `created_at`) برای دنبال کردن کاربر/هنرمند

### احراز هویت (JWT)
- [ ] `POST /auth/register/` — ثبت‌نام کاربر عادی (validation: تکرار رمز، ایمیل یکتا، سن منطقی)
- [ ] `POST /auth/register/artist/` — ثبت‌نام هنرمند → `status=pending` + ارسال سیگنال برای اعلان به پشتیبانی (عضو سوم گوش میده)
- [ ] `POST /auth/login/` (SimpleJWT) — برگرداندن access/refresh + نقش کاربر
- [ ] `POST /auth/token/refresh/`
- [ ] `POST /auth/forgot-password/` + `POST /auth/reset-password/` (ارسال ایمیل با token، حتی اگه فقط لاگ کنسول باشه در dev)

### پروفایل
- [ ] `GET/PATCH /users/me/` — مشاهده و ویرایش پروفایل خودم
- [ ] `GET /users/{username}/` — پروفایل عمومی + شمارش دنبال‌کننده/شونده
- [ ] `POST /users/{username}/follow/` — toggle دنبال کردن
- [ ] `POST /users/me/avatar/` — آپلود آواتار، **رد کردن با ۴۰۳ اگه `subscription == 'free'`**
- [ ] `GET /artists/{username}/` — نمایه هنرمند، آمار کامل (`total_streams`, `unique_listeners`) فقط اگه بیننده `gold` باشه

### تنظیمات (Sync بین دستگاه‌ها)
- [ ] مدل `UserSettings` (`notification_prefs` JSONField، `language`، `sound_volume` یا مشابه)
- [ ] `GET/PATCH /users/me/settings/`
- [ ] `DELETE /users/me/` — حذف حساب کاربری

### دسترسی‌ها (Permissions مشترک، در `core`)
- [ ] `IsOwnerOrReadOnly`
- [ ] `RoleRequired(*roles)`
- [ ] `HasActiveSubscription(min_tier)`
- [ ] اطمینان از این‌که هیچ کاربری به منابع کاربر هم‌سطح یا بالاتر دسترسی نداره (تست بنویس!)

## فایل‌هایی که باید بسازی

```
backend/accounts/models.py            # User, Artist, Follow, UserSettings
backend/accounts/serializers.py
backend/accounts/permissions.py       # یا core/permissions.py مشترک
backend/accounts/views.py
backend/accounts/urls.py
backend/accounts/signals.py           # سیگنال ثبت‌نام هنرمند → اعلان
backend/accounts/tests/test_auth.py
backend/accounts/tests/test_profile.py
backend/core/permissions.py
backend/core/pagination.py
backend/core/exceptions.py
```

## نکات مهم

- بدون اجازه‌ی گروه مدل `User` رو بعد از روز ۲ تغییر ساختاری نده (بقیه FK زدن).
- محدودیت آپلود آواتار برای اشتراک پایه باید دقیقاً طبق جدول مزایا باشه — منبع حقیقت این محدودیت باید `core/subscription_rules.py` باشه، نه if/else پراکنده.
- روز ۷ تا ۸ رو برای هماهنگی با فرانت‌اند (تغییر مسیرها/فرمت response در صورت نیاز) نگه دار.
