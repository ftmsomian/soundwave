# 🧭 راهنمای کامل Git برای همه اعضای گروه

این راهنما برای همه نوشته شده — چه سرگروه باشی چه عضو تیم. همه چیز رو از صفر توضیح می‌ده.

---

## ۰. Git چیه و چرا لازمه؟

Git یه ابزاره که کمک می‌کنه همه با هم روی یه پروژه کار کنید بدون اینکه فایل‌های همدیگه رو خراب کنید. GitHub هم یه سایته که پروژه رو آنجا نگه می‌داریم تا همه بهش دسترسی داشته باشن.

**مفاهیم مهم:**
- **Repository (ریپو):** خود پروژه با همه تاریخچه‌اش
- **Branch (برنچ):** یه خط موازی از کد که روش کار می‌کنی بدون اینکه کد اصلی رو خراب کنی
- **Commit:** یه «ذخیره» از تغییراتت با یه پیام توضیحی
- **Push:** فرستادن تغییراتت به GitHub
- **Pull:** گرفتن آخرین تغییرات از GitHub
- **Merge:** ادغام دو برنچ با هم

---

## ۱. نصب Git

**ویندوز:**
1. برو به [git-scm.com/download/win](https://git-scm.com/download/win)
2. دانلود و نصب کن (همه چیز رو Next بزن)
3. بعد از نصب، PowerShell یا CMD رو باز کن و تایپ کن:
```bash
git --version
```
اگه یه چیزی مثل `git version 2.x.x` دیدی، نصب موفقه.

**Mac:**
```bash
# اگه Homebrew داری:
brew install git
# وگرنه از همون لینک بالا dmg رو دانلود کن
```

**تنظیم اولیه (یک بار برای همیشه):**
```bash
git config --global user.name "اسمت به انگلیسی"
git config --global user.email "ایمیل گیتهابت"
```

---

## ۲. برای اولین بار — Clone کردن پروژه

**فقط یک بار انجام میدی، روز اول.**

سرگروه لینک ریپو رو برات می‌فرسته. بعد:

```bash
# ۱. یه پوشه مناسب انتخاب کن، مثلاً روی Desktop
cd Desktop

# ۲. پروژه رو دانلود کن (clone)
git clone https://github.com/[نام-سرگروه]/soundwave.git

# ۳. برو داخل پوشه پروژه
cd soundwave

# ۴. برنچ dev رو بگیر
git checkout dev

# ۵. پکیج‌ها رو نصب کن
cd frontend
npm install

# ۶. پروژه رو اجرا کن
npm run dev
```

بعد مرورگر رو باز کن و برو به `http://localhost:3000` — باید صفحه SoundWave رو ببینی.

---

## ۳. هر روز صبح — شروع کار

**قبل از هر بار کد زدن، این رو انجام بده:**

```bash
# ۱. مطمئن شو که روی برنچ dev هستی
git checkout dev

# ۲. آخرین تغییرات بقیه رو بگیر
git pull origin dev

# ۳. برنچ جدید برای کار امروزت بساز
git checkout -b feature/نام-کاری-که-میکنی
```

**مثال:**
```bash
git checkout -b feature/login-page
git checkout -b feature/music-player-controls
git checkout -b fix/playlist-limit-bug
```

> ⚠️ هیچ‌وقت مستقیم روی `dev` یا `main` کار نکن!

---

## ۴. حین کار — ذخیره تغییرات (Commit)

بعد از هر بخش کوچیک که کامل کردی (نه فقط آخر روز!):

```bash
# ۱. ببین چه تغییراتی داری
git status

# ۲. تغییرات رو به «صحنه» اضافه کن
git add .
# یا فقط یه فایل خاص:
git add src/pages/auth/login.tsx

# ۳. ذخیره کن با یه پیام مناسب
git commit -m "feat: add login form with validation"
```

**فرمت پیام commit:**

| پیشوند | کاربرد | مثال |
|--------|--------|------|
| `feat:` | اضافه کردن چیز جدید | `feat: add music player controls` |
| `fix:` | رفع باگ | `fix: resolve playlist limit bug` |
| `style:` | تغییر ظاهر بدون تغییر منطق | `style: update player button colors` |
| `refactor:` | بازنویسی کد بدون تغییر رفتار | `refactor: extract PlayerControls component` |
| `test:` | اضافه کردن تست | `test: add auth page tests` |
| `docs:` | تغییر مستندات | `docs: update git guide` |

---

## ۵. آخر روز — فرستادن تغییرات به GitHub

```bash
# Push کردن برنچت به GitHub
git push origin feature/login-page
```

اگه اولین باره این برنچ رو push می‌کنی، ممکنه بخواد authentication انجام بدی — یه بار توی مرورگر لاگین GitHub کافیه.

---

## ۶. وقتی یه بخش کامل شد — Pull Request

بعد از اینکه کارت رو کامل کردی و push کردی:

1. برو به `github.com/[نام-سرگروه]/soundwave`
2. یه بنر زرد می‌بینی: **«Compare & pull request»** — کلیک کن
3. مطمئن شو:
   - **base:** `dev` باشه (نه main!)
   - **compare:** برنچ خودت باشه
4. یه توضیح کوتاه بنویس که چی ساختی
5. **«Create pull request»** بزن
6. به سرگروه خبر بده که PR داری

> سرگروه Review می‌کنه و Merge می‌کنه.

---

## ۷. بعد از Merge — تمیز کردن

بعد از اینکه PR ات Merge شد:

```bash
# برگرد به dev
git checkout dev

# آخرین تغییرات (شامل کار خودت) رو بگیر
git pull origin dev

# برنچ قدیمی رو حذف کن (اختیاری ولی خوبه)
git branch -d feature/login-page
```

---

## ۸. اگه با تغییرات کسی دیگه تداخل داشتی (Conflict)

گاهی وقتا دو نفر روی یه خط از یه فایل کار کردن. Git نمی‌دونه کدوم رو نگه داره:

```bash
# وقتی git pull می‌زنی و conflict میاد:
git pull origin dev

# فایل‌هایی که conflict دارن رو VS Code نشون می‌ده
# توی فایل می‌بینی:
# <<<<<<< HEAD
# کد خودت
# =======
# کد دیگری
# >>>>>>> dev
```

**راه‌حل:** فایل رو باز کن، هر دو بخش رو بخون، نسخه درست رو نگه دار، اون خطوط `<<<<`, `====`, `>>>>` رو حذف کن، بعد:

```bash
git add .
git commit -m "fix: resolve merge conflict in PlayerComponent"
```

---

## ۹. دستورات پرکاربرد (Reference سریع)

```bash
# وضعیت فعلی
git status

# تاریخچه commit‌ها
git log --oneline

# فرق تغییرات نذاشته
git diff

# دیدن همه برنچ‌ها
git branch -a

# رفتن به برنچ دیگه
git checkout نام-برنچ

# ساخت برنچ جدید
git checkout -b نام-برنچ-جدید

# آخرین تغییرات رو بگیر
git pull origin dev

# undo کردن آخرین commit (ولی تغییرات فایل‌ها می‌مونه)
git reset --soft HEAD~1
```

---

## ۱۰. ساختار برنچ‌های پروژه

```
main          ← کد نهایی تأیید شده (فقط سرگروه merge می‌کنه)
  └── dev     ← همه فیچرها اینجا ادغام می‌شن
        ├── feature/auth-pages        (نفر اول)
        ├── feature/home-playlist     (نفر دوم)
        └── feature/music-player      (نفر سوم)
```

---

## ۱۱. قوانین گروه

1. ✅ همیشه از یه برنچ جداگانه استفاده کن
2. ✅ هر روز صبح `git pull origin dev` بزن
3. ✅ commit‌های کوچیک و مکرر (بعد از هر بخش)
4. ❌ هیچ‌وقت مستقیم به `dev` یا `main` push نکن
5. ❌ هیچ‌وقت `git push --force` نزن
6. ❌ فایل `node_modules` رو commit نکن (gitignore هست)

---

## ۱۲. اگه گیر کردی

اول این دستور رو بزن:
```bash
git status
```
۹۰٪ مشکلات با خوندن خروجی این دستور حل می‌شه.

بعد به سرگروه پیام بده یا توی گروه بپرس. **هیچ‌وقت تنها تصمیم نگیر وقتی مطمئن نیستی** — بهتره یه نفر بپرسی تا اینکه کد بقیه رو خراب کنی.
