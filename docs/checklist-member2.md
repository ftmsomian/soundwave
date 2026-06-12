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
