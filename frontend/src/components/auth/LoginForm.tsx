import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import { STORAGE_KEYS } from '@/constants'

// صفحه مقصد بعد از لاگین بر اساس نقش
const ROLE_REDIRECT: Record<UserRole, string> = {
  listener: '/',
  artist:   '/artist-dashboard',
  support:  '/admin/tickets',
  admin:    '/admin/tickets',
}

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.trim()) { setError('ایمیل الزامی است'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('فرمت ایمیل نادرست است'); return }
    if (!password) { setError('رمز عبور الزامی است'); return }

    setIsLoading(true)
    // شبیه‌سازی تأخیر شبکه
    await new Promise((r) => setTimeout(r, 400))

    const result = login(email, password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'خطای ناشناخته')
      return
    }

    // خواندن نقش از localStorage
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
    const loggedUser = raw ? JSON.parse(raw) : null
    const redirect = loggedUser ? ROLE_REDIRECT[loggedUser.role as UserRole] : '/'
    router.push(redirect)
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* لوگو */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">🎵 SoundWave</h1>
          <p className="text-muted mt-2 text-sm">وارد حساب کاربری خود شوید</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">ورود</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* ایمیل */}
            <div>
              <label className="block text-sm text-muted mb-1" htmlFor="email">
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-[#282828] border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"                autoComplete="email"
                dir="ltr"
              />
            </div>

            {/* رمز عبور */}
            <div>
              <label className="block text-sm text-muted mb-1" htmlFor="password">
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="w-full bg-[#282828] border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
                autoComplete="current-password"
              />
            </div>

            {/* خطا */}
            {error && (
              <p className="text-error text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* دکمه ورود */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>

          {/* لینک‌های پایین */}
          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              رمز عبور را فراموش کردید؟
            </Link>
            <p className="text-muted">
              حساب ندارید؟{' '}
              <Link href="/register" className="text-primary hover:underline">
                ثبت‌نام کنید
              </Link>
            </p>
          </div>

          {/* راهنمای تست - فقط در development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs text-muted mb-2">🧪 حساب‌های تست:</p>
              <div className="space-y-1 text-xs text-gray-400">
                <p>ali@test.com / 123456 — کاربر طلایی</p>
                <p>delaram@test.com / 123456 — هنرمند</p>
                <p>support@test.com / support123 — پشتیبان</p>
                <p>admin@test.com / admin123 — مدیر</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
