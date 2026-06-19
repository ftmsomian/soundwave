import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { STORAGE_KEYS } from '@/constants'
import { getFromStorage, setToStorage } from '@/mock'
import type { IArtist } from '@/types'

export default function ArtistRegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    artistName: '',
    email: '',
    password: '',
    portfolioUrl: '', // نمونه‌کار
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.artistName.trim()) e.artistName = 'نام هنری الزامی است'
    if (!form.email.trim()) e.email = 'ایمیل الزامی است'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'فرمت ایمیل نادرست است'
    if (!form.password) e.password = 'رمز عبور الزامی است'
    else if (form.password.length < 6) e.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    if (!form.portfolioUrl.trim()) e.portfolioUrl = 'لینک نمونه‌کار الزامی است'
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    const existing = getFromStorage<IArtist>(STORAGE_KEYS.ARTISTS)
    if (existing.find((a) => a.email === form.email)) {
      setErrors({ email: 'این ایمیل قبلاً ثبت شده است' })
      setIsLoading(false)
      return
    }

    const newArtist: IArtist = {
      id: `artist_${Date.now()}`,
      username: `artist_${Math.floor(Math.random() * 90000) + 10000}`,
      displayName: form.artistName,
      artistName: form.artistName,
      email: form.email,
      passwordHash: form.password,
      role: 'artist',
      subscription: 'free',
      status: 'pending',
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      dailyStreamCount: 0,
      totalStreams: 0,
      uniqueListeners: 0,
      monthlyEarnings: 0,
      createdAt: new Date().toISOString(),
    }

    setToStorage(STORAGE_KEYS.ARTISTS, [...existing, newArtist])
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newArtist))

    setIsLoading(false)
    router.push('/artist-dashboard')
  }

  const inputClass = (field: string) =>
  `w-full bg-[#282828] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors ${
    errors[field] ? 'border-red-500' : 'border-gray-700'
  }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">🎵 SoundWave</h1>
          <p className="text-muted mt-2 text-sm">ثبت‌نام هنرمند</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">نام هنری</label>
              <input
                type="text"
                value={form.artistName}
                onChange={(e) => set('artistName', e.target.value)}
                placeholder="مثلاً: شجریان"
                className={inputClass('artistName')}
              />
              {errors.artistName && <p className="text-error text-xs mt-1">{errors.artistName}</p>}
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">ایمیل</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="artist@email.com"
                className={inputClass('email')}
                dir="ltr"
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">رمز عبور</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className={inputClass('password')}
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">لینک نمونه‌کار (SoundCloud, Spotify و...)</label>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => set('portfolioUrl', e.target.value)}
                placeholder="https://..."
                className={inputClass('portfolioUrl')}
                dir="ltr"
              />
              {errors.portfolioUrl && <p className="text-error text-xs mt-1">{errors.portfolioUrl}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors mt-6"
            >
              {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام و ارسال درخواست'}
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm">
             <Link href="/login" className="text-primary hover:underline">بازگشت به صفحه ورود</Link>
          </div>
        </div>
      </div>
    </div>
  )
}