# قراردادهای کدنویسی پروژه SoundWave

## نام‌گذاری فایل‌ها

| نوع | فرمت | مثال |
|-----|------|------|
| کامپوننت | PascalCase | `MusicPlayer.tsx` |
| هوک | camelCase با پیشوند use | `useAuth.ts` |
| صفحه | PascalCase | `HomePage.tsx` |
| تایپ | PascalCase | `UserTypes.ts` |
| یوتیلیتی | camelCase | `formatTime.ts` |
| استایل | همنام کامپوننت | `MusicPlayer.module.css` |

## نام‌گذاری متغیرها و توابع

```ts
// متغیر: camelCase
const currentTrack = ...
const isPlaying = ...

// تابع: camelCase فعل + اسم
const handlePlayPause = () => {}
const fetchUserProfile = () => {}

// کامپوننت: PascalCase
const MusicPlayer = () => {}

// تایپ/اینترفیس: PascalCase با پیشوند I برای interface
interface IUser { ... }
type TrackStatus = 'playing' | 'paused' | 'stopped'

// ثابت‌ها: UPPER_SNAKE_CASE
const MAX_PLAYLIST_FREE = 6
const MAX_PLAYLIST_SILVER = 100
```

## ساختار کامپوننت

```tsx
// ۱. ایمپورت‌ها (React اول، بعد لایبراری‌ها، بعد فایل‌های خودمون)
import { useState, useEffect } from 'react'
import { someLib } from 'some-lib'
import { useAuth } from '@/hooks/useAuth'
import type { IUser } from '@/types/UserTypes'

// ۲. تایپ Props
interface Props {
  user: IUser
  onAction: () => void
}

// ۳. کامپوننت
const MyComponent = ({ user, onAction }: Props) => {
  // state ها
  // effect ها
  // handler ها
  // render
  return <div>...</div>
}

export default MyComponent
```

## ساختار فولدر هر فیچر

```
src/
├── components/
│   └── player/
│       ├── MusicPlayer.tsx       ← کامپوننت اصلی
│       ├── PlayerControls.tsx    ← زیرکامپوننت
│       ├── ProgressBar.tsx
│       └── index.ts              ← export همه چیز
├── hooks/
│   └── usePlayer.ts
└── types/
    └── PlayerTypes.ts
```

## Mock Data

همه mock data‌ها در `src/mock/` قرار می‌گیرن و از `localStorage` استفاده می‌کنن:

```ts
// src/mock/mockUsers.ts
export const mockUsers: IUser[] = [...]

// ذخیره در localStorage
localStorage.setItem('sw_users', JSON.stringify(mockUsers))
```

پیشوند همه کلیدهای localStorage: `sw_` (مخفف SoundWave)

## کامنت‌گذاری

```ts
// کامنت کوتاه برای توضیح منطق پیچیده — فارسی یا انگلیسی هر دو قبوله

/**
 * محاسبه درصد پیشرفت آهنگ
 * @param current - ثانیه فعلی
 * @param total - مدت کل آهنگ
 */
const calcProgress = (current: number, total: number): number => {
  return (current / total) * 100
}
```

## Commit Messages

```
feat: add music player controls
fix: resolve playlist limit bug  
refactor: extract PlayerControls component
style: update player UI colors
test: add auth page tests
docs: update conventions guide
```
