# 📋 راهنمای گام‌به‌گام روز اول (سرگروه)

این فایل رو پرینت بگیر یا کنارت باز نگه دار. هر مرحله رو که انجام دادی تیک بزن.

---

## گام ۱ — ایجاد ریپو در GitHub (~5 دقیقه)

1. برو به [github.com](https://github.com) و وارد حسابت شو
2. گوشه بالا راست، روی **«+»** کلیک کن → **«New repository»**
3. اطلاعات رو پر کن:
   - **Repository name:** `soundwave`
   - **Description:** `سرویس استریم موسیقی - پروژه برنامه‌نویسی وب ۱۴۰۵`
   - **Visibility:** ✅ **Private**
   - ✅ تیک **«Add a README file»** رو بزن
4. روی **«Create repository»** کلیک کن

---

## گام ۲ — نصب Git و Node.js (~10 دقیقه)

**Git:**
- برو به [git-scm.com/download/win](https://git-scm.com/download/win)
- دانلود و نصب کن (همه تنظیمات رو Next بزن)

**Node.js:**
- برو به [nodejs.org](https://nodejs.org)
- نسخه LTS رو دانلود کن (مثلاً 20.x)
- نصب کن

**بعد از نصب، PowerShell رو باز کن و تست کن:**
```
git --version
node --version
npm --version
```
هر سه باید نسخه نشون بدن.

**تنظیم Git:**
```
git config --global user.name "اسمت"
git config --global user.email "ایمیل گیتهابت"
```

---

## گام ۳ — Clone کردن ریپو (~2 دقیقه)

PowerShell رو باز کن:
```bash
cd Desktop
git clone https://github.com/[نام-کاربری-گیتهابت]/soundwave.git
cd soundwave
```

---

## گام ۴ — کپی کردن فایل‌های اولیه (~3 دقیقه)

فایل‌هایی که از Claude گرفتی رو داخل پوشه `soundwave` که clone کردی کپی کن.
ساختار نهایی باید اینطور باشه:

```
soundwave/
├── README.md              (قبلاً بود)
├── .gitignore
├── .env.example
├── docs/
│   ├── git-guide.md
│   ├── conventions.md
│   ├── mock-data-guide.md
│   ├── checklist-member1.md
│   ├── checklist-member2.md
│   ├── checklist-member3.md
│   └── final-checklist.md
└── frontend/              ← پوشه جدید بساز
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── next.config.js
    ├── jest.config.js
    ├── jest.setup.js
    ├── .gitignore
    ├── .env.example
    └── src/
        ├── types/
        │   └── index.ts
        ├── constants/
        │   └── index.ts
        ├── mock/
        │   └── index.ts
        ├── styles/
        │   └── globals.css
        ├── pages/
        │   ├── _app.tsx
        │   └── index.tsx
        ├── components/
        │   ├── ui/
        │   ├── layout/
        │   ├── player/
        │   ├── auth/
        │   ├── playlist/
        │   ├── artist/
        │   └── admin/
        ├── hooks/
        ├── context/
        └── utils/
```

---

## گام ۵ — نصب پکیج‌ها (~3 دقیقه)

```bash
cd frontend
npm install
```

منتظر بمون تا تمام بشه (ممکنه چند دقیقه طول بکشه).

---

## گام ۶ — تست اجرا (~1 دقیقه)

```bash
npm run dev
```

مرورگر رو باز کن و برو به `http://localhost:3000`
باید صفحه‌ی SoundWave با لیست حساب‌های تست رو ببینی.

اگه صفحه رو دیدی ✅ — همه چیز درسته!
برای توقف سرور: `Ctrl + C` رو بزن.

---

## گام ۷ — اولین Commit و Push (~5 دقیقه)

```bash
# برگرد به پوشه اصلی soundwave
cd ..

# همه فایل‌ها رو آماده commit کن
git add .

# commit کن
git commit -m "feat: initial project structure, types, constants, and mock data"

# push کن به main
git push origin main
```

---

## گام ۸ — ایجاد برنچ dev (~1 دقیقه)

```bash
# برنچ dev رو از روی main بساز
git checkout -b dev

# push کن
git push origin dev
```

---

## گام ۹ — دعوت اعضا (~5 دقیقه)

1. توی GitHub، روی ریپو برو
2. تب **«Settings»** رو بزن
3. از منوی چپ، **«Collaborators»** رو انتخاب کن
4. روی **«Add people»** کلیک کن
5. ایمیل یا username GitHub هر نفر رو وارد کن
6. نقش **«Write»** بهشون بده
7. اونا یه ایمیل دعوت می‌گیرن و باید Accept کنن

**بعد بهشون بگو:**
> "ریپو رو accept کنید، بعد فایل `docs/git-guide.md` رو بخونید و clone کنید."

---

## گام ۱۰ — شروع کار خودت (~باقی روز)

```bash
# برو روی dev
git checkout dev

# برنچ کارت رو بساز
git checkout -b feature/auth-pages

# شروع کن به کد زدن!
cd frontend
npm run dev
```

---

## ✅ چک‌لیست پایان روز اول

- [ ] ریپو در GitHub ایجاد شده
- [ ] `git clone` موفق بوده
- [ ] `npm install` بدون خطا انجام شده
- [ ] `npm run dev` صفحه رو نشون می‌ده
- [ ] اولین commit و push انجام شده
- [ ] برنچ `dev` ساخته شده
- [ ] هر دو عضو دیگه دعوت شدن
- [ ] هر دو عضو دیگه clone کردن و `npm run dev` کار می‌کنه
