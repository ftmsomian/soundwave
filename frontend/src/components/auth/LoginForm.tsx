import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import { ROUTES } from '@/constants'

const ROLE_REDIRECT: Record<UserRole, string> = {
  user:    ROUTES.home,
  artist:  '/artist/manage',
  support: ROUTES.admin,
  admin:   ROUTES.admin,
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

    if (!email.trim())                    { setError('ایمیل الزامی است'); return }
    if (!/\S+@\S+\.\S+/.test(email))     { setError('فرمت ایمیل نادرست است'); return }
    if (!password)                        { setError('رمز عبور الزامی است'); return }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'خطای ناشناخته')
      return
    }

    const redirect = result.user ? ROLE_REDIRECT[result.user.role as UserRole] : ROUTES.home
    router.push(redirect)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1DB954]">🎵 SoundWave</h1>
          <p className="text-[#B3B3B3] mt-2 text-sm">وارد حساب کاربری خود شوید</p>
        </div>

        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">ورود</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm text-[#B3B3B3] mb-1" htmlFor="email">ایمیل</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="input-field"
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm text-[#B3B3B3] mb-1" htmlFor="password">رمز عبور</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <Link href={ROUTES.forgotPassword} className="text-[#1DB954] hover:underline">
              رمز عبور را فراموش کردید؟
            </Link>
            <p className="text-[#B3B3B3]">
              حساب ندارید؟{' '}
              <Link href={ROUTES.register} className="text-[#1DB954] hover:underline">ثبت‌نام کنید</Link>
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 border-t border-[#282828] pt-4">
              <p className="text-xs text-[#B3B3B3] mb-2">🧪 حساب‌های تست (رمز: test123):</p>
              <div className="space-y-1 text-xs text-[#535353]">
                <p>user.free@test.com — کاربر رایگان</p>
                <p>user.silver@test.com — کاربر نقره‌ای</p>
                <p>user.gold@test.com — کاربر طلایی</p>
                <p>artist@test.com — هنرمند</p>
                <p>support@test.com — پشتیبان</p>
                <p>admin@test.com — مدیر</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
