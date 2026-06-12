# 🎵 SoundWave

سرویس استریم موسیقی — پروژه درس برنامه‌سازی وب ۱۴۰۵

دانشگاه صنعتی شریف / دانشکده مهندسی کامپیوتر  
استاد درس: علی ابریشمی

---

## اعضای گروه

| نام | نقش |
|-----|-----|
| عضو اول | - |
| عضو دوم | - |
| عضو سوم | - |

---

## راه‌اندازی پروژه

```bash
git clone https://github.com/ftmsomian/soundwave.git
cd soundwave/frontend
npm install
npm run dev
```

سپس مرورگر را باز کنید و به `http://localhost:3000` بروید.

---

## مستندات

- [راهنمای Git](docs/git-guide.md)
- [قراردادهای کد](docs/conventions.md)
- [راهنمای داده‌های Mock](docs/mock-data-guide.md)

---

## ساختار پروژه

```
soundwave/
├── docs/          ← مستندات و راهنماها
└── frontend/      ← پروژه Next.js
    └── src/
        ├── types/       ← TypeScript interfaces
        ├── constants/   ← ثابت‌ها و config
        ├── mock/        ← داده‌های آزمایشی
        ├── pages/       ← صفحات Next.js
        ├── components/  ← کامپوننت‌ها
        ├── hooks/       ← Custom hooks
        ├── context/     ← React Context
        └── utils/       ← توابع کمکی
```
