import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { ROUTES } from '@/constants'
import { apiResetPassword, ApiError } from '@/lib/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { uid, token } = router.query

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (typeof uid !== 'string' || typeof token !== 'string') {
      setError('لینک بازیابی نامعتبر است. لطفاً دوباره از صفحه‌ی فراموشی رمز عبور اقدام کنید.')
      return
    }
    if (!password || password.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد'); return }
    if (password !== confirmPassword)     { setError('رمزها یکسان نیستند'); return }

    setIsLoading(true)
    try {
      await apiResetPassword({ uid, token, newPassword: password })
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'لینک بازیابی نامعتبر یا منقضی شده است.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head><title>تعیین رمز جدید | SoundWave</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1DB954]">🎵 SoundWave</h1>
          </div>
          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-8">
            {done ? (
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-white mb-2">رمز عبور تغییر کرد</h2>
                <p className="text-[#B3B3B3] text-sm mb-6">اکنون می‌توانید با رمز جدید وارد شوید.</p>
                <Link href={ROUTES.login} className="btn-primary inline-block px-6 py-3">بازگشت به صفحه ورود</Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 text-center">تعیین رمز جدید</h2>
                <p className="text-[#B3B3B3] text-sm text-center mb-6">رمز عبور جدید خود را وارد کنید.</p>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#B3B3B3] mb-1">رمز عبور جدید</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="حداقل ۶ کاراکتر"
                      className="input-field"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#B3B3B3] mb-1">تکرار رمز عبور</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="رمز عبور را تکرار کنید"
                      className="input-field"
                      autoComplete="new-password"
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button type="submit" disabled={isLoading} className="w-full btn-primary disabled:opacity-60">
                    {isLoading ? 'در حال ثبت...' : 'تغییر رمز عبور'}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm">
                  <Link href={ROUTES.login} className="text-[#1DB954] hover:underline">بازگشت به ورود</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
