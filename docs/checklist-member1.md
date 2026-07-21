# ✅ چک‌لیست نفر اول — صفحات Auth + نمایه کاربر

## وظایف اصلی

### صفحه ورود (`/login`)
- [ ] فرم ورود با ایمیل و رمز عبور
- [ ] validation فرم (فیلد خالی، فرمت ایمیل)
- [ ] لینک «فراموشی رمز عبور»
- [ ] هدایت به صفحه مناسب بر اساس نقش کاربر
- [ ] نمایش خطا در صورت اطلاعات نادرست

### صفحه ثبت‌نام (`/register`)
- [ ] فرم ثبت‌نام کاربر عادی (نام نمایشی، ایمیل، رمز، تاریخ تولد، جنسیت)
- [ ] فرم ثبت‌نام هنرمند (ایمیل، رمز، نام هنری، نمونه‌کار)
- [ ] چک‌باکس پذیرش حریم خصوصی + modal متن سیاست
- [ ] validation همه فیلدها
- [ ] تأیید رمز عبور

### صفحه بازیابی رمز (`/forgot-password`)
- [ ] فرم دریافت ایمیل
- [ ] نمایش پیام موفقیت

### صفحه نمایه کاربر (`/profile/[username]`)
- [ ] نمایش اطلاعات شخصی + عکس پروفایل
- [ ] نمایش نوع اشتراک
- [ ] نمایش تعداد دنبال‌کننده/دنبال‌شونده
- [ ] دکمه دنبال کردن/لغو دنبال
- [ ] دکمه ویرایش (فقط برای خود کاربر)
- [ ] آپلود عکس (فقط نقره‌ای و طلایی)

## فایل‌هایی که باید بسازی

```
src/pages/login.tsx
src/pages/register.tsx
src/pages/forgot-password.tsx
src/pages/profile/[username].tsx
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
src/components/auth/ArtistRegisterForm.tsx
src/context/AuthContext.tsx
src/hooks/useAuth.ts
```

## نکات مهم

- از `useAuth` hook برای مدیریت وضعیت لاگین استفاده کن
- بعد از لاگین، کاربر رو به `/` هدایت کن
- Protected routes: اگه لاگین نیست، به `/login` هدایت کن

---

# 🚀 فاز دوم — بک‌اند (اپ `accounts`)

> این بخش مربوط به فاز دوم پروژه (Django Backend) است. مستند کامل، برنامه‌ی روزانه و قرارداد API در پوشه‌ی [`docs/backend/`](backend/backend-overview.md) قرار دارد؛ اینجا فقط چک‌لیست خلاصه‌ی تو (عضو اول) آورده شده.

## مسئولیت اصلی
راه‌اندازی پروژه‌ی جنگو، مدل `User`/`Artist`، احراز هویت JWT، پروفایل، دنبال کردن، آپلود آواتار و سطوح دسترسی مشترک.

## روز صفر / ساعات اول روز ۱ (حیاتی، همه منتظرتن)
- [ ] راه‌اندازی پروژه‌ی جنگو داخل `backend/`
- [ ] نصب DRF، `djangorestframework-simplejwt`، `django-cors-headers`، `django-environ`، `Pillow`
- [ ] ساخت اپ‌های خالی: `accounts`, `catalog`, `platform_ops`, `core`
- [ ] `AUTH_USER_MODEL = 'accounts.User'` در settings **قبل از اولین migrate**
- [ ] پوش فوری مدل اولیه‌ی `User` به `dev` تا بقیه معطل نمونن
- [ ] ساخت `core/permissions.py`, `core/pagination.py`, `core/exceptions.py` (مشترک بین هر سه نفر)

## وظایف اصلی
- [ ] مدل `Artist` (status: pending/approved/rejected + rejection_reason + portfolio_url + is_verified)
- [ ] مدل `Follow` (follower/following)
- [ ] `POST /auth/register/`, `POST /auth/register/artist/`, `POST /auth/login/`, `POST /auth/token/refresh/`
- [ ] `POST /auth/forgot-password/`, `POST /auth/reset-password/`
- [ ] `GET/PATCH /users/me/`, `GET /users/{username}/`
- [ ] `POST /users/{username}/follow/`
- [ ] `POST /users/me/avatar/` (رد با ۴۰۳ برای اشتراک `free`)
- [ ] `GET /artists/{username}/` (آمار کامل فقط برای بیننده‌ی `gold`)
- [ ] مدل و endpoint `UserSettings` (زبان، صدا، اعلانات) + `DELETE /users/me/`
- [ ] Permission های مشترک: `IsOwnerOrReadOnly`, `RoleRequired`, `HasActiveSubscription`

## فایل‌های لازم
```
backend/accounts/{models,serializers,permissions,views,urls,signals}.py
backend/accounts/tests/{test_auth.py,test_profile.py}
backend/core/{permissions.py,pagination.py,exceptions.py}
```

جزئیات کامل‌تر، مثال کد مدل `User`، و نکات هماهنگی: [docs/backend/checklist-member1-auth-users.md](backend/checklist-member1-auth-users.md)
