import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { STORAGE_KEYS, ROUTES } from '@/constants'
import { getFromStorage, setToStorage } from '@/mock'
import type { User, Gender } from '@/types'

function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] border border-[#282828] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-white mb-4">سیاست حریم خصوصی</h2>
        <div className="text-sm text-[#B3B3B3] space-y-3 leading-relaxed">
          <p>سرویس SoundWave متعهد به حفاظت از اطلاعات شخصی شما است.</p>
          <p>اطلاعاتی که جمع‌آوری می‌کنیم شامل ایمیل، نام نمایشی، تاریخ تولد و جنسیت می‌باشد.</p>
          <p>این اطلاعات صرفاً برای بهبود تجربه کاربری شما استفاده می‌شود و به هیچ شخص ثالثی منتقل نمی‌شود.</p>
          <p>شما می‌توانید در هر زمان درخواست حذف حساب کاربری خود را از طریق تنظیمات برنامه ارسال کنید.</p>
          <p>با ثبت‌نام، شما موافقت خود را با این سیاست اعلام می‌کنید.</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full btn-primary"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const [showPrivacy, setShowPrivacy] = useState(false)

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '' as Gender | '',
    acceptPrivacy: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.displayName.trim())                          e.displayName     = 'نام نمایشی الزامی است'
    if (!form.email.trim())                               e.email           = 'ایمیل الزامی است'
    else if (!/\S+@\S+\.\S+/.test(form.email))           e.email           = 'فرمت ایمیل نادرست است'
    if (!form.password)                                   e.password        = 'رمز عبور الزامی است'
    else if (form.password.length < 6)                    e.password        = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    if (form.password !== form.confirmPassword)           e.confirmPassword = 'رمزها یکسان نیستند'
    if (!form.birthDate)                                  e.birthDate       = 'تاریخ تولد الزامی است'
    if (!form.gender)                                     e.gender          = 'جنسیت الزامی است'
    if (!form.acceptPrivacy)                              e.acceptPrivacy   = 'پذیرش حریم خصوصی الزامی است'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    await new Promise(r => setTimeout(r, 400))

    const existing = getFromStorage<User>(STORAGE_KEYS.USERS)
    if (existing.find(u => u.email === form.email)) {
      setErrors({ email: 'این ایمیل قبلاً ثبت شده است' })
      setIsLoading(false)
      return
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: `user_${Math.floor(Math.random() * 90000) + 10000}`,
      displayName: form.displayName,
      email: form.email,
      passwordHash: form.password,
      role: 'user',
      subscription: 'free',
      birthDate: form.birthDate,
      gender: form.gender as Gender,
      followersCount: 0,
      followingCount: 0,
      dailyStreamCount: 0,
      createdAt: new Date().toISOString(),
    }

    setToStorage(STORAGE_KEYS.USERS, [...existing, newUser])
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser))

    setIsLoading(false)
    router.push(ROUTES.home)
  }

  const inputClass = (field: string) =>
    `w-full bg-[#3E3E3E] border rounded-lg px-4 py-3 text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-colors ${
      errors[field] ? 'border-red-500' : 'border-[#535353]'
    }`

  return (
    <>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1DB954]">🎵 SoundWave</h1>
            <p className="text-[#B3B3B3] mt-2 text-sm">ثبت‌نام کاربر</p>
          </div>

          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm text-[#B3B3B3] mb-1">نام نمایشی</label>
                <input type="text" value={form.displayName} onChange={e => set('displayName', e.target.value)}
                  placeholder="مثلاً: علی رضایی" className={inputClass('displayName')} />
                {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-1">ایمیل</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="example@email.com" className={inputClass('email')} dir="ltr" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-1">رمز عبور</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="حداقل ۶ کاراکتر" className={inputClass('password')} />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-1">تأیید رمز عبور</label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="رمز عبور را تکرار کنید" className={inputClass('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-1">تاریخ تولد</label>
                <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)}
                  className={inputClass('birthDate')} dir="ltr" />
                {errors.birthDate && <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-1">جنسیت</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputClass('gender')}>
                  <option value="">انتخاب کنید</option>
                  <option value="male">مرد</option>
                  <option value="female">زن</option>
                  <option value="other">ترجیح می‌دهم نگویم</option>
                </select>
                {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
              </div>

              <div className="flex items-start gap-3">
                <input id="privacy" type="checkbox" checked={form.acceptPrivacy}
                  onChange={e => set('acceptPrivacy', e.target.checked)}
                  className="mt-1 accent-[#1DB954]" />
                <label htmlFor="privacy" className="text-sm text-[#B3B3B3]">
                  با{' '}
                  <button type="button" onClick={() => setShowPrivacy(true)} className="text-[#1DB954] hover:underline">
                    سیاست حریم خصوصی
                  </button>{' '}
                  موافقم
                </label>
              </div>
              {errors.acceptPrivacy && <p className="text-red-400 text-xs">{errors.acceptPrivacy}</p>}

              <button type="submit" disabled={isLoading} className="w-full btn-primary disabled:opacity-60">
                {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm space-y-2">
              <p className="text-[#B3B3B3]">
                هنرمند هستید؟{' '}
                <Link href="/register?type=artist" className="text-[#1DB954] hover:underline">ثبت‌نام هنرمند</Link>
              </p>
              <p className="text-[#B3B3B3]">
                حساب دارید؟{' '}
                <Link href={ROUTES.login} className="text-[#1DB954] hover:underline">وارد شوید</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
