# ✅ چک‌لیست عضو دوم (بک‌اند) — اپ `catalog`

## روز ۱ (موازی با عضو اول)

- [ ] با تیم روی ERD نهایی `Song` / `Album` / `Playlist` توافق کن (فیلدها رو از `frontend/src/types/index.ts` بردار — دقیقاً همون‌هایی که فاز اول تعریف کردید تا فرانت‌اند نیاز به تغییر نداشته باشه)
- [ ] مدل‌ها رو با `settings.AUTH_USER_MODEL` (نه import مستقیم از `accounts.models`) به کاربر/هنرمند وصل کن تا وابستگی حلقوی نداشته باشی
- [ ] تا وقتی `User` واقعی از عضو اول پوش نشده، مدل‌ها رو با placeholder بزن و بعدازظهر rebase کن

## مدل‌ها

- [ ] `Genre` (اختیاری، یا صرفاً `CharField` روی Song/Album)
- [ ] `Album(title, artist FK, cover, genre, release_year, created_at)`
- [ ] `Song(title, artist FK, album FK null, cover, audio_file, duration, lyrics, genre, release_year, stream_count, unique_listener_count, is_early_access, created_at)`
- [ ] `Playlist(name, owner FK, songs M2M through PlaylistSong, cover, created_at, updated_at)`
- [ ] `StreamLog(user FK, song FK, created_at)` — برای محاسبه‌ی `unique_listener_count` واقعی و اعمال محدودیت روزانه‌ی رایگان (شمارش استریم امروز)

## اندپوینت‌ها

### آهنگ و آلبوم
- [ ] `GET /songs/?search=&genre=&ordering=-stream_count|-created_at`
- [ ] `GET /songs/{id}/`
- [ ] `POST /songs/` — فقط `artist` با `status=approved` (چک با permission مشترک از عضو اول)
- [ ] `PATCH/DELETE /songs/{id}/` — فقط صاحب اثر
- [ ] `POST /songs/{id}/stream/` — ثبت `StreamLog`، افزایش `stream_count`، اگه کاربر `free` باشه و امروز به ۶۰ استریم رسیده باشه → خطای `403` با کد `DAILY_STREAM_LIMIT_REACHED`
- [ ] `GET/POST /albums/` و `GET/PATCH/DELETE /albums/{id}/`
- [ ] فیلتر `is_early_access`: کاربران غیر gold این آهنگ‌ها رو در لیست نبینن (مگر هنرمندش خودش باشه)

### پلی‌لیست
- [ ] `GET/POST /playlists/` — ساخت با چک سقف (۶ / ۱۰۰ / نامحدود) بر اساس `request.user.subscription` — از `core/subscription_rules.py` (که عضو اول ساخته) استفاده کن، خودت عدد رو hardcode نکن
- [ ] `PATCH/DELETE /playlists/{id}/` — فقط مالک
- [ ] `POST/DELETE /playlists/{id}/songs/{song_id}/` — افزودن/حذف آهنگ

### مدیریت آثار هنرمند
- [ ] `GET /artists/me/works/` — لیست آثار خودم با آمار هر اثر (استریم، شنونده، درآمد تخمینی — درآمد واقعی رو عضو سوم محاسبه می‌کنه، اینجا فقط بخون)
- [ ] آپلود فایل صوتی با فرمت‌های مجاز (`mp3`, `wav`, `flac`) و اعتبارسنجی حجم/فرمت
- [ ] آپلود تصویر کاور (اعتبارسنجی نوع فایل و حجم)

### جستجوی همزمان
- [ ] جستجوی هم‌زمان روی نام اثر و نام هنرمند در یک query param (`?search=`) با `Q(title__icontains=..) | Q(artist__display_name__icontains=..)`

## فایل‌هایی که باید بسازی

```
backend/catalog/models.py             # Album, Song, Playlist, PlaylistSong, StreamLog
backend/catalog/serializers.py
backend/catalog/views.py
backend/catalog/urls.py
backend/catalog/filters.py            # جستجو/فیلتر/مرتب‌سازی
backend/catalog/permissions.py        # IsApprovedArtist, IsPlaylistOwner
backend/catalog/tests/test_songs.py
backend/catalog/tests/test_playlists.py
backend/catalog/tests/test_stream_limit.py
```

## نکات مهم

- محاسبه‌ی `unique_listener_count` نباید از خام کردن داده به فرانت‌اند انجام بشه؛ از `StreamLog.objects.filter(song=...).values('user').distinct().count()` (یا annotate) در بک‌اند حساب کن.
- هیچ منطق محدودیت اشتراکی رو کپی نکن — از تابع/سرویس مشترک استفاده کن تا وقتی مدیر (عضو سوم) قیمت/محدودیت رو عوض کرد، نیازی به تغییر کد اینجا نباشه.
- روز ۶ به بعد رو برای اتصال به فرانت‌اند (چک کردن آدرس‌ها و فرمت response دقیقا با چیزی که در `mock/index.ts` فاز اول استفاده شده) بذار.
