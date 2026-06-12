# 📐 قراردادهای کد — SoundWave

## نام‌گذاری فایل‌ها

| نوع | قرارداد | مثال |
|-----|---------|------|
| کامپوننت React | PascalCase | `MusicPlayer.tsx` |
| Hook | camelCase با پیشوند `use` | `usePlayer.ts` |
| Context | PascalCase با پسوند `Context` | `PlayerContext.tsx` |
| Utility | camelCase | `formatDuration.ts` |
| Type/Interface | PascalCase | `User`, `Song` |
| صفحه Next.js | kebab-case | `artist-profile.tsx` |

## نام‌گذاری متغیرها

```ts
// ✅ درست
const currentUser = ...
const isPlaying = ...
const songList = ...

// ❌ اشتباه
const u = ...
const flag = ...
const data = ...
```

## ساختار کامپوننت

```tsx
// ۱. Imports
import React from 'react'

// ۲. Types
interface Props { ... }

// ۳. Component
export default function MyComponent({ prop }: Props) {
  // ۴. Hooks
  // ۵. State
  // ۶. Handlers
  // ۷. Render
  return (...)
}
```

## برنچ‌ها

| پیشوند | کاربرد |
|--------|--------|
| `feature/` | فیچر جدید |
| `fix/` | رفع باگ |
| `style/` | تغییرات ظاهری |
| `refactor/` | بازنویسی |

## Commit ها

```
feat: add login form
fix: resolve player crash on empty queue
style: update sidebar colors
refactor: extract PlayerControls component
test: add auth page tests
docs: update conventions
```

## CSS / Tailwind

- از Tailwind utility classes استفاده کن
- کلاس‌های تکراری رو به کامپوننت تبدیل کن
- از magic number پرهیز کن — از `constants/index.ts` استفاده کن

## TypeScript

- هیچ‌وقت از `any` استفاده نکن
- همه props رو type بزن
- از `interface` برای object types استفاده کن
