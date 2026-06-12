# 🗄️ راهنمای داده‌های Mock

در فاز اول، تمام داده‌ها از فایل `src/mock/index.ts` می‌آیند.

## حساب‌های تست

وقتی پروژه رو اجرا می‌کنی، در صفحه اول لیست این حساب‌ها نمایش داده می‌شه:

| ایمیل | رمز | نقش | اشتراک |
|-------|-----|-----|--------|
| `user.free@test.com` | `test123` | کاربر عادی | پایه (رایگان) |
| `user.silver@test.com` | `test123` | کاربر عادی | نقره‌ای |
| `user.gold@test.com` | `test123` | کاربر عادی | طلایی |
| `artist@test.com` | `test123` | هنرمند | - |
| `support@test.com` | `test123` | پشتیبان | - |
| `admin@test.com` | `test123` | مدیر | - |

## نحوه استفاده

```ts
import { mockUsers, mockSongs, mockArtists, mockPlaylists } from '@/mock'

// در کامپوننت
const songs = mockSongs
```

## افزودن داده جدید

فایل `src/mock/index.ts` رو باز کن و به آرایه مربوطه اضافه کن.  
مطمئن شو که type ها با `src/types/index.ts` تطابق دارن.
