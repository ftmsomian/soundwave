# 🎵 SoundWave — پروژه درس برنامه‌نویسی وب

> سرویس استریم موسیقی | دانشگاه صنعتی شریف | بهار ۱۴۰۵

## 👥 اعضای گروه

| نقش | نام | مسئولیت اصلی |
|-----|-----|-------------|
| عضو اول | فاطمه معصومیان | Auth + پروفایل + داشبورد مدیریت |
| عضو دوم | فاطمه جعفرزاده | خانه + پلی‌لیست + آلبوم/آهنگ + مدیریت آثار |
| عضو سوم | فاطمه ملایی | پخش‌کننده موسیقی + بخش امتیازی |

## 🗂 ساختار ریپو

```
/
├── frontend/          ← پروژه React/Next.js (فاز اول)
├── backend/           ← پروژه Django + DRF (فاز دوم)
├── docs/              ← مستندات و چک‌لیست‌ها
│   └── backend/       ← مستندات کامل فاز دوم (تقسیم‌بندی، برنامه ۹ روزه، قرارداد API)
└── .github/           ← Issue templates
```

## 🚀 شروع سریع

### فرانت‌اند
```bash
cd frontend
npm install
npm run dev
```

### بک‌اند
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## 📋 لینک‌های مهم — فاز اول (فرانت‌اند)

- [چک‌لیست نفر اول](docs/checklist-member1.md)
- [چک‌لیست نفر دوم](docs/checklist-member2.md)
- [چک‌لیست نفر سوم](docs/checklist-member3.md)
- [چک‌لیست نهایی پروژه](docs/final-checklist.md)
- [قراردادهای کدنویسی](docs/conventions.md)
- [ساختار Mock Data](docs/mock-data-guide.md)

## 📋 لینک‌های مهم — فاز دوم (بک‌اند)

- [معرفی کلی فاز دوم و تقسیم‌بندی](docs/backend/backend-overview.md)
- [چک‌لیست عضو اول — accounts](docs/backend/checklist-member1-auth-users.md)
- [چک‌لیست عضو دوم — catalog](docs/backend/checklist-member2-catalog.md)
- [چک‌لیست عضو سوم — platform_ops](docs/backend/checklist-member3-platform-payments.md)
- [قرارداد مشترک API](docs/backend/api-contract.md)
- [قراردادهای کدنویسی بک‌اند](docs/backend/backend-conventions.md)
- [برنامه‌ی روز به روز ۹ روزه](docs/backend/9-day-schedule.md)
- [چک‌لیست نهایی فاز دوم](docs/backend/final-checklist-backend.md)

## 🌿 قراردادهای برنچ

| نوع | فرمت | مثال |
|-----|------|------|
| فیچر | `feature/نام-فیچر` | `feature/auth-pages` |
| باگ‌فیکس | `fix/نام-باگ` | `fix/player-skip-bug` |
| بهبود | `refactor/نام` | `refactor/playlist-component` |

**برنچ اصلی:** `main` (فقط کد تست‌شده)  
**برنچ توسعه:** `dev` (ادغام فیچرها اینجا)

## ✅ قوانین Pull Request

1. هر PR باید به برنچ `dev` باشه، نه `main`
2. حداقل یه نفر دیگه باید Review کنه
3. تست‌ها باید پاس بشن
4. توضیح کوتاه از تغییرات الزامیه
