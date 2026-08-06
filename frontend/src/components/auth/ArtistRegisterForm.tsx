import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'

export default function ArtistRegisterForm() {
  const router = useRouter()
  const { registerArtist } = useAuth()
  const [form, setForm] = useState({ artistName: '', email: '', password: '', portfolioUrl: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.artistName.trim())                        e.artistName   = 'نام هنری الزامی است'
    if (!form.email.trim())                             e.email        = 'ایمیل الزامی است'
    else if (!/\S+@\S+\.\S+/.test(form.email))         e.email        = 'فرمت ایمیل نادرست است'
    if (!form.password)                                 e.password     = 'رمز عبور الزامی است'
    else if (form.password.length < 6)                  e.password     = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    if (!form.portfolioUrl.trim())                      e.portfolioUrl = 'لینک نمونه‌کار الزامی است'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const result = await registerArtist({
      artistName: form.artistName,
      email: form.email,
      password: form.password,
      portfolioUrl: form.portfolioUrl,
    })
    setIsLoading(false)

    if (!result.success) {
      const mapped: Record<string, string> = {}
      if (result.fieldErrors?.email) mapped.email = result.fieldErrors.email
      if (result.fieldErrors?.artist_name) mapped.artistName = result.fieldErrors.artist_name
      if (result.fieldErrors?.portfolio_url) mapped.portfolioUrl = result.fieldErrors.portfolio_url
      if (result.fieldErrors?.password) mapped.password = result.fieldErrors.password
      setErrors(Object.keys(mapped).length > 0 ? mapped : { email: result.error ?? 'خطا در ثبت‌نام' })
      return
    }

    // نکته: بک‌اند برای هنرمندِ در وضعیت pending توکن نمی‌ده، پس اینجا لاگین نمی‌شیم؛
    // پیام موفقیت نشون می‌دیم و کاربر رو به صفحه‌ی ورود می‌فرستیم (بعد از تأیید پشتیبان/مدیر).
    setSubmitted(true)
  }

  const inputClass = (field: string) =>
    `w-full bg-[#3E3E3E] border rounded-lg px-4 py-3 text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-colors ${
      errors[field] ? 'border-red-500' : 'border-[#535353]'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1DB954]">🎵 SoundWave</h1>
          <p className="text-[#B3B3B3] mt-2 text-sm">ثبت‌نام هنرمند</p>
        </div>

        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-white mb-2">درخواست شما ثبت شد</h2>
              <p className="text-[#B3B3B3] text-sm mb-6">
                حساب هنرمند شما در وضعیت «در انتظار تأیید» است. پس از بررسی و تأیید توسط پشتیبانی یا مدیر سامانه،
                می‌توانید از همین صفحه‌ی ورود وارد شوید.
              </p>
              <Link href={ROUTES.login} className="btn-primary inline-block px-6 py-3">
                بازگشت به صفحه ورود
              </Link>
            </div>
          ) : (
          <>
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3 mb-5 text-sm text-yellow-200">
            ⏳ حساب هنرمند پس از بررسی توسط مدیر فعال می‌شود.
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm text-[#B3B3B3] mb-1">نام هنری</label>
              <input type="text" value={form.artistName} onChange={e => set('artistName', e.target.value)}
                placeholder="مثلاً: شجریان" className={inputClass('artistName')} />
              {errors.artistName && <p className="text-red-400 text-xs mt-1">{errors.artistName}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#B3B3B3] mb-1">ایمیل</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="artist@email.com" className={inputClass('email')} dir="ltr" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#B3B3B3] mb-1">رمز عبور</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="حداقل ۶ کاراکتر" className={inputClass('password')} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#B3B3B3] mb-1">لینک نمونه‌کار (SoundCloud, Spotify و...)</label>
              <input type="url" value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)}
                placeholder="https://..." className={inputClass('portfolioUrl')} dir="ltr" />
              {errors.portfolioUrl && <p className="text-red-400 text-xs mt-1">{errors.portfolioUrl}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary disabled:opacity-60 mt-2">
              {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام و ارسال درخواست'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link href={ROUTES.login} className="text-[#1DB954] hover:underline">بازگشت به صفحه ورود</Link>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
