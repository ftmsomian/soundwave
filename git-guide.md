# 🚀 راهنمای ایجاد ریپو و شروع کار

## مرحله ۱: ایجاد ریپو در GitHub

1. به [github.com](https://github.com) برو و وارد حسابت شو
2. روی دکمه سبز **«New»** در بالای صفحه کلیک کن
3. اطلاعات رو پر کن:
   - **Repository name:** `soundwave`
   - **Description:** `سرویس استریم موسیقی - پروژه برنامه‌نویسی وب بهار ۱۴۰۵`
   - **Visibility:** Private
   - ✅ **Add a README file** رو تیک بزن
4. روی **«Create repository»** کلیک کن

---

## مرحله ۲: Git را روی کامپیوترت نصب کن

**ویندوز:** از [git-scm.com](https://git-scm.com/download/win) دانلود و نصب کن

بعد از نصب، یه بار این دستورات رو در CMD یا PowerShell اجرا کن:
```
git config --global user.name "اسمت"
git config --global user.email "ایمیلت"
```

---

## مرحله ۳: Clone کردن ریپو

```bash
git clone https://github.com/[نام-کاربری-گیتهابت]/soundwave.git
cd soundwave
```

---

## مرحله ۴: آپلود فایل‌های اولیه

فایل‌های این پوشه (`soundwave-project`) رو داخل پوشه clone شده کپی کن، بعد:

```bash
git add .
git commit -m "feat: initial project structure and docs"
git push origin main
```

---

## مرحله ۵: ایجاد برنچ dev

```bash
git checkout -b dev
git push origin dev
```

---

## مرحله ۶: دعوت اعضا

1. در ریپو، روی تب **«Settings»** کلیک کن
2. از سایدبار، **«Collaborators»** رو انتخاب کن
3. روی **«Add people»** کلیک کن
4. ایمیل یا username گیتهاب هر نفر رو وارد کن
5. نقش **«Write»** بهشون بده

**اعضا باید:**
- ایمیلی که دریافت می‌کنند رو accept کنند
- ریپو رو clone کنند:
  ```bash
  git clone https://github.com/[نام-کاربری-تو]/soundwave.git
  ```

---

## مرحله ۷: شروع کار روی یه فیچر (برای همه اعضا)

```bash
# ۱. مطمئن شو روی dev هستی و آخرین تغییرات رو داری
git checkout dev
git pull origin dev

# ۲. برنچ جدید برای کارت بساز
git checkout -b feature/auth-pages   # نفر اول
git checkout -b feature/home-playlist   # نفر دوم
git checkout -b feature/music-player   # نفر سوم

# ۳. کارت رو انجام بده، بعد:
git add .
git commit -m "feat: add login page"

# ۴. push کن
git push origin feature/auth-pages
```

---

## مرحله ۸: ادغام کار (Pull Request)

1. در GitHub، بعد از push، یه بنر زرد می‌بینی: **«Compare & pull request»** - کلیک کن
2. مطمئن شو base برنچ **`dev`** هست (نه `main`)
3. یه توضیح کوتاه بنویس
4. **«Create pull request»** رو بزن
5. یه نفر دیگه از گروه review و approve کنه
6. بعد **«Merge»** کن

---

## دستورات پرکاربرد

```bash
git status              # ببین چه تغییراتی داری
git pull origin dev     # آخرین تغییرات dev رو بگیر
git log --oneline       # تاریخچه commit‌ها
git diff                # تفاوت تغییرات
```

---

## ⚠️ قوانین مهم

1. **هیچ‌وقت** مستقیم به `main` یا `dev` push نکن
2. همیشه از برنچ جداگانه استفاده کن
3. قبل از شروع هر روز، `git pull origin dev` بزن
4. commit‌های کوچک و مکرر بهتر از یه commit بزرگ هست
