import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('ایمیل الزامی است'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('فرمت ایمیل نادرست است'); return }

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <>
      <Head><title>بازیابی رمز عبور | SoundWave</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">🎵 SoundWave</h1>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            {submitted ? (
              <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-xl font-bold text-white mb-2">ایمیل ارسال شد</h2>
                <p className="text-muted text-sm mb-6">
                  اگر این ایمیل در سامانه ثبت شده باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.
                </p>
                <Link href="/login" className="text-primary hover:underline text-sm">
                  بازگشت به صفحه ورود
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 text-center">بازیابی رمز عبور</h2>
                <p className="text-muted text-sm text-center mb-6">
                  ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
                </p>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted mb-1">ایمیل</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
                      dir="ltr"
                    />
                    {error && <p className="text-error text-xs mt-1">{error}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    {isLoading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    بازگشت به ورود
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
