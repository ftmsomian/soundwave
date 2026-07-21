# ✅ چک‌لیست نفر دوم — صفحه خانه + پلی‌لیست‌ها + آلبوم‌ها

## وظایف اصلی

### صفحه خانه (`/`)
- [ ] نمایش نام و عکس کاربر در بالا
- [ ] بخش «آخرین پلی‌لیست‌های شنیده‌شده»
- [ ] بخش «آخرین آلبوم‌های منتشر شده»
- [ ] بخش «آهنگ‌های پرشنونده»
- [ ] بخش «دسترسی زودهنگام» فقط برای کاربران طلایی
- [ ] Sidebar با لینک به صفحات مختلف

### صفحه پلی‌لیست‌ها (`/playlists`)
- [ ] لیست پلی‌لیست‌های کاربر
- [ ] دکمه ایجاد پلی‌لیست جدید
- [ ] اعمال محدودیت بر اساس اشتراک (۶/۱۰۰/نامحدود)
- [ ] حذف و تغییر نام پلی‌لیست
- [ ] Empty state برای کاربران بدون پلی‌لیست
- [ ] نمایش آهنگ‌های داخل پلی‌لیست

### صفحه آلبوم‌ها و تک‌آهنگ‌ها (`/music`)
- [ ] جستجو بر اساس نام اثر یا هنرمند
- [ ] فیلتر مرتب‌سازی (تعداد شنونده / تاریخ انتشار)
- [ ] کارت آلبوم (کاور، نام، هنرمند)
- [ ] کارت تک‌آهنگ (کاور، نام، هنرمند، آلبوم)
- [ ] منوی افزودن به پلی‌لیست روی هر کارت
- [ ] صفحه جزئیات آلبوم (`/album/[id]`)

### اعلانات (`/notifications`)
- [ ] لیست اعلانات با تفکیک خوانده/نخوانده
- [ ] دکمه «خواندن همه»
- [ ] دکمه حذف هر اعلان
- [ ] Empty state

## فایل‌هایی که باید بسازی

```
src/pages/index.tsx
src/pages/playlists.tsx
src/pages/music.tsx
src/pages/album/[id].tsx
src/pages/notifications.tsx
src/components/layout/Sidebar.tsx
src/components/layout/MainLayout.tsx
src/components/playlist/PlaylistCard.tsx
src/components/playlist/CreatePlaylistModal.tsx
src/components/artist/SongCard.tsx
src/components/artist/AlbumCard.tsx
src/context/PlaylistContext.tsx
src/hooks/usePlaylists.ts
```

---

# 🚀 فاز دوم — بک‌اند (اپ `catalog`)

> مستند کامل در [`docs/backend/checklist-member2-catalog.md`](backend/checklist-member2-catalog.md). خلاصه‌ی خودت اینجاست.

## مسئولیت اصلی
مدل و CRUD آهنگ/آلبوم/پلی‌لیست، آپلود فایل صوتی و کاور، جستجو/فیلتر، استریم و محدودیت‌های اشتراک، مدیریت آثار هنرمند.

## روز ۱ (موازی با عضو اول)
- [ ] توافق روی ERD نهایی `Song`/`Album`/`Playlist` (فیلدها از `frontend/src/types/index.ts`)
- [ ] ساخت مدل‌ها با `settings.AUTH_USER_MODEL` (نه import مستقیم)
- [ ] بعدازظهر که `User` واقعی پوش شد، rebase کن

## مدل‌ها
- [ ] `Album(title, artist FK, cover, genre, release_year, created_at)`
- [ ] `Song(title, artist FK, album FK null, cover, audio_file, duration, lyrics, genre, release_year, stream_count, unique_listener_count, is_early_access, created_at)`
- [ ] `Playlist(name, owner FK, songs M2M through PlaylistSong, cover, created_at, updated_at)`
- [ ] `StreamLog(user FK, song FK, created_at)` — برای شمارش واقعی شنوندگان یکتا و محدودیت روزانه

## اندپوینت‌ها
- [ ] `GET /songs/?search=&genre=&ordering=` و `GET/POST/PATCH/DELETE /songs/{id}/`
- [ ] `POST /songs/{id}/stream/` (چک محدودیت ۶۰ استریم روزانه‌ی `free`)
- [ ] `GET/POST/PATCH/DELETE /albums/...`
- [ ] فیلتر `is_early_access` برای غیر gold
- [ ] `GET/POST /playlists/` با چک سقف (۶/۱۰۰/نامحدود) از `core/subscription_rules.py`
- [ ] `PATCH/DELETE /playlists/{id}/`, `POST/DELETE /playlists/{id}/songs/{song_id}/`
- [ ] `GET /artists/me/works/` با آمار هر اثر
- [ ] آپلود صوت (`mp3/wav/flac`) و کاور با اعتبارسنجی فرمت/حجم

## فایل‌های لازم
```
backend/catalog/{models,serializers,views,urls,filters,permissions}.py
backend/catalog/tests/{test_songs.py,test_playlists.py,test_stream_limit.py}
```

جزئیات کامل: [docs/backend/checklist-member2-catalog.md](backend/checklist-member2-catalog.md)
