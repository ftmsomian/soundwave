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

---

# 🚀 قراردادهای فاز دوم (بک‌اند Django/DRF)

مستند کامل: [docs/backend/backend-conventions.md](backend/backend-conventions.md)

## خلاصه
| نوع | قرارداد | مثال |
|-----|---------|------|
| اپ جنگو | snake_case | `accounts`, `catalog`, `platform_ops` |
| مدل | PascalCase مفرد | `Song`, `Artist`, `Ticket` |
| فیلد مدل | snake_case | `created_at`, `is_verified` |
| Serializer | `<Model>Serializer` | `SongSerializer` |
| Permission | `Is<Role>` / `Can<Action>` | `IsArtistOwner` |
| Route | جمع | `/api/v1/songs/` |

- منطق role/subscription همیشه از `core/permissions.py` و `core/subscription_rules.py` — هیچ‌وقت کپی/hardcode نکن.
- فرمت خطای مشترک:
```json
{"error": {"code": "PLAYLIST_LIMIT_REACHED", "message": "...", "details": {}}}
```
- Commit ها: `feat(accounts): ...`, `fix(catalog): ...`, `refactor(platform): ...`, `test(accounts): ...`, `docs(backend): ...`
- برنچ‌های بک‌اند: `backend/<username>-<app>` (مثال: `backend/maani-accounts`)
