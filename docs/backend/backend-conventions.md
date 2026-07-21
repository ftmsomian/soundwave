# 📐 قراردادهای کد — بک‌اند SoundWave (Django/DRF)

## نام‌گذاری

| نوع | قرارداد | مثال |
|-----|---------|------|
| اپ جنگو | snake_case, تک‌کلمه‌ای در صورت امکان | `accounts`, `catalog`, `platform_ops` |
| مدل | PascalCase, مفرد | `Song`, `Artist`, `Ticket` |
| فیلد مدل | snake_case | `created_at`, `is_verified` |
| Serializer | `<Model>Serializer` | `SongSerializer` |
| ViewSet / View | `<Model>ViewSet` یا `<Action>View` | `PlaylistViewSet`, `LoginView` |
| Permission class | `Is<Role>` یا `Can<Action>` | `IsArtistOwner`, `CanManageSubscription` |
| URL name | kebab-case | `song-detail`, `artist-approve` |
| Route (endpoint) | جمع، kebab/snake | `/api/songs/`, `/api/artist-requests/` |

## ساختار هر اپ

```
accounts/
├── models.py
├── serializers.py
├── permissions.py
├── views.py           # یا viewsets.py
├── urls.py
├── admin.py
├── signals.py          # برای اعلانات خودکار و ...
├── tests/
│   ├── test_models.py
│   └── test_views.py
└── migrations/
```

## قواعد REST (خیلی مهم برای نمره)

- فقط اندپوینتی بساز که واقعاً استفاده می‌شه. اگه چیزی قابل ویرایش نیست، `PATCH`/`PUT` نساز.
- از `ModelViewSet` فقط وقتی استفاده کن که واقعاً به همه‌ی CRUD نیاز داری؛ در غیر این صورت `GenericAPIView` + mixin دلخواه.
- لیست‌ها همیشه paginate بشن (`PageNumberPagination` مشترک در `core/pagination.py`).
- فیلتر/جستجو/مرتب‌سازی با query param: `?search=...&ordering=-stream_count`.
- کدهای وضعیت درست: `201` برای ساخت، `204` برای حذف، `403` برای دسترسی غیرمجاز (نه `401`، مگر توکن نامعتبر باشه).

## پاسخ خطا (استاندارد مشترک)

همه‌ی اپ‌ها باید از یک فرمت خطا استفاده کنن (در `core/exceptions.py` پیاده‌سازی مشترک):

```json
{
  "error": {
    "code": "PLAYLIST_LIMIT_REACHED",
    "message": "شما به سقف مجاز پلی‌لیست رسیده‌اید.",
    "details": {}
  }
}
```

## دسترسی‌ها (Permission)

- هیچ‌وقت منطق role/subscription رو داخل View copy-paste نکن؛ permission class مشترک در `core/permissions.py` بساز و ازش ارث‌بری کن (`IsOwnerOrReadOnly`, `HasActiveSubscription`, `RoleRequired(['support', 'admin'])`).
- محدودیت‌های سطح اشتراک (تعداد پلی‌لیست، استریم روزانه، دسترسی زودهنگام) باید یک‌جا در `core/subscription_rules.py` تعریف بشه (نه hardcode در چند فایل)، دقیقاً به همون دلیلی که مستند پروژه گفته: تغییر قیمت/محدودیت نباید نیاز به تغییر کد در چند جا داشته باشه.

## Serializer ها

- validation منطقی (مثل چک کردن سقف پلی‌لیست) توی `validate()` سریالایزر یا `perform_create` ویو، نه توی فرانت‌اند.
- از `SerializerMethodField` برای فیلدهای محاسباتی (مثل `unique_listeners`) استفاده کن، هیچ‌وقت این محاسبه رو به فرانت‌اند نسپار.

## Migrations

- بعد از هر تغییر مدل بلافاصله `makemigrations` بزن و توضیح بده (`--name add_subscription_tier`).
- Migration های دستی (data migration) برای seed کردن قیمت پیش‌فرض اشتراک‌ها لازمه (چون قیمت نباید hardcode باشه).

## تست‌نویسی

- حداقل تست برای: احراز هویت، هر permission سفارشی، منطق محدودیت اشتراک، محاسبه‌ی حسابرسی، endpoint های CRUD اصلی.
- از `pytest-django` یا `APITestCase` استفاده کن، نه تست‌های دستی.

## Commit ها (مثل فاز اول)

```
feat(accounts): add JWT login endpoint
fix(catalog): correct daily stream limit check
refactor(platform): extract pricing service
test(accounts): add permission tests
docs(backend): update api-contract
```

## متغیرهای محیطی (`.env`)

هیچ secret ای (کلید درگاه پرداخت، SECRET_KEY) نباید commit بشه. همه چیز از `os.environ` / `django-environ` خونده بشه.
